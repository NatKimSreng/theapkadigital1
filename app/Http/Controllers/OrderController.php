<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Order;
use App\Models\Package;
use App\Models\Setting;
use App\Support\Seo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * The public price list.
     */
    public function pricing(Request $request): Response
    {
        $packages = Package::query()->where('is_active', true)->ordered()->get();

        return Inertia::render('pricing', [
            'packages' => $packages,
            'eventId' => $request->integer('event') ?: null,
        ])->withViewData('seo', Seo::page(
            title: __('Pricing'),
            description: __('Theapka plans for digital wedding invitations, guest lists and gift tracking. Start free; paid plans from $:price.', [
                'price' => rtrim(rtrim(number_format((float) $packages->where('price', '>', 0)->min('price'), 2), '0'), '.'),
            ]),
            schema: [[
                '@context' => 'https://schema.org',
                '@type' => 'Product',
                'name' => Seo::siteName(),
                'description' => __('Digital wedding invitations and event planning'),
                'offers' => $packages->map(fn (Package $package) => [
                    '@type' => 'Offer',
                    'name' => $package->name,
                    'price' => number_format($package->price, 2, '.', ''),
                    'priceCurrency' => 'USD',
                    'url' => route('pricing'),
                ])->all(),
            ]],
        ));
    }

    /**
     * Payment instructions and the receipt upload for one package.
     */
    public function checkout(Request $request, Package $package): Response|RedirectResponse
    {
        if (! $this->purchasable($package)) {
            return to_route('pricing');
        }

        $user = $request->user();

        return Inertia::render('checkout', [
            'package' => $package,
            'events' => $user->events()->latest()->get(['id', 'name', 'package_id', 'event_date']),
            'pendingEventIds' => $user->orders()->where('status', Order::PENDING)->pluck('event_id'),
            'selectedEventId' => $request->integer('event') ?: null,
            'payment' => $this->paymentDetails(),
            'methods' => Order::PAYMENT_METHODS,
        ]);
    }

    public function store(Request $request, Package $package): RedirectResponse
    {
        abort_unless($this->purchasable($package), 404);

        $user = $request->user();

        $validated = $request->validate([
            'event_id' => ['required', Rule::exists('events', 'id')->where('user_id', $user->id)],
            'payment_method' => ['required', Rule::in(Order::PAYMENT_METHODS)],
            'reference' => ['nullable', 'string', 'max:100'],
            'receipt' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:20480'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $event = Event::query()->whereKey($validated['event_id'])->firstOrFail();

        if ($event->orders()->where('status', Order::PENDING)->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'toast.order_pending']);

            return back();
        }

        $user->orders()->create([
            ...Arr::except($validated, 'receipt'),
            'package_id' => $package->id,
            'amount' => $package->price,
            'receipt_path' => $request->file('receipt')->store('receipts', 'local'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.order_sent']);

        return to_route('orders.index');
    }

    /**
     * The customer's own orders.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('orders', [
            'orders' => $request->user()->orders()
                ->with(['event:id,name', 'package:id,name,name_km'])
                ->latest()
                ->get(),
        ]);
    }

    private function purchasable(Package $package): bool
    {
        return $package->is_active && ! $package->is_default && $package->price > 0;
    }

    /**
     * @return array<string, string|null>
     */
    private function paymentDetails(): array
    {
        return Setting::payment();
    }
}
