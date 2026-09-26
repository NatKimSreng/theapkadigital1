<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_users_without_events_are_sent_to_the_event_list()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('events.index'));
    }

    public function test_users_with_events_are_sent_to_their_latest_event()
    {
        $user = User::factory()->create();
        $event = $user->events()->create(['name' => 'Wedding', 'exchange_rate' => 4000]);
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('events.show', $event));
    }
}
