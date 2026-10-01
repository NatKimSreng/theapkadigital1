<?php

namespace App\Support;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/**
 * Reads the pin from a Google Maps link: its coordinates and place name.
 * Short links are followed, but only through Google's own hosts.
 */
class MapLink
{
    private const MAX_HOPS = 5;

    private const HOSTS = '/^((www|maps)\.)?google\.com(\.kh)?$|^(maps\.app\.)?goo\.gl$/i';

    /**
     * @return array{lat: float, lng: float, name: string|null}|null
     */
    public static function place(string $url): ?array
    {
        for ($hop = 0; $hop <= self::MAX_HOPS; $hop++) {
            if (! self::isGoogle($url)) {
                return null;
            }

            $place = self::parse($url);

            if ($place !== null) {
                return $place;
            }

            try {
                $response = Http::withoutRedirecting()->timeout(5)->get($url);
            } catch (ConnectionException) {
                return null;
            }

            $next = $response->header('Location');

            if (! $response->redirect() || $next === '') {
                return null;
            }

            $url = str_starts_with($next, '/')
                ? 'https://'.parse_url($url, PHP_URL_HOST).$next
                : $next;
        }

        return null;
    }

    private static function isGoogle(string $url): bool
    {
        $parts = parse_url($url);

        return ($parts['scheme'] ?? '') === 'https'
            && preg_match(self::HOSTS, $parts['host'] ?? '') === 1;
    }

    /**
     * @return array{lat: float, lng: float, name: string|null}|null
     */
    private static function parse(string $url): ?array
    {
        $decoded = rawurldecode($url);
        $number = '(-?\d{1,3}\.\d+)';

        // The place's own pin (!3d…!4d…) beats the map's centre (@…).
        if (preg_match("/!3d{$number}!4d{$number}/", $decoded, $match)
            || preg_match("/@{$number},{$number}/", $decoded, $match)
            || preg_match("/[?&](?:q|query|ll|destination)={$number},\s*{$number}/", $decoded, $match)) {
            $lat = (float) $match[1];
            $lng = (float) $match[2];
        } else {
            return null;
        }

        if (abs($lat) > 90 || abs($lng) > 180) {
            return null;
        }

        $name = null;

        if (preg_match('#/maps/place/([^/@?]+)#', $url, $place)) {
            $name = trim(urldecode($place[1]));

            // A dropped pin is named by its own coordinates; that's no name.
            if ($name === '' || preg_match('/^[\d\s.,°\'"NSEW+-]+$/u', $name)) {
                $name = null;
            }
        }

        return [
            'lat' => round($lat, 6),
            'lng' => round($lng, 6),
            'name' => $name === null ? null : mb_substr($name, 0, 150),
        ];
    }
}
