<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $path
 * @property string|null $source
 * @property string $device
 * @property string $visitor
 * @property Carbon $created_at
 */
#[Fillable(['path', 'source', 'device', 'visitor', 'created_at'])]
class PageView extends Model
{
    public const UPDATED_AT = null;

    /** How long visits are kept. */
    public const KEEP_DAYS = 400;

    private const BOTS = '/bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|telegram|whatsapp|preview|headless|lighthouse|pagespeed|curl|wget|python|httpclient|monitor|uptime|axios|go-http|java\//i';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public static function isBot(?string $userAgent): bool
    {
        return $userAgent === null || $userAgent === '' || preg_match(self::BOTS, $userAgent) === 1;
    }

    public static function device(?string $userAgent): string
    {
        return match (true) {
            (bool) preg_match('/ipad|tablet/i', (string) $userAgent) => 'tablet',
            (bool) preg_match('/mobile|android|iphone/i', (string) $userAgent) => 'mobile',
            default => 'desktop',
        };
    }

    /**
     * Where the visit came from: a campaign tag, another site, or null for
     * direct visits and clicks within this site.
     */
    public static function source(Request $request): ?string
    {
        if ($utm = $request->query('utm_source')) {
            return Str::limit(Str::lower((string) $utm), 120, '');
        }

        $host = parse_url((string) $request->headers->get('referer'), PHP_URL_HOST);

        if (! is_string($host) || $host === $request->getHost()) {
            return null;
        }

        $host = (string) preg_replace('/^(www\.|m\.|l\.|lm\.)/', '', Str::lower($host));

        // Group the many Facebook and Google hostnames.
        return match (true) {
            str_contains($host, 'facebook.') || $host === 'fb.com' => 'facebook.com',
            str_starts_with($host, 'google.') => 'google.com',
            str_contains($host, 't.me') || str_contains($host, 'telegram') => 'telegram',
            default => Str::limit($host, 120, ''),
        };
    }

    /**
     * A visitor code that is the same all day for one browser but can't be
     * turned back into an IP address or followed across days.
     */
    public static function visitor(Request $request): string
    {
        return substr(hash('sha256', implode('|', [
            $request->ip(),
            $request->userAgent(),
            now()->toDateString(),
            config('app.key'),
        ])), 0, 16);
    }
}
