<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $status = in_array($status, Order::STATUSES, true) ? $status : null;

        return Inertia::render('admin/orders', [
            'orders' => Order::query()
                ->when($status, fn ($query) => $query->where('status', $status))
                ->with(['user:id,name,email', 'package:id,name', 'event:id,name', 'reviewer:id,name'])
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'status' => $status,
            'counts' => Order::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
        ]);
    }

    /**
     * The uploaded payment receipt, kept on the private disk.
     */
    public function receipt(Order $order): StreamedResponse
    {
        abort_unless($order->receipt_path && Storage::disk('local')->exists($order->receipt_path), 404);

        return Storage::disk('local')->response($order->receipt_path);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([Order::APPROVED, Order::REJECTED])],
            'admin_note' => ['nullable', 'string', 'max:500'],
        ]);

        if ($order->status !== Order::PENDING) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'toast.order_reviewed']);

            return back();
        }

        $validated['status'] === Order::APPROVED
            ? $order->approve($request->user(), $validated['admin_note'] ?? null)
            : $order->reject($request->user(), $validated['admin_note'] ?? null);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }
}
