<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GuestInviteTest extends TestCase
{
    use RefreshDatabase;

    private function eventFor(User $user): Event
    {
        return $user->events()->create(['name' => 'Wedding', 'event_date' => '2026-12-12']);
    }

    public function test_each_guest_gets_a_unique_personal_link()
    {
        $event = $this->eventFor(User::factory()->create());
        $dara = $event->guests()->create(['name' => 'Dara']);
        $sokha = $event->guests()->create(['name' => 'Sokha']);

        $this->assertMatchesRegularExpression('/^[a-z0-9]{8}$/', $dara->invite_code);
        $this->assertNotSame($dara->invite_code, $sokha->invite_code);
        $this->assertSame(route('invitations.guest', $dara->invite_code), $dara->invite_url);
    }

    public function test_personal_link_opens_the_invitation_in_use_with_the_guest_name()
    {
        $event = $this->eventFor(User::factory()->create());
        $event->invitations()->create(['template' => 'royal-wedding']);
        $event->invitations()->create(['template' => 'paper-frame', 'is_active' => true]);
        $guest = $event->guests()->create(['name' => 'លោក ទិវ រិទ្ធីរក្ស']);

        $this->get($guest->invite_url)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('invitation')
                ->where('guestName', 'លោក ទិវ រិទ្ធីរក្ស')
                ->where('invitation.template', 'paper-frame')
            );
    }

    public function test_personal_link_is_not_found_without_an_invitation_or_with_a_wrong_code()
    {
        $event = $this->eventFor(User::factory()->create());
        $guest = $event->guests()->create(['name' => 'Dara']);

        $this->get($guest->invite_url)->assertNotFound();
        $this->get('/invite/notacode')->assertNotFound();
    }

    public function test_owner_can_get_qr_code_and_mark_invite_sent()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $guest = $event->guests()->create(['name' => 'Dara']);

        $this->actingAs($user)
            ->get(route('events.guests.qr', [$event, $guest]))
            ->assertOk()
            ->assertHeader('Content-Type', 'image/svg+xml');

        $this->actingAs($user)
            ->post(route('events.guests.sent', [$event, $guest]))
            ->assertRedirect();

        $sentAt = $guest->refresh()->invite_sent_at;
        $this->assertNotNull($sentAt);

        $this->travel(1)->hour();
        $this->actingAs($user)->post(route('events.guests.sent', [$event, $guest]));
        $this->assertTrue($sentAt->equalTo($guest->refresh()->invite_sent_at));
    }

    public function test_guest_list_says_whether_an_invitation_exists()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $event->guests()->create(['name' => 'Dara']);

        $this->actingAs($user)
            ->get(route('events.guests.index', $event))
            ->assertInertia(fn (Assert $page) => $page
                ->where('inviteReady', false)
                ->where('guests.0.invite_url', fn ($url) => str_contains($url, '/invite/'))
            );

        $event->invitations()->create(['template' => 'paper-frame']);

        $this->actingAs($user)
            ->get(route('events.guests.index', $event))
            ->assertInertia(fn (Assert $page) => $page->where('inviteReady', true));
    }

    public function test_other_users_cannot_get_qr_or_mark_sent()
    {
        $event = $this->eventFor(User::factory()->create());
        $guest = $event->guests()->create(['name' => 'Dara']);
        $intruder = User::factory()->create();

        $this->actingAs($intruder)->get(route('events.guests.qr', [$event, $guest]))->assertForbidden();
        $this->actingAs($intruder)->post(route('events.guests.sent', [$event, $guest]))->assertForbidden();
        $this->assertNull($guest->refresh()->invite_sent_at);
    }
}
