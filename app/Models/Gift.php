<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $event_id
 * @property int|null $guest_id
 * @property string $giver_name
 * @property float $amount_usd
 * @property int $amount_khr
 * @property string $method
 * @property string|null $note
 */
#[Fillable(['guest_id', 'giver_name', 'amount_usd', 'amount_khr', 'method', 'note'])]
class Gift extends Model
{
    public const METHODS = ['cash', 'aba', 'acleda', 'wing', 'other'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount_usd' => 'float',
            'amount_khr' => 'integer',
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
     * @return BelongsTo<Guest, $this>
     */
    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }
}
