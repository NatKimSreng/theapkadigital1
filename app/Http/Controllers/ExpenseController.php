<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Expense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Event $event): Response
    {
        Gate::authorize('manage', $event);

        return Inertia::render('events/expenses', [
            'event' => $event,
            'expenses' => $event->expenses()->latest()->get(),
        ]);
    }

    public function store(Request $request, Event $event): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $event->expenses()->create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    public function update(Request $request, Event $event, Expense $expense): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $expense->update($this->validated($request, partial: true));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    public function destroy(Event $event, Expense $expense): RedirectResponse
    {
        Gate::authorize('manage', $event);

        $expense->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.deleted']);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        $data = $request->validate([
            'title' => [$required, 'string', 'max:255'],
            'category' => [$required, Rule::in(Expense::CATEGORIES)],
            'vendor' => ['nullable', 'string', 'max:255'],
            'estimated_amount' => ['nullable', 'numeric', 'min:0'],
            'actual_amount' => ['nullable', 'numeric', 'min:0'],
            'paid' => ['sometimes', 'boolean'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        foreach (['estimated_amount', 'actual_amount'] as $key) {
            if (array_key_exists($key, $data) || ! $partial) {
                $data[$key] ??= 0;
            }
        }

        return $data;
    }
}
