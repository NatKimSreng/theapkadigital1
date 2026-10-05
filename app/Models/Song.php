<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * A song in the site's music library, which couples can pick for their
 * invitation. When a couple picks none, the song set as their template's
 * theme song plays, or else the default song.
 *
 * @property int $id
 * @property string $title
 * @property string|null $artist
 * @property string $path
 * @property bool $is_default
 * @property list<string>|null $templates The templates this is the theme song of.
 */
#[Fillable(['title', 'artist', 'path', 'is_default', 'templates'])]
class Song extends Model
{
    protected $appends = ['url'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['is_default' => 'boolean', 'templates' => 'array'];
    }

    /**
     * @return Attribute<string, never>
     */
    protected function url(): Attribute
    {
        return Attribute::get(fn (): string => Storage::disk('public')->url($this->path));
    }

    /**
     * The song an invitation plays from the library: the couple's pick, or
     * when they picked none their template's theme song, or the default;
     * nothing when they turned music off.
     */
    public static function urlFor(mixed $choice, ?string $template = null): ?string
    {
        if ($choice === 'none') {
            return null;
        }

        // The library is small, so one query serves every invitation on a page.
        $songs = once(fn () => self::query()->orderBy('id')->get());

        $song = is_numeric($choice) ? $songs->firstWhere('id', (int) $choice) : null;
        $song ??= $songs->first(fn (self $song) => in_array($template, $song->templates ?? [], true));
        $song ??= $songs->firstWhere('is_default', true);

        return $song?->url;
    }
}
