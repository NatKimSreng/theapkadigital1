<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InvitationTest extends TestCase
{
    use RefreshDatabase;

    private function eventFor(User $user): Event
    {
        return $user->events()->create(['name' => 'Wedding', 'bride_name' => 'Sokha', 'event_date' => '2026-12-12']);
    }

    public function test_user_can_add_a_template_and_first_one_becomes_active()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);

        $this->actingAs($user)
            ->post(route('events.invitations.store', $event), ['template' => 'golden-engagement'])
            ->assertRedirect();

        $this->actingAs($user)
            ->post(route('events.invitations.store', $event), ['template' => 'royal-wedding'])
            ->assertRedirect();

        $this->assertTrue($event->invitations()->where('template', 'golden-engagement')->value('is_active'));
        $this->assertFalse($event->invitations()->where('template', 'royal-wedding')->value('is_active'));
    }

    public function test_templates_are_limited_per_event_and_cannot_be_added_twice()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);

        $event->invitations()->create(['template' => 'royal-wedding']);

        $this->actingAs($user)
            ->post(route('events.invitations.store', $event), ['template' => 'royal-wedding'])
            ->assertSessionHasErrors('template');

        $this->actingAs($user)
            ->post(route('events.invitations.store', $event), ['template' => 'not-a-template'])
            ->assertSessionHasErrors('template');

        $event->invitations()->create(['template' => 'golden-engagement']);

        $this->actingAs($user)
            ->post(route('events.invitations.store', $event), ['template' => 'blossom-birthday']);

        $this->assertSame(Invitation::MAX_PER_EVENT, $event->invitations()->count());
    }

    public function test_user_can_update_settings_and_upload_media()
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $invitation = $event->invitations()->create(['template' => 'royal-wedding']);

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'settings' => ['texts' => ['km' => ['title' => 'Our day']], 'primary_color' => '#aabbcc', 'gold_text' => '1'],
                'cover' => UploadedFile::fake()->image('cover.jpg'),
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $invitation->refresh();
        $this->assertSame('Our day', $invitation->settings['texts']['km']['title']);
        $this->assertTrue($invitation->settings['gold_text']);
        Storage::disk('public')->assertExists($invitation->settings['cover_path']);

        $path = $invitation->settings['cover_path'];

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), ['remove_cover' => '1'])
            ->assertSessionHasNoErrors();

        Storage::disk('public')->assertMissing($path);
        $this->assertNull($invitation->refresh()->media['cover']);
        $this->assertSame('Our day', $invitation->settings['texts']['km']['title']);
    }

    public function test_editor_json_payload_saves_agenda_gallery_and_khqr()
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $invitation = $event->invitations()->create([
            'template' => 'royal-wedding',
            'settings' => ['agenda' => [['time' => '7:00', 'km' => 'old', 'en' => 'old']]],
        ]);

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'settings' => json_encode([
                    'texts' => ['km' => ['thanks' => 'សូមអរគុណ'], 'en' => ['thanks' => 'Thanks']],
                    'agenda' => [['time' => '5:00 PM', 'km' => 'ទទួលភ្ញៀវ', 'en' => 'Reception']],
                    'hide_hosts' => true,
                    'map_url' => 'https://maps.app.goo.gl/abc',
                    'language' => 'en',
                ]),
                'gallery' => [UploadedFile::fake()->image('p1.jpg'), UploadedFile::fake()->image('p2.jpg')],
                'khqr_usd' => UploadedFile::fake()->image('qr.png'),
            ])
            ->assertSessionHasNoErrors();

        $invitation->refresh();
        $this->assertSame('Reception', $invitation->settings['agenda'][0]['en']);
        $this->assertCount(1, $invitation->settings['agenda']);
        $this->assertTrue($invitation->settings['hide_hosts']);
        $this->assertSame('en', $invitation->settings['language']);
        $this->assertCount(2, $invitation->media['gallery']);
        $this->assertNotNull($invitation->media['khqr_usd']);
        $this->assertNull($invitation->media['map']);

        $first = $invitation->settings['gallery_paths'][0];

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'remove_gallery' => [$first, 'invitations/other/not-mine.jpg'],
            ])
            ->assertSessionHasNoErrors();

        Storage::disk('public')->assertMissing($first);
        $this->assertCount(1, $invitation->refresh()->settings['gallery_paths']);

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'settings' => json_encode(['agenda' => []]),
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame([], $invitation->refresh()->settings['agenda']);
    }

    public function test_invalid_map_url_and_language_are_rejected()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $invitation = $event->invitations()->create(['template' => 'royal-wedding']);

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'settings' => ['map_url' => 'javascript:alert(1)', 'language' => 'fr'],
            ])
            ->assertSessionHasErrors(['settings.map_url', 'settings.language']);
    }

    public function test_paper_frame_template_saves_parents_time_and_bank_details()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);

        $this->actingAs($user)
            ->post(route('events.invitations.store', $event), ['template' => 'paper-frame'])
            ->assertSessionHasNoErrors();

        $invitation = $event->invitations()->firstOrFail();

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'settings' => json_encode([
                    'texts' => ['en' => ['groom_parents' => 'Mr. Som
Mrs. Srun']],
                    'event_time' => '17:00',
                    'show_countdown' => false,
                    'gift' => ['usd' => ['name' => 'Chhou', 'number' => '008423562', 'link' => 'https://pay.ababank.com/x']],
                ]),
            ])
            ->assertSessionHasNoErrors();

        $settings = $invitation->refresh()->settings;
        $this->assertSame('17:00', $settings['event_time']);
        $this->assertFalse($settings['show_countdown']);
        $this->assertSame('008423562', $settings['gift']['usd']['number']);
        $this->assertStringContainsString('Mrs. Srun', $settings['texts']['en']['groom_parents']);

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'settings' => ['event_time' => '25:99', 'gift' => ['khr' => ['link' => 'http://insecure.test']]],
            ])
            ->assertSessionHasErrors(['settings.event_time', 'settings.gift.khr.link']);
    }

    public function test_opening_animation_and_effect_are_validated()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $invitation = $event->invitations()->create(['template' => 'paper-frame']);

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'settings' => json_encode(['opening' => 'curtain', 'effect' => 'hearts']),
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame('curtain', $invitation->refresh()->settings['opening']);

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'settings' => ['opening' => 'explode', 'effect' => 'fireworks'],
            ])
            ->assertSessionHasErrors(['settings.opening', 'settings.effect']);
    }

    public function test_music_upload_accepts_common_audio_files()
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $invitation = $event->invitations()->create(['template' => 'paper-frame']);

        $songs = [
            'song.mp3' => 'audio/mpeg',
            'song.m4a' => 'audio/mp4',
            'song.ogg' => 'audio/ogg',
            'song.wav' => 'audio/wav',
            'song.aac' => 'audio/aac',
            'memo.m4a' => 'video/mp4',
        ];

        foreach ($songs as $name => $mime) {
            $this->actingAs($user)
                ->put(route('events.invitations.update', [$event, $invitation]), [
                    'music' => UploadedFile::fake()->create($name, 4000, $mime),
                ])
                ->assertSessionHasNoErrors();

            Storage::disk('public')->assertExists($invitation->refresh()->settings['music_path']);
        }

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'music' => UploadedFile::fake()->create('virus.exe', 100, 'application/x-msdownload'),
            ])
            ->assertSessionHasErrors('music');

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'music' => UploadedFile::fake()->create('huge.mp3', 16000, 'audio/mpeg'),
            ])
            ->assertSessionHasErrors('music');
    }

    public function test_editor_receives_upload_limits()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $event->invitations()->create(['template' => 'paper-frame']);

        $this->actingAs($user)
            ->get(route('events.invitations.index', $event))
            ->assertInertia(fn (Assert $page) => $page
                ->where('uploadLimits.music', fn ($bytes) => $bytes > 0 && $bytes <= 15 * 1024 * 1024)
                ->where('uploadLimits.image', fn ($bytes) => $bytes > 0 && $bytes <= 5 * 1024 * 1024)
                ->where('uploadLimits.total', fn ($bytes) => $bytes > 0)
            );
    }

    public function test_invalid_colour_is_rejected()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $invitation = $event->invitations()->create(['template' => 'royal-wedding']);

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'settings' => ['primary_color' => 'red'],
            ])
            ->assertSessionHasErrors('settings.primary_color');
    }

    public function test_activating_and_deleting_moves_the_active_flag()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $first = $event->invitations()->create(['template' => 'royal-wedding', 'is_active' => true]);
        $second = $event->invitations()->create(['template' => 'golden-engagement']);

        $this->actingAs($user)
            ->post(route('events.invitations.activate', [$event, $second]))
            ->assertRedirect();

        $this->assertFalse($first->refresh()->is_active);
        $this->assertTrue($second->refresh()->is_active);

        $this->actingAs($user)
            ->delete(route('events.invitations.destroy', [$event, $second]))
            ->assertRedirect();

        $this->assertTrue($first->refresh()->is_active);
    }

    public function test_other_users_cannot_manage_invitations()
    {
        $event = $this->eventFor(User::factory()->create());
        $invitation = $event->invitations()->create(['template' => 'royal-wedding']);
        $intruder = User::factory()->create();

        $this->actingAs($intruder)->get(route('events.invitations.index', $event))->assertForbidden();
        $this->actingAs($intruder)->get(route('events.templates', $event))->assertForbidden();
        $this->actingAs($intruder)
            ->put(route('events.invitations.update', [$event, $invitation]), ['settings' => ['hide_hosts' => true]])
            ->assertForbidden();
    }

    public function test_editor_and_catalog_pages_render()
    {
        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $invitation = $event->invitations()->create(['template' => 'royal-wedding', 'is_active' => true]);

        $this->actingAs($user)
            ->get(route('events.invitations.index', $event))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('events/invitations')
                ->where('selectedId', $invitation->id)
                ->has('invitations', 1)
            );

        $this->actingAs($user)
            ->get(route('events.templates', $event))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('events/templates')
                ->where('added.royal-wedding', $invitation->id)
                ->where('max', Invitation::MAX_PER_EVENT)
            );
    }

    public function test_public_page_shows_invitation_without_private_event_data()
    {
        $event = $this->eventFor(User::factory()->create());
        $invitation = $event->invitations()->create(['template' => 'royal-wedding', 'settings' => ['texts' => ['en' => ['title' => 'Hello']]]]);

        $this->get(route('invitations.share', ['invitation' => $invitation->public_id, 'to' => 'Dara', 'lang' => 'en']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('invitation')
                ->where('guestName', 'Dara')
                ->where('invitation.settings.texts.en.title', 'Hello')
                ->where('lang', 'en')
                ->where('event.bride_name', 'Sokha')
                ->where('event.event_date', '2026-12-12')
                ->missing('event.budget')
                ->missing('event.user_id')
            );
    }
}
