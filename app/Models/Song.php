<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * A song in the site's music library, which couples can pick for their
 * invitation. The default song plays when a couple picks none.
 *
 * @property int $id
 * @property string $title
 * @property string|null $artist
 * @property string $path
 * @property bool $is_default
 */
#[Fillable(['title', 'artist', 'path', 'is_default'])]
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
        return ['is_default' => 'boolean'];
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
     * the default when they picked none, or nothing when they turned it off.
     */
    public static function urlFor(mixed $choice): ?string
    {
        if ($choice === 'none') {
            return null;
        }

        $song = is_numeric($choice) ? self::query()->find((int) $choice) : null;
        $song ??= once(fn () => self::query()->where('is_default', true)->first());

        return $song?->url;
    }
}
