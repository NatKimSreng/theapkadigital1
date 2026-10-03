<?php

namespace App\Models;

use Closure;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $package_id
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
    protected $with = ['package'];

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
     * @return BelongsTo<Package, $this>
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    /**
     * @return HasMany<Rsvp, $this>
     */
    public function rsvps(): HasMany
    {
        return $this->hasMany(Rsvp::class);
    }

    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * The package whose limits apply: the purchased one, or the free plan.
     */
    public function plan(): Package
    {
        return $this->package ?? Package::default();
    }

    public function canAddGuest(): bool
    {
        $limit = $this->plan()->guest_limit;

        return $limit === null || $this->guests()->count() < $limit;
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
     * Loads just what invite_links needs, the active invitation first.
     *
     * @return array<string, Closure>
     */
    public static function withInviteLinks(): array
    {
        return ['invitations' => fn ($query) => $query
            ->select(['id', 'event_id', 'template', 'is_active', 'public_id'])
            ->orderByDesc('is_active')
            ->oldest('id')];
    }

    /**
     * Each invitation's public link, for the admin to open or copy.
     *
     * @return Attribute<array<int, array{id: int, template: string, active: bool, url: string}>, never>
     */
    protected function inviteLinks(): Attribute
    {
        return Attribute::get(fn (): array => $this->invitations
            ->map(fn (Invitation $invitation): array => [
                'id' => $invitation->id,
                'template' => $invitation->template,
                'active' => $invitation->is_active,
                'url' => route('invitations.share', $invitation->public_id),
            ])
            ->values()
            ->all());
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
                        // Sums from the query, not columns of Expense.
                        'estimated' => (float) $row->getAttribute('estimated'),
                        'actual' => (float) $row->getAttribute('actual'),
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
