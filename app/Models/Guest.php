<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $event_id
 * @property string $name
 * @property string|null $phone
 * @property string $side
 * @property string|null $group
 * @property string $status
 * @property int $party_size
 * @property string|null $note
 * @property string $invite_code
 * @property CarbonInterface|null $invite_sent_at
 */
#[Fillable(['name', 'phone', 'side', 'group', 'status', 'party_size', 'note'])]
class Guest extends Model
{
    public const STATUSES = ['pending', 'confirmed', 'declined'];

    public const SIDES = ['groom', 'bride', 'both'];

    protected $appends = ['invite_url'];

    protected static function booted(): void
    {
        static::creating(function (Guest $guest) {
            $guest->invite_code ??= self::newInviteCode();
        });
    }

    /**
     * A short, unguessable code for the guest's personal invitation link.
     */
    public static function newInviteCode(): string
    {
        do {
            $code = Str::lower(Str::random(8));
        } while (self::where('invite_code', $code)->exists());

        return $code;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'invite_sent_at' => 'datetime',
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
     * @return HasMany<Gift, $this>
     */
    public function gifts(): HasMany
    {
        return $this->hasMany(Gift::class);
    }

    /**
     * @return Attribute<string|null, never>
     */
    protected function inviteUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->invite_code
            ? route('invitations.guest', $this->invite_code)
            : null);
    }
}
