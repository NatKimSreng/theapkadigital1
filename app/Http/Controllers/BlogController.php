<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    private const LIST_COLUMNS = ['id', 'title', 'slug', 'excerpt', 'cover_path', 'locale', 'published_at'];

    public function index(): Response
    {
        $posts = Post::query()->published()->latest('published_at')->paginate(9, self::LIST_COLUMNS);

        return Inertia::render('blog/index', ['posts' => $posts])
            ->withViewData('seo', Seo::page(
                title: __('Blog'),
                description: __('Wedding ideas, Khmer traditions and planning tips from Theapka.'),
            ));
    }

    public function show(Post $post): Response
    {
        abort_unless($post->isPublished() || request()->user()?->is_admin, 404);

        if ($post->isPublished()) {
            // Plain query so updated_at (and the sitemap's lastmod) stays put.
            Post::query()->whereKey($post->id)->increment('views');
        }

        $post->load('author:id,name');

        $related = Post::query()
            ->published()
            ->whereKeyNot($post->id)
            ->where('locale', $post->locale)
            ->latest('published_at')
            ->limit(3)
            ->get(self::LIST_COLUMNS);

        $seo = new Seo(
            title: $post->meta_title ?: $post->title,
            description: $post->summary(),
            image: $post->cover_url,
            index: $post->isPublished(),
            type: 'article',
            url: route('blog.show', $post->slug),
            publishedAt: $post->published_at?->toIso8601String(),
            modifiedAt: $post->updated_at->toIso8601String(),
            locale: $post->locale,
            schema: [array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'BlogPosting',
                'headline' => $post->title,
                'description' => $post->summary(),
                'image' => $post->cover_url,
                'datePublished' => $post->published_at?->toIso8601String(),
                'dateModified' => $post->updated_at->toIso8601String(),
                'inLanguage' => $post->locale,
                'mainEntityOfPage' => route('blog.show', $post->slug),
                'author' => ['@type' => 'Organization', 'name' => Seo::siteName()],
                'publisher' => [
                    '@type' => 'Organization',
                    'name' => Seo::siteName(),
                    'logo' => ['@type' => 'ImageObject', 'url' => asset('images/logo.png')],
                ],
            ])],
        );

        return Inertia::render('blog/show', [
            'post' => [
                ...$post->only(['id', 'title', 'slug', 'excerpt', 'cover_url', 'locale', 'views']),
                'published_at' => $post->published_at?->toIso8601String(),
                'author' => $post->author?->name,
                'html' => $post->bodyHtml(),
                'reading_minutes' => $post->readingMinutes(),
                'is_published' => $post->isPublished(),
            ],
            'related' => $related,
        ])->withViewData('seo', $seo);
    }
}
