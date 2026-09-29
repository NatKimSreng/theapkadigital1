<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Post;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function sitemap(): Response
    {
        $pages = collect([
            ['loc' => route('home'), 'priority' => '1.0', 'lastmod' => null],
            ['loc' => route('pricing'), 'priority' => '0.8', 'lastmod' => null],
            ['loc' => route('templates.index'), 'priority' => '0.9', 'lastmod' => null],
            ...array_map(fn (string $template) => [
                'loc' => route('templates.show', $template),
                'priority' => '0.7',
                'lastmod' => null,
            ], Invitation::TEMPLATES),
            ['loc' => route('blog.index'), 'priority' => '0.8', 'lastmod' => Post::query()->published()->max('published_at')],
        ]);

        $posts = Post::query()
            ->published()
            ->latest('published_at')
            ->get(['slug', 'updated_at'])
            ->map(fn (Post $post) => [
                'loc' => route('blog.show', $post->slug),
                'priority' => '0.6',
                'lastmod' => $post->updated_at,
            ]);

        return response()
            ->view('sitemap', ['urls' => $pages->concat($posts)])
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function robots(): Response
    {
        $lines = [
            'User-agent: *',
            'Disallow: /admin',
            'Disallow: /dashboard',
            'Disallow: /events',
            'Disallow: /settings',
            'Disallow: /orders',
            'Disallow: /checkout',
            '',
            'Sitemap: '.route('sitemap'),
        ];

        return response(implode("\n", $lines)."\n")->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
