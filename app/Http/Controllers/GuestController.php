<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Guest;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GuestController extends Controller
{
    public function index(Event $event): Response
    {
        Gate::authorize('manage', $event);

        return Inertia::render('events/guests', [
            'event' => $event,
            'guests' => $event->guests()->withSum('gifts', 'amount_usd')->latest()->get(),
            'inviteReady' => $event->invitations()->exists(),
        ]);
    }

    /**
     * Record that the guest's personal invitation link was copied or shared.
     */
    public function markSent(Event $event, Guest $guest): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $guest->invite_sent_at ??= now();
        $guest->save();

        return back();
    }

    /**
     * The guest's invitation link as a QR code.
     */
    public function qr(Event $event, Guest $guest): HttpResponse
    {
        Gate::authorize('manage', $event);

        $svg = (new Writer(new ImageRenderer(
            new RendererStyle(512, 2),
            new SvgImageBackEnd,
        )))->writeString((string) $guest->invite_url);

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }

    public function store(Request $request, Event $event): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $event->guests()->create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    public function update(Request $request, Event $event, Guest $guest): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $guest->update($this->validated($request, partial: true));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    public function destroy(Event $event, Guest $guest): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $guest->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.deleted']);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'side' => [$required, Rule::in(Guest::SIDES)],
            'group' => ['nullable', 'string', 'max:100'],
            'status' => [$required, Rule::in(Guest::STATUSES)],
            'party_size' => [$required, 'integer', 'min:1', 'max:100'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);
    }
}
