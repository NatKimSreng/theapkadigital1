<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Package;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));

        return Inertia::render('admin/users', [
            'users' => User::query()
                ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")))
                ->withCount(['events', 'orders'])
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'search' => $search,
        ]);
    }

    public function show(User $user): Response
    {
        return Inertia::render('admin/user', [
            'user' => $user->loadCount(['events', 'orders']),
            'events' => $user->events()
                ->with(Event::withInviteLinks())
                ->withCount('guests')
                ->latest()
                ->get()
                ->each(fn (Event $event) => $event->append('invite_links')->makeHidden('invitations')),
            'orders' => $user->orders()->with(['package:id,name', 'event:id,name'])->latest()->get(),
            'packages' => Package::query()->ordered()->get(['id', 'name', 'is_default']),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'disabled' => ['sometimes', 'boolean'],
            'is_admin' => ['sometimes', 'boolean'],
        ]);

        // Admins cannot lock themselves out.
        if ($user->is($request->user())) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'toast.not_yourself']);

            return back();
        }

        if (array_key_exists('disabled', $validated)) {
            $user->disabled_at = $validated['disabled'] ? now() : null;
        }

        if (array_key_exists('is_admin', $validated)) {
            $user->is_admin = $validated['is_admin'];
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    /**
     * Message a Telegram user through the login bot. Telegram only lets the
     * bot write to people who allowed it when they logged in.
     */
    public function telegram(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate(['message' => ['required', 'string', 'max:2000']]);
        $token = config('services.telegram.bot_token');

        if ($user->telegram_id === null || blank($token)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'toast.telegram_unavailable']);

            return back();
        }

        $response = Http::timeout(10)
            ->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $user->telegram_id,
                'text' => $validated['message'],
            ]);

        if (! $response->successful()) {
            $reason = (string) $response->json('description', 'HTTP '.$response->status());
            Log::warning('Telegram message failed', ['user' => $user->id, 'error' => $reason]);
            Inertia::flash('toast', ['type' => 'error', 'message' => 'toast.telegram_not_sent', 'params' => ['reason' => $reason]]);

            return back();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.telegram_sent']);

        return back();
    }

    /**
     * Give an event a package without an order, e.g. a gift or a refund fix.
     */
    public function updateEventPackage(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'package_id' => ['nullable', Rule::exists('packages', 'id')],
        ]);

        $packageId = $validated['package_id'] ?? null;

        // Choosing the free plan is stored as "no package".
        if ($packageId && Package::whereKey($packageId)->value('is_default')) {
            $packageId = null;
        }

        $event->forceFill(['package_id' => $packageId])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }
}
