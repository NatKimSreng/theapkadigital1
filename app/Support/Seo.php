<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Str;

/**
 * Meta tags rendered into the first HTML response, so search engines and link
 * previews (Telegram, Facebook, Messenger) see them without running JavaScript.
 *
 * Pages are noindex unless a controller opts in with Seo::page().
 */
final class Seo
{
    /**
     * @param  list<array<string, mixed>>  $schema  JSON-LD objects
     */
    public function __construct(
        public ?string $title = null,
        public ?string $description = null,
        public ?string $image = null,
        public bool $index = false,
        public string $type = 'website',
        public ?string $url = null,
        public array $schema = [],
        public ?string $publishedAt = null,
        public ?string $modifiedAt = null,
        public ?string $locale = null,
    ) {}

    /**
     * A public page that search engines should index.
     *
     * @param  list<array<string, mixed>>  $schema
     */
    public static function page(?string $title = null, ?string $description = null, ?string $image = null, array $schema = []): self
    {
        return new self(title: $title, description: $description, image: $image, index: true, schema: $schema);
    }

    public static function siteName(): string
    {
        return (string) config('app.name', 'Theapka');
    }

    public function fullTitle(): string
    {
        if ($this->title === null) {
            return Setting::get('seo_title') ?? config('theapka.seo.title');
        }

        // Matches the client-side title template in resources/js/app.tsx.
        return $this->title.' - '.self::siteName();
    }

    public function metaDescription(): string
    {
        $description = $this->description ?? Setting::get('seo_description') ?? config('theapka.seo.description');

        return Str::limit(trim((string) preg_replace('/\s+/u', ' ', $description)), 200);
    }

    public function imageUrl(): string
    {
        return $this->image ?? Setting::fileUrl('og_image') ?? asset('og-image.png');
    }

    public function canonical(): string
    {
        return $this->url ?? url()->current();
    }

    public function ogLocale(): string
    {
        return ($this->locale ?? 'km') === 'en' ? 'en_US' : 'km_KH';
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function jsonLd(): array
    {
        return $this->schema;
    }

    /**
     * The organisation and website, for the home page.
     *
     * @return list<array<string, mixed>>
     */
    public static function siteSchema(): array
    {
        $sameAs = array_values(array_filter([
            Setting::get('facebook_url'),
            ($telegram = Setting::payment()['telegram']) ? 'https://t.me/'.ltrim($telegram, '@') : null,
        ]));

        return [
            array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'Organization',
                'name' => self::siteName(),
                'url' => url('/'),
                'logo' => asset('apple-touch-icon.png'),
                'sameAs' => $sameAs ?: null,
            ]),
            [
                '@context' => 'https://schema.org',
                '@type' => 'WebSite',
                'name' => self::siteName(),
                'url' => url('/'),
            ],
        ];
    }
}
