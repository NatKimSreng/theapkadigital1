<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EventTest extends TestCase
{
    use RefreshDatabase;

    private function eventFor(User $user): Event
    {
        return $user->events()->create([
            'name' => 'Wedding',
            'exchange_rate' => 4000,
            'budget' => 1000,
        ]);
    }

    public function test_user_can_create_an_event()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('events.store'), [
                'name' => 'Our wedding',
                'type' => 'wedding',
                'exchange_rate' => 4100,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('events', [
            'user_id' => $user->id,
            'name' => 'Our wedding',
            'exchange_rate' => 4100,
        ]);
    }

    public function test_dashboard_summarises_guests_gifts_and_expenses()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);

        $event->guests()->create(['name' => 'A', 'status' => 'confirmed', 'party_size' => 2]);
        $event->guests()->create(['name' => 'B', 'status' => 'pending', 'party_size' => 1]);
        $event->gifts()->create(['giver_name' => 'A', 'amount_usd' => 50, 'amount_khr' => 200000]);
        $event->expenses()->create(['title' => 'Venue', 'category' => 'venue', 'estimated_amount' => 500, 'actual_amount' => 30]);

        $this->actingAs($user)
            ->get(route('events.show', $event))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('events/show')
                ->where('summary.guests.total', 2)
                ->where('summary.guests.confirmed', 1)
                ->where('summary.guests.people', 3)
                ->where('summary.gifts.total_usd', 100)
                ->where('summary.expenses.actual', 30)
                ->where('summary.balance', 70)
            );
    }

    public function test_user_can_manage_guests()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);

        $this->actingAs($user)
            ->post(route('events.guests.store', $event), [
                'name' => 'Dara',
                'side' => 'groom',
                'status' => 'pending',
                'party_size' => 2,
            ])
            ->assertRedirect();

        $guest = $event->guests()->firstOrFail();

        $this->patch(route('events.guests.update', [$event, $guest]), ['status' => 'confirmed'])
            ->assertRedirect();

        $this->assertSame('confirmed', $guest->fresh()->status);

        $this->delete(route('events.guests.destroy', [$event, $guest]))->assertRedirect();

        $this->assertDatabaseMissing('guests', ['id' => $guest->id]);
    }

    public function test_users_cannot_access_other_users_events()
    {
        $owner = User::factory()->create();
        $event = $this->eventFor($owner);

        $this->actingAs(User::factory()->create())
            ->get(route('events.show', $event))
            ->assertForbidden();

        $this->post(route('events.gifts.store', $event), [
            'giver_name' => 'Intruder',
            'amount_usd' => 10,
            'method' => 'cash',
        ])->assertForbidden();
    }

    public function test_nested_records_must_belong_to_the_event()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $other = $this->eventFor(User::factory()->create());
        $guest = $other->guests()->create(['name' => 'X']);

        $this->actingAs($user)
            ->delete(route('events.guests.destroy', [$event, $guest]))
            ->assertNotFound();
    }
}
