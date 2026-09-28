<?php

namespace Tests\Feature;

use App\Models\Invitation;
use App\Models\Rsvp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RsvpTest extends TestCase
{
    use RefreshDatabase;

    private function invitation(?User $owner = null): Invitation
    {
        $event = ($owner ?? User::factory()->create())->events()->create(['name' => 'Wedding']);

        return $event->invitations()->create(['template' => 'paper-frame', 'settings' => [], 'is_active' => true]);
    }

    public function test_guest_on_a_personal_link_can_reply_and_the_guest_list_updates()
    {
        $invitation = $this->invitation();
        $guest = $invitation->event->guests()->create(['name' => 'Dara']);

        $this->post(route('invitations.rsvp', $invitation->public_id), [
            'guest' => $guest->invite_code,
            'attending' => true,
            'message' => 'Congratulations!',
        ])->assertRedirect();

        $this->assertSame('confirmed', $guest->fresh()->status);
        $this->assertDatabaseHas('rsvps', [
            'guest_id' => $guest->id,
            'name' => 'Dara',
            'attending' => true,
            'message' => 'Congratulations!',
        ]);

        // Changing the answer updates the same reply instead of adding one.
        $this->post(route('invitations.rsvp', $invitation->public_id), [
            'guest' => $guest->invite_code,
            'attending' => false,
        ]);

        $this->assertSame('declined', $guest->fresh()->status);
        $this->assertSame(1, Rsvp::count());
    }

    public function test_public_link_replies_need_a_name()
    {
        $invitation = $this->invitation();

        $this->post(route('invitations.rsvp', $invitation->public_id), ['attending' => true])
            ->assertSessionHasErrors('name');

        $this->post(route('invitations.rsvp', $invitation->public_id), [
            'name' => 'Sokha',
            'attending' => true,
            'message' => 'See you there',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('rsvps', ['guest_id' => null, 'name' => 'Sokha']);
    }

    public function test_invite_codes_from_other_events_are_ignored()
    {
        $invitation = $this->invitation();
        $stranger = $this->invitation()->event->guests()->create(['name' => 'Other']);

        $this->post(route('invitations.rsvp', $invitation->public_id), [
            'guest' => $stranger->invite_code,
            'attending' => true,
        ])->assertSessionHasErrors('name');

        $this->assertSame('pending', $stranger->fresh()->status);
    }

    public function test_personal_link_shows_the_guests_earlier_reply()
    {
        $invitation = $this->invitation();
        $guest = $invitation->event->guests()->create(['name' => 'Dara']);
        $invitation->event->rsvps()->create(['guest_id' => $guest->id, 'name' => 'Dara', 'attending' => true]);

        $this->get(route('invitations.guest', $guest->invite_code))
            ->assertInertia(fn (Assert $page) => $page
                ->where('rsvp.guest', $guest->invite_code)
                ->where('rsvp.reply.attending', true)
            );
    }

    public function test_host_sees_replies_and_others_cannot()
    {
        $owner = User::factory()->create();
        $event = $this->invitation($owner)->event;
        $event->rsvps()->create(['name' => 'Sokha', 'attending' => true, 'message' => 'Hi']);
        $event->rsvps()->create(['name' => 'Kim', 'attending' => false]);

        $this->actingAs($owner)
            ->get(route('events.rsvps.index', $event))
            ->assertInertia(fn (Assert $page) => $page
                ->component('events/rsvps')
                ->has('rsvps', 2)
                ->where('counts.attending', 1)
                ->where('counts.declined', 1)
                ->where('counts.wishes', 1)
            );

        $this->actingAs(User::factory()->create())
            ->get(route('events.rsvps.index', $event))
            ->assertForbidden();
    }

    public function test_new_users_can_use_the_app_without_verifying_their_email()
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)->get(route('events.index'))->assertOk();
    }

    public function test_host_can_delete_a_reply()
    {
        $owner = User::factory()->create();
        $event = $this->invitation($owner)->event;
        $rsvp = $event->rsvps()->create(['name' => 'Spam', 'attending' => true]);

        $this->actingAs($owner)
            ->delete(route('events.rsvps.destroy', [$event, $rsvp]))
            ->assertRedirect();

        $this->assertModelMissing($rsvp);
    }
}
