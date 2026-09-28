<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string|null $name_km
 * @property string|null $description
 * @property string|null $description_km
 * @property float $price
 * @property int|null $guest_limit
 * @property int|null $event_limit
 * @property bool $premium_templates
 * @property bool $remove_branding
 * @property bool $is_default
 * @property bool $is_featured
 * @property bool $is_active
 * @property int $sort_order
 */
#[Fillable([
    'name', 'name_km', 'description', 'description_km', 'price', 'guest_limit', 'event_limit',
    'premium_templates', 'remove_branding', 'is_featured', 'is_active', 'sort_order',
])]
class Package extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'float',
            'guest_limit' => 'integer',
            'event_limit' => 'integer',
            'premium_templates' => 'boolean',
            'remove_branding' => 'boolean',
            'is_default' => 'boolean',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * The free plan every event without a paid package falls back to. When no
     * default exists, an unsaved package without limits is returned.
     */
    public static function default(): self
    {
        return self::query()->where('is_default', true)->first() ?? new self([
            'name' => 'Free',
            'premium_templates' => true,
            'remove_branding' => false,
        ]);
    }

    /**
     * @param  Builder<self>  $query
     */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('price');
    }

    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * @return HasMany<Event, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
