<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $user_id
 * @property int $event_id
 * @property int $package_id
 * @property float $amount
 * @property string $status
 * @property string $payment_method
 * @property string|null $reference
 * @property string|null $receipt_path
 * @property string|null $note
 * @property string|null $admin_note
 * @property int|null $reviewed_by
 * @property Carbon|null $reviewed_at
 * @property Carbon|null $created_at
 */
#[Fillable(['event_id', 'package_id', 'amount', 'payment_method', 'reference', 'receipt_path', 'note'])]
class Order extends Model
{
    public const PENDING = 'pending';

    public const APPROVED = 'approved';

    public const REJECTED = 'rejected';

    public const STATUSES = [self::PENDING, self::APPROVED, self::REJECTED];

    public const PAYMENT_METHODS = ['aba', 'khqr', 'bank', 'cash'];

    protected static function booted(): void
    {
        static::deleting(function (Order $order) {
            if ($order->receipt_path) {
                Storage::disk('local')->delete($order->receipt_path);
            }
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
            'amount' => 'float',
            'reviewed_at' => 'datetime',
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
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * @return BelongsTo<Package, $this>
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Accept the payment and give the event the purchased package.
     */
    public function approve(User $admin, ?string $note = null): void
    {
        DB::transaction(function () use ($admin, $note) {
            $this->forceFill([
                'status' => self::APPROVED,
                'admin_note' => $note,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ])->save();

            $this->event()->update(['package_id' => $this->package_id]);
        });
    }

    public function reject(User $admin, ?string $note = null): void
    {
        $this->forceFill([
            'status' => self::REJECTED,
            'admin_note' => $note,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
        ])->save();
    }
}
