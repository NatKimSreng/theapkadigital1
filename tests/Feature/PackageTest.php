<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Order;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PackageTest extends TestCase
{
    use RefreshDatabase;

    private function eventFor(User $user): Event
    {
        return $user->events()->create(['name' => 'Wedding', 'exchange_rate' => 4000]);
    }

    private function premium(): Package
    {
        return Package::where('name', 'Premium')->firstOrFail();
    }

    public function test_pricing_page_lists_active_packages()
    {
        Package::where('name', 'VIP')->update(['is_active' => false]);

        $this->get(route('pricing'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('pricing')
                ->has('packages', 3)
            );
    }

    public function test_free_plan_limits_the_number_of_events()
    {
        $user = User::factory()->create();
        $this->eventFor($user);

        $this->actingAs($user)
            ->post(route('events.store'), ['name' => 'Second', 'type' => 'wedding', 'exchange_rate' => 4000])
            ->assertRedirect(route('pricing'));

        $this->assertSame(1, $user->events()->count());
    }

    public function test_paid_events_do_not_count_toward_the_free_event_limit()
    {
        $user = User::factory()->create();
        $this->eventFor($user)->forceFill(['package_id' => $this->premium()->id])->save();

        $this->actingAs($user)
            ->post(route('events.store'), ['name' => 'Second', 'type' => 'wedding', 'exchange_rate' => 4000])
            ->assertRedirect();

        $this->assertSame(2, $user->events()->count());
    }

    public function test_guest_limit_comes_from_the_events_package()
    {
        Package::where('is_default', true)->update(['guest_limit' => 1]);
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $event->guests()->create(['name' => 'First']);

        $guest = ['name' => 'Second', 'side' => 'groom', 'status' => 'pending', 'party_size' => 1];

        $this->actingAs($user)->post(route('events.guests.store', $event), $guest);
        $this->assertSame(1, $event->guests()->count());

        $event->forceFill(['package_id' => $this->premium()->id])->save();

        $this->post(route('events.guests.store', $event), $guest);
        $this->assertSame(2, $event->guests()->count());
    }

    public function test_premium_templates_need_a_package_that_unlocks_them()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);

        $this->actingAs($user)->post(route('events.invitations.store', $event), ['template' => 'royal-wedding']);
        $this->assertSame(0, $event->invitations()->count());

        $event->forceFill(['package_id' => $this->premium()->id])->save();

        $this->post(route('events.invitations.store', $event), ['template' => 'royal-wedding']);
        $this->assertSame(1, $event->invitations()->count());
    }

    public function test_any_paid_plan_unlocks_every_template_without_a_limit()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $cheapest = Package::query()->where('price', '>', 0)->orderBy('price')->firstOrFail();
        $cheapest->update(['premium_templates' => false]);
        $event->forceFill(['package_id' => $cheapest->id])->save();

        foreach (['royal-wedding', 'paper-frame', 'golden-engagement', 'emerald-velvet'] as $template) {
            $this->actingAs($user)->post(route('events.invitations.store', $event), ['template' => $template]);
        }

        $this->assertSame(4, $event->invitations()->count());

        $this->get(route('events.templates', $event))
            ->assertInertia(fn (Assert $page) => $page
                ->where('max', null)
                ->where('premiumUnlocked', true));
    }

    public function test_free_plan_keeps_the_two_template_limit()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);

        foreach (['paper-frame', 'golden-engagement', 'blossom-birthday'] as $template) {
            $this->actingAs($user)->post(route('events.invitations.store', $event), ['template' => $template]);
        }

        $this->assertSame(2, $event->invitations()->count());
    }

    public function test_customer_can_order_a_package_with_a_receipt()
    {
        Storage::fake('local');
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $package = $this->premium();

        $this->actingAs($user)
            ->post(route('checkout.store', $package), [
                'event_id' => $event->id,
                'payment_method' => 'aba',
                'reference' => 'TX123',
                'receipt' => UploadedFile::fake()->image('receipt.jpg'),
            ])
            ->assertRedirect(route('orders.index'));

        $order = Order::firstOrFail();

        $this->assertSame(Order::PENDING, $order->status);
        $this->assertSame(19.0, $order->amount);
        Storage::disk('local')->assertExists($order->receipt_path);
        $this->assertNull($event->fresh()->package_id);
    }

    public function test_customers_cannot_order_for_someone_elses_event()
    {
        Storage::fake('local');
        $other = $this->eventFor(User::factory()->create());

        $this->actingAs(User::factory()->create())
            ->post(route('checkout.store', $this->premium()), [
                'event_id' => $other->id,
                'payment_method' => 'aba',
                'receipt' => UploadedFile::fake()->image('receipt.jpg'),
            ])
            ->assertSessionHasErrors('event_id');

        $this->assertSame(0, Order::count());
    }

    public function test_admin_pages_are_only_for_admins()
    {
        $this->actingAs(User::factory()->create())
            ->get(route('admin.dashboard'))
            ->assertForbidden();

        $this->actingAs(User::factory()->create(['is_admin' => true]))
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('admin/dashboard'));
    }

    public function test_approving_an_order_upgrades_the_event()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $order = $user->orders()->create([
            'event_id' => $event->id,
            'package_id' => $this->premium()->id,
            'amount' => 19,
            'payment_method' => 'aba',
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.orders.update', $order), ['status' => 'approved'])
            ->assertRedirect();

        $this->assertSame(Order::APPROVED, $order->fresh()->status);
        $this->assertSame($this->premium()->id, $event->fresh()->package_id);

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertInertia(fn (Assert $page) => $page->where('stats.revenue', 19)->where('stats.paid_events', 1));
    }

    public function test_rejecting_an_order_keeps_the_free_plan()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $order = $user->orders()->create([
            'event_id' => $event->id,
            'package_id' => $this->premium()->id,
            'amount' => 19,
            'payment_method' => 'aba',
        ]);

        $this->actingAs($admin)->patch(route('admin.orders.update', $order), [
            'status' => 'rejected',
            'admin_note' => 'Amount did not match',
        ]);

        $this->assertSame(Order::REJECTED, $order->fresh()->status);
        $this->assertNull($event->fresh()->package_id);
    }

    public function test_disabled_users_are_signed_out()
    {
        $user = User::factory()->create(['disabled_at' => now()]);

        $this->actingAs($user)
            ->get(route('events.index'))
            ->assertRedirect(route('login'));

        $this->assertGuest();
    }

    public function test_admins_cannot_disable_themselves()
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->patch(route('admin.users.update', $admin), ['disabled' => true]);

        $this->assertNull($admin->fresh()->disabled_at);
    }

    public function test_packages_with_orders_cannot_be_deleted()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create();
        $user->orders()->create([
            'event_id' => $this->eventFor($user)->id,
            'package_id' => $this->premium()->id,
            'amount' => 19,
            'payment_method' => 'aba',
        ]);

        $this->actingAs($admin)->delete(route('admin.packages.destroy', $this->premium()));

        $this->assertModelExists($this->premium());
    }

    public function test_public_invitation_shows_branding_only_on_the_free_plan()
    {
        $event = $this->eventFor(User::factory()->create());
        $invitation = $event->invitations()->create(['template' => 'paper-frame', 'settings' => []]);

        $this->get(route('invitations.share', $invitation->public_id))
            ->assertInertia(fn (Assert $page) => $page->where('branding', true));

        $event->forceFill(['package_id' => $this->premium()->id])->save();

        $this->get(route('invitations.share', $invitation->public_id))
            ->assertInertia(fn (Assert $page) => $page->where('branding', false));
    }
}
