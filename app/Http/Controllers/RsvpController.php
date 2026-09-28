<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Guest;
use App\Models\Invitation;
use App\Models\Rsvp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class RsvpController extends Controller
{
    /**
     * The host's list of replies and wishes.
     */
    public function index(Event $event): Response
    {
        Gate::authorize('manage', $event);

        $rsvps = $event->rsvps()->latest('updated_at')->get();

        return Inertia::render('events/rsvps', [
            'event' => $event,
            'rsvps' => $rsvps,
            'counts' => [
                'attending' => $rsvps->where('attending', true)->count(),
                'declined' => $rsvps->where('attending', false)->count(),
                'wishes' => $rsvps->whereNotNull('message')->count(),
            ],
        ]);
    }

    /**
     * A reply sent from a public invitation. On a guest's personal link the
     * reply updates that guest; otherwise the guest types their name.
     */
    public function store(Request $request, Invitation $invitation): RedirectResponse
    {
        $event = $invitation->event;

        $guest = $request->filled('guest')
            ? $event->guests()->where('invite_code', $request->string('guest'))->first()
            : null;

        $validated = $request->validate([
            'name' => [$guest ? 'nullable' : 'required', 'string', 'max:120'],
            'attending' => ['required', 'boolean'],
            'message' => ['nullable', 'string', 'max:1000'],
        ]);

        $data = [
            'name' => $guest->name ?? $validated['name'],
            'attending' => (bool) $validated['attending'],
            'message' => $validated['message'] ?? null,
        ];

        DB::transaction(function () use ($event, $guest, $data) {
            if ($guest instanceof Guest) {
                $event->rsvps()->updateOrCreate(['guest_id' => $guest->id], $data);
                $guest->update(['status' => $data['attending'] ? 'confirmed' : 'declined']);
            } else {
                $event->rsvps()->create($data);
            }
        });

        return back();
    }

    public function destroy(Event $event, Rsvp $rsvp): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $rsvp->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.deleted']);

        return back();
    }
}
