<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
 */
#[Fillable(['name', 'phone', 'side', 'group', 'status', 'party_size', 'note'])]
class Guest extends Model
{
    public const STATUSES = ['pending', 'confirmed', 'declined'];

    public const SIDES = ['groom', 'bride', 'both'];

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
}
