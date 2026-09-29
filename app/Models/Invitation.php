<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $event_id
 * @property string $public_id
 * @property string $template
 * @property array<string, mixed>|null $settings
 * @property bool $is_active
 */
#[Fillable(['template', 'settings', 'is_active'])]
class Invitation extends Model
{
    /**
     * Templates that can be added to an event, keyed by template id.
     * The designs themselves live in resources/js/components/invitation/templates.ts.
     */
    public const TEMPLATES = [
        'paper-frame',
        'royal-wedding',
        'golden-engagement',
        'blossom-birthday',
        'modern-housewarming',
        'classic-anniversary',
        'angkor-cinematic',
        'lotus-garden',
    ];

    /**
     * Templates that need a package with premium templates.
     */
    public const PREMIUM_TEMPLATES = ['royal-wedding', 'classic-anniversary', 'angkor-cinematic', 'lotus-garden'];

    public const MAX_PER_EVENT = 2;

    public const MEDIA = ['cover', 'background', 'frame', 'music', 'map', 'khqr_usd', 'khqr_khr'];

    public const MAX_GALLERY = 16;

    protected $appends = ['media'];

    protected static function booted(): void
    {
        static::creating(function (Invitation $invitation) {
            $invitation->public_id ??= (string) Str::ulid();
        });

        static::deleting(function (Invitation $invitation) {
            foreach (self::MEDIA as $key) {
                $invitation->deleteMedia($key);
            }

            Storage::disk('public')->delete($invitation->galleryPaths());
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Public URLs of uploaded files, with the gallery as an ordered list.
     *
     * @return Attribute<array{cover: string|null, background: string|null, frame: string|null, music: string|null, map: string|null, khqr_usd: string|null, khqr_khr: string|null, gallery: list<string>}, never>
     */
    protected function media(): Attribute
    {
        return Attribute::get(function (): array {
            $disk = Storage::disk('public');
            $url = fn (string $key): ?string => ($path = $this->settings["{$key}_path"] ?? null) ? $disk->url($path) : null;

            return [
                'cover' => $url('cover'),
                'background' => $url('background'),
                'frame' => $url('frame'),
                'music' => $url('music'),
                'map' => $url('map'),
                'khqr_usd' => $url('khqr_usd'),
                'khqr_khr' => $url('khqr_khr'),
                'gallery' => array_map(fn (string $path) => $disk->url($path), $this->galleryPaths()),
            ];
        });
    }

    /**
     * @return list<string>
     */
    public function galleryPaths(): array
    {
        return array_values(array_filter($this->settings['gallery_paths'] ?? [], 'is_string'));
    }

    public function deleteMedia(string $key): void
    {
        $path = $this->settings["{$key}_path"] ?? null;

        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
