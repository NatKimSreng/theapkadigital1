<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Gift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GiftController extends Controller
{
    public function index(Event $event): Response
    {
        Gate::authorize('manage', $event);

        return Inertia::render('events/gifts', [
            'event' => $event,
            'gifts' => $event->gifts()->latest()->get(),
            'guests' => $event->guests()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request, Event $event): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $event->gifts()->create($this->validated($request, $event));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    public function update(Request $request, Event $event, Gift $gift): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $gift->update($this->validated($request, $event));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    public function destroy(Event $event, Gift $gift): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $gift->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.deleted']);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, Event $event): array
    {
        $data = $request->validate([
            'guest_id' => ['nullable', Rule::exists('guests', 'id')->where('event_id', $event->id)],
            'giver_name' => ['required', 'string', 'max:255'],
            'amount_usd' => ['nullable', 'numeric', 'min:0'],
            'amount_khr' => ['nullable', 'integer', 'min:0'],
            'method' => ['required', Rule::in(Gift::METHODS)],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $data['amount_usd'] ??= 0;
        $data['amount_khr'] ??= 0;

        return $data;
    }
}
