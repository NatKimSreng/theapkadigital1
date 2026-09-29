<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageView;
use App\Models\Post;
use App\Models\Setting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public const RANGES = [7, 30, 90];

    public function __invoke(Request $request): Response
    {
        $days = in_array($request->integer('days'), self::RANGES, true) ? $request->integer('days') : 30;
        $since = now()->startOfDay()->subDays($days - 1);
        $inRange = fn (): Builder => PageView::query()->where('created_at', '>=', $since);

        // Grouped in PHP so the numbers match on SQLite and MySQL.
        $byDay = $inRange()
            ->get(['visitor', 'created_at'])
            ->groupBy(fn (PageView $view) => $view->created_at->timezone('Asia/Phnom_Penh')->toDateString());

        $daily = collect(range(0, $days - 1))->map(function (int $offset) use ($since, $byDay) {
            $date = $since->copy()->addDays($offset)->toDateString();
            $views = $byDay->get($date, collect());

            return [
                'date' => $date,
                'views' => $views->count(),
                'visitors' => $views->pluck('visitor')->unique()->count(),
            ];
        });

        $previousViews = PageView::query()
            ->whereBetween('created_at', [$since->copy()->subDays($days), $since])
            ->count();

        return Inertia::render('admin/analytics', [
            'days' => $days,
            'totals' => [
                'views' => $daily->sum('views'),
                'visitors' => $inRange()->distinct()->count('visitor'),
                'previous_views' => $previousViews,
                'today' => PageView::query()->where('created_at', '>=', now()->startOfDay())->count(),
                'today_visitors' => PageView::query()->where('created_at', '>=', now()->startOfDay())->distinct()->count('visitor'),
            ],
            'daily' => $daily,
            'pages' => $this->top($inRange(), 'path'),
            'sources' => $this->top($inRange()->whereNotNull('source'), 'source'),
            'direct' => $inRange()->whereNull('source')->count(),
            'devices' => $inRange()
                ->select('device', DB::raw('count(*) as views'))
                ->groupBy('device')
                ->orderByDesc('views')
                ->get(),
            'seo' => $this->seoChecklist(),
        ]);
    }

    /**
     * @param  Builder<PageView>  $query
     * @return list<array{label: string, views: int, visitors: int}>
     */
    private function top(Builder $query, string $column): array
    {
        $rows = $query
            ->toBase()
            ->select($column.' as label', DB::raw('count(*) as views'), DB::raw('count(distinct visitor) as visitors'))
            ->groupBy($column)
            ->orderByDesc('views')
            ->limit(10)
            ->get();

        return array_values($rows->map(fn (object $row) => [
            'label' => (string) data_get($row, 'label'),
            'views' => (int) data_get($row, 'views'),
            'visitors' => (int) data_get($row, 'visitors'),
        ])->all());
    }

    /**
     * What is set up for search engines, and what is still missing.
     *
     * @return list<array{key: string, ok: bool, detail?: int}>
     */
    private function seoChecklist(): array
    {
        $published = Post::query()->published();

        return [
            ['key' => 'ssr', 'ok' => is_file(base_path('bootstrap/ssr/app.js'))],
            ['key' => 'https', 'ok' => str_starts_with((string) config('app.url'), 'https://')],
            ['key' => 'search_console', 'ok' => Setting::get('google_verification') !== null],
            ['key' => 'analytics', 'ok' => Setting::get('ga_id') !== null],
            ['key' => 'description', 'ok' => Setting::get('seo_description') !== null],
            ['key' => 'share_image', 'ok' => Setting::get('og_image') !== null],
            ['key' => 'posts', 'ok' => (clone $published)->count() >= 5, 'detail' => (clone $published)->count()],
            ['key' => 'post_covers', 'ok' => ! (clone $published)->whereNull('cover_path')->exists(), 'detail' => (clone $published)->whereNull('cover_path')->count()],
            ['key' => 'post_descriptions', 'ok' => ! (clone $published)->whereNull('excerpt')->whereNull('meta_description')->exists(), 'detail' => (clone $published)->whereNull('excerpt')->whereNull('meta_description')->count()],
        ];
    }
}
