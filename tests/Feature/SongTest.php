<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Song;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SongTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    private function upload(User $admin, string $title): Song
    {
        $this->actingAs($admin)
            ->post(route('admin.songs.store'), [
                'title' => $title,
                'file' => UploadedFile::fake()->create("{$title}.mp3", 3000, 'audio/mpeg'),
            ])
            ->assertSessionHasNoErrors();

        return Song::query()->where('title', $title)->firstOrFail();
    }

    private function eventFor(User $user): Event
    {
        return $user->events()->create(['name' => 'Wedding', 'exchange_rate' => 4000]);
    }

    public function test_admins_build_the_library_and_choose_the_default()
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $first = $this->upload($admin, 'Pinpeat');
        $second = $this->upload($admin, 'Mohori');

        Storage::disk('public')->assertExists($first->path);
        $this->assertTrue($first->is_default);
        $this->assertFalse($second->is_default);

        $this->actingAs($admin)->patch(route('admin.songs.update', $second), ['is_default' => true]);
        $this->assertFalse($first->refresh()->is_default);
        $this->assertTrue($second->refresh()->is_default);

        // Deleting the default hands it to the song that is left.
        $this->actingAs($admin)->delete(route('admin.songs.destroy', $second));
        Storage::disk('public')->assertMissing($second->path);
        $this->assertTrue($first->refresh()->is_default);

        $this->actingAs(User::factory()->create())
            ->get(route('admin.songs.index'))
            ->assertForbidden();
    }

    public function test_invitations_play_the_chosen_song_or_the_default()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $default = $this->upload($admin, 'Pinpeat');
        $chosen = $this->upload($admin, 'Mohori');

        $user = User::factory()->create();
        $event = $this->eventFor($user);
        $invitation = $event->invitations()->create(['template' => 'paper-frame']);

        $this->assertSame($default->url, $invitation->media['song']);

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'settings' => json_encode(['song' => $chosen->id]),
            ])
            ->assertSessionHasNoErrors();
        $this->assertSame($chosen->url, $invitation->refresh()->media['song']);

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'settings' => json_encode(['song' => 'none']),
            ])
            ->assertSessionHasNoErrors();
        $this->assertNull($invitation->refresh()->media['song']);

        $this->actingAs($user)
            ->put(route('events.invitations.update', [$event, $invitation]), [
                'settings' => json_encode(['song' => 99999]),
            ])
            ->assertSessionHasErrors('settings.song');
    }

    public function test_each_template_plays_its_theme_song()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $default = $this->upload($admin, 'Piano');
        $roneat = $this->upload($admin, 'Roneat');
        $angkor = $this->upload($admin, 'Angkor Dawn');

        $this->actingAs($admin)
            ->patch(route('admin.songs.update', $roneat), ['templates' => ['naga-gold', 'golden-prasat']])
            ->assertSessionHasNoErrors();

        // A template has one theme song, so taking one moves it.
        $this->actingAs($admin)
            ->patch(route('admin.songs.update', $angkor), ['templates' => ['golden-prasat']])
            ->assertSessionHasNoErrors();
        $this->assertSame(['naga-gold'], $roneat->refresh()->templates);
        $this->assertSame(['golden-prasat'], $angkor->refresh()->templates);

        $this->actingAs($admin)
            ->patch(route('admin.songs.update', $angkor), ['templates' => ['no-such-template']])
            ->assertSessionHasErrors('templates.0');

        $event = $this->eventFor(User::factory()->create());
        $naga = $event->invitations()->create(['template' => 'naga-gold']);
        $prasat = $event->invitations()->create(['template' => 'golden-prasat']);
        $paper = $event->invitations()->create(['template' => 'paper-frame']);
        $picked = $event->invitations()->create(['template' => 'naga-gold', 'settings' => ['song' => $default->id]]);

        $this->assertSame($roneat->url, $naga->media['song']);
        $this->assertSame($angkor->url, $prasat->media['song']);
        $this->assertSame($default->url, $paper->media['song']);
        // The couple's own pick wins over the theme song.
        $this->assertSame($default->url, $picked->media['song']);
    }
}
