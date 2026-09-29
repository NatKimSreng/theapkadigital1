<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int|null $author_id
 * @property string $title
 * @property string $slug
 * @property string|null $excerpt
 * @property string $body
 * @property string|null $cover_path
 * @property string $locale
 * @property string|null $meta_title
 * @property string|null $meta_description
 * @property Carbon|null $published_at
 * @property int $views
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read string|null $cover_url
 */
#[Fillable([
    'title', 'slug', 'excerpt', 'body', 'cover_path', 'locale',
    'meta_title', 'meta_description', 'published_at',
])]
class Post extends Model
{
    public const LOCALES = ['km', 'en'];

    /** @var list<string> */
    protected $appends = ['cover_url'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'views' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::deleted(function (Post $post) {
            if ($post->cover_path) {
                Storage::disk('public')->delete($post->cover_path);
            }
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Posts visitors can read: published, and not scheduled for later.
     *
     * @param  Builder<Post>  $query
     */
    public function scopePublished(Builder $query): void
    {
        $query->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function isPublished(): bool
    {
        return $this->published_at !== null && $this->published_at->lte(now());
    }

    /**
     * @return Attribute<string|null, never>
     */
    protected function coverUrl(): Attribute
    {
        return Attribute::get(fn () => $this->cover_path ? Storage::disk('public')->url($this->cover_path) : null);
    }

    /**
     * The body is written in Markdown; raw HTML is stripped so a post can't inject scripts.
     */
    public function bodyHtml(): string
    {
        return self::renderMarkdown($this->body);
    }

    public static function renderMarkdown(string $markdown): string
    {
        return (string) Str::markdown($markdown, [
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);
    }

    public function summary(int $limit = 160): string
    {
        $text = $this->meta_description ?: $this->excerpt ?: strip_tags($this->bodyHtml());

        return Str::limit(trim((string) preg_replace('/\s+/u', ' ', $text)), $limit);
    }

    public function readingMinutes(): int
    {
        // Khmer has no spaces between words, so count characters rather than words.
        return max(1, (int) ceil(mb_strlen(strip_tags($this->bodyHtml())) / 1000));
    }

    /**
     * A URL slug that keeps Khmer letters (Str::slug would drop them all).
     */
    public static function slugFrom(string $text): string
    {
        $slug = mb_strtolower(trim($text));
        $slug = (string) preg_replace('/[^\pL\pM\pN]+/u', '-', $slug);

        return Str::limit(trim($slug, '-'), 120, '');
    }

    public static function uniqueSlug(string $text, ?int $ignoreId = null): string
    {
        $base = self::slugFrom($text) ?: 'post';
        $slug = $base;

        for ($i = 2; self::query()->where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }
}
