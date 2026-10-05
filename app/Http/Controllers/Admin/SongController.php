<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\Song;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The music library couples choose their invitation song from.
 */
class SongController extends Controller
{
    private const MAX_KB = 15360;

    public function index(): Response
    {
        return Inertia::render('admin/songs', [
            'songs' => Song::query()->orderByDesc('is_default')->orderBy('title')->get(),
            'maxMb' => self::MAX_KB / 1024,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'artist' => ['nullable', 'string', 'max:120'],
            // mimes checks the detected type: AAC shows as "adts" and some M4A as "mp4".
            'file' => ['required', 'file', 'mimes:mp3,mpga,m4a,mp4,aac,adts,ogg,oga,wav', 'extensions:mp3,m4a,aac,ogg,wav', 'max:'.self::MAX_KB],
        ]);

        Song::query()->create([
            'title' => $validated['title'],
            'artist' => $validated['artist'] ?? null,
            'path' => $request->file('file')->store('songs', 'public'),
            // The first song becomes the default, so invitations get music at once.
            'is_default' => ! Song::query()->exists(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.song_added']);

        return back();
    }

    public function update(Request $request, Song $song): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:120'],
            'artist' => ['sometimes', 'nullable', 'string', 'max:120'],
            'is_default' => ['sometimes', 'boolean'],
            // The templates this song is the theme song of.
            'templates' => ['sometimes', 'array'],
            'templates.*' => ['string', Rule::in(Invitation::TEMPLATES)],
        ]);

        if (isset($validated['templates'])) {
            $validated['templates'] = array_values(array_unique($validated['templates']));
        }

        DB::transaction(function () use ($song, $validated) {
            if ($validated['is_default'] ?? false) {
                Song::query()->whereKeyNot($song->id)->update(['is_default' => false]);
            }

            // A template has one theme song, so taking one moves it here.
            if ($taken = $validated['templates'] ?? []) {
                Song::query()->whereKeyNot($song->id)->get()->each(function (Song $other) use ($taken) {
                    $left = array_values(array_diff($other->templates ?? [], $taken));

                    if ($left !== ($other->templates ?? [])) {
                        $other->update(['templates' => $left]);
                    }
                });
            }

            $song->update($validated);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    public function destroy(Song $song): RedirectResponse
    {
        Storage::disk('public')->delete($song->path);
        $song->delete();

        // Keep a default while any song is left.
        if ($song->is_default && ($next = Song::query()->oldest()->first())) {
            $next->update(['is_default' => true]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.song_deleted']);

        return back();
    }
}
