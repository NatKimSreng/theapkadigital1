<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    /**
     * List the user's events.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('events/index', [
            'events' => $request->user()->events()
                ->withCount('guests')
                ->orderByDesc('event_date')
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Send the user to their most recent event, or to the event list.
     */
    public function dashboard(Request $request): RedirectResponse
    {
        $event = $request->user()->events()->latest()->first();

        return $event
            ? to_route('events.show', $event)
            : to_route('events.index');
    }

    public function store(Request $request): RedirectResponse
    {
        if (! $request->user()->canCreateEvent()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'toast.event_limit']);

            return to_route('pricing');
        }

        $event = $request->user()->events()->create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.event_created']);

        return to_route('events.show', $event);
    }

    /**
     * The event dashboard.
     */
    public function show(Event $event): Response
    {
        Gate::authorize('manage', $event);

        return Inertia::render('events/show', [
            'event' => $event,
            'summary' => $event->summary(),
        ]);
    }

    public function update(Request $request, Event $event): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $event->update($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    public function destroy(Event $event): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $event->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.deleted']);

        return to_route('events.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:wedding,engagement,birthday,housewarming,ceremony,other'],
            'groom_name' => ['nullable', 'string', 'max:255'],
            'bride_name' => ['nullable', 'string', 'max:255'],
            'event_date' => ['nullable', 'date'],
            'venue' => ['nullable', 'string', 'max:255'],
            'exchange_rate' => ['required', 'integer', 'min:1', 'max:100000'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $data['budget'] ??= 0;

        return $data;
    }
}
