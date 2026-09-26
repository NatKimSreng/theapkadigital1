<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $event_id
 * @property string $title
 * @property string $category
 * @property string|null $vendor
 * @property float $estimated_amount
 * @property float $actual_amount
 * @property bool $paid
 * @property string|null $note
 */
#[Fillable(['title', 'category', 'vendor', 'estimated_amount', 'actual_amount', 'paid', 'note'])]
class Expense extends Model
{
    public const CATEGORIES = ['venue', 'food', 'decoration', 'attire', 'photo', 'music', 'invitation', 'transport', 'ceremony', 'other'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'estimated_amount' => 'float',
            'actual_amount' => 'float',
            'paid' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
