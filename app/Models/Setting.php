<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Site-wide values edited from the admin. Anything left empty falls back to
 * config/theapka.php (and so to .env).
 *
 * @property string $key
 * @property string|null $value
 */
#[Fillable(['key', 'value'])]
class Setting extends Model
{
    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $incrementing = false;

    private const CACHE_KEY = 'site-settings';

    public const KEYS = [
        'seo_title', 'seo_description', 'og_image', 'google_verification', 'ga_id',
        'facebook_url', 'support_telegram',
        'payment_account_name', 'payment_aba_number', 'payment_bank_details', 'payment_khqr_image',
    ];

    /**
     * Keys that hold a path on the public disk.
     */
    public const FILES = ['og_image', 'payment_khqr_image'];

    /**
     * @return array<string, string|null>
     */
    public static function values(): array
    {
        try {
            $stored = Cache::rememberForever(self::CACHE_KEY, fn () => self::query()->pluck('value', 'key')->all());
        } catch (Throwable) {
            // Before the first migration (e.g. while the container boots).
            $stored = [];
        }

        return array_merge(array_fill_keys(self::KEYS, null), array_intersect_key($stored, array_flip(self::KEYS)));
    }

    public static function get(string $key): ?string
    {
        $value = self::values()[$key] ?? null;

        return $value === '' ? null : $value;
    }

    /**
     * @param  array<string, string|null>  $values
     */
    public static function put(array $values): void
    {
        foreach (array_intersect_key($values, array_flip(self::KEYS)) as $key => $value) {
            self::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }

        Cache::forget(self::CACHE_KEY);
    }

    public static function fileUrl(string $key): ?string
    {
        $path = self::get($key);

        return $path ? Storage::disk('public')->url($path) : null;
    }

    /**
     * Payment details shown at checkout.
     *
     * @return array{account_name: string|null, aba_number: string|null, bank_details: string|null, khqr_image: string|null, telegram: string|null}
     */
    public static function payment(): array
    {
        $config = config('theapka.payment');
        $khqr = self::fileUrl('payment_khqr_image') ?? ($config['khqr_image'] ? asset($config['khqr_image']) : null);

        return [
            'account_name' => self::get('payment_account_name') ?? $config['account_name'],
            'aba_number' => self::get('payment_aba_number') ?? $config['aba_number'],
            'bank_details' => self::get('payment_bank_details') ?? $config['bank_details'],
            'khqr_image' => $khqr,
            'telegram' => self::get('support_telegram') ?? $config['telegram'],
        ];
    }
}
