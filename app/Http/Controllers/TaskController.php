<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Event $event): Response
    {
        Gate::authorize('manage', $event);

        return Inertia::render('events/tasks', [
            'event' => $event,
            'tasks' => $event->tasks()
                ->orderBy('done')
                ->orderByRaw('due_date is null, due_date')
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request, Event $event): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $event->tasks()->create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    public function update(Request $request, Event $event, Task $task): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $task->update($this->validated($request, partial: true));

        return back();
    }

    public function destroy(Event $event, Task $task): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $task->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.deleted']);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, bool $partial = false): array
    {
        return $request->validate([
            'title' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'due_date' => ['nullable', 'date'],
            'done' => ['sometimes', 'boolean'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);
    }
}
