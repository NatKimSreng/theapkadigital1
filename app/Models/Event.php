<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $type
 * @property string|null $groom_name
 * @property string|null $bride_name
 * @property Carbon|null $event_date
 * @property string|null $venue
 * @property int $exchange_rate
 * @property string $budget
 * @property string|null $description
 */
#[Fillable(['name', 'type', 'groom_name', 'bride_name', 'event_date', 'venue', 'exchange_rate', 'budget', 'description'])]
class Event extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'event_date' => 'date:Y-m-d',
            'exchange_rate' => 'integer',
            'budget' => 'float',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Guest, $this>
     */
    public function guests(): HasMany
    {
        return $this->hasMany(Guest::class);
    }

    /**
     * @return HasMany<Gift, $this>
     */
    public function gifts(): HasMany
    {
        return $this->hasMany(Gift::class);
    }

    /**
     * @return HasMany<Expense, $this>
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * @return HasMany<Task, $this>
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * @return HasMany<Invitation, $this>
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    /**
     * Summary figures used by the event dashboard.
     *
     * @return array<string, mixed>
     */
    public function summary(): array
    {
        $giftUsd = (float) $this->gifts()->sum('amount_usd');
        $giftKhr = (int) $this->gifts()->sum('amount_khr');
        $giftTotal = $giftUsd + ($this->exchange_rate > 0 ? $giftKhr / $this->exchange_rate : 0);

        $estimated = (float) $this->expenses()->sum('estimated_amount');
        $actual = (float) $this->expenses()->sum('actual_amount');

        $guestsByStatus = $this->guests()
            ->selectRaw('status, count(*) as total, sum(party_size) as people')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        return [
            'guests' => [
                'total' => (int) $guestsByStatus->sum('total'),
                'people' => (int) $guestsByStatus->sum('people'),
                'confirmed' => (int) ($guestsByStatus['confirmed']->total ?? 0),
                'pending' => (int) ($guestsByStatus['pending']->total ?? 0),
                'declined' => (int) ($guestsByStatus['declined']->total ?? 0),
            ],
            'gifts' => [
                'count' => $this->gifts()->count(),
                'usd' => $giftUsd,
                'khr' => $giftKhr,
                'total_usd' => round($giftTotal, 2),
            ],
            'expenses' => [
                'estimated' => $estimated,
                'actual' => $actual,
                'budget' => (float) $this->budget,
                'by_category' => $this->expenses()
                    ->selectRaw('category, sum(estimated_amount) as estimated, sum(actual_amount) as actual')
                    ->groupBy('category')
                    ->get()
                    ->map(fn ($row) => [
                        'category' => $row->category,
                        'estimated' => (float) $row->estimated,
                        'actual' => (float) $row->actual,
                    ])
                    ->values(),
            ],
            'tasks' => [
                'total' => $this->tasks()->count(),
                'done' => $this->tasks()->where('done', true)->count(),
            ],
            'balance' => round($giftTotal - $actual, 2),
        ];
    }
}
