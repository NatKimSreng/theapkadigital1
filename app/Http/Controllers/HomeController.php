<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('welcome', [
            'posts' => Post::query()
                ->published()
                ->latest('published_at')
                ->limit(3)
                ->get(['id', 'title', 'slug', 'excerpt', 'cover_path', 'locale', 'published_at']),
        ])->withViewData('seo', Seo::page(schema: Seo::siteSchema()));
    }
}
