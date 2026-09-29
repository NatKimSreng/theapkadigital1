<?php

namespace App\Http\Middleware;

use App\Models\PageView;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Counts page views for the admin analytics, after the response is sent so
 * visitors never wait on it.
 */
class TrackPageView
{
    /**
     * Paths that are not pages people read.
     */
    private const SKIP = ['admin', 'admin/*', 'up', 'sitemap.xml', 'robots.txt', 'storage/*', 'build/*', 'images/*', 'favicon*', '*.png', '*.ico'];

    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        if (! $this->shouldTrack($request, $response)) {
            return;
        }

        try {
            PageView::create([
                'path' => Str::limit('/'.ltrim($request->path(), '/'), 255, ''),
                'source' => PageView::source($request),
                'device' => PageView::device($request->userAgent()),
                'visitor' => PageView::visitor($request),
                'created_at' => now(),
            ]);

            // Occasionally drop visits older than we keep.
            if (random_int(1, 500) === 1) {
                PageView::query()->where('created_at', '<', now()->subDays(PageView::KEEP_DAYS))->delete();
            }
        } catch (Throwable $e) {
            // Analytics must never break a page.
            Log::warning('Could not record a page view: '.$e->getMessage());
        }
    }

    private function shouldTrack(Request $request, Response $response): bool
    {
        return $request->isMethod('GET')
            && $response->getStatusCode() === 200
            && ! $request->is(...self::SKIP)
            // Inertia prefetches and partial reloads are not new page views.
            && $request->headers->get('Purpose') !== 'prefetch'
            && ! $request->headers->has('X-Inertia-Partial-Data')
            && ($request->headers->has('X-Inertia') || ! $request->expectsJson())
            && ! $request->user()?->is_admin
            && ! PageView::isBot($request->userAgent());
    }
}
