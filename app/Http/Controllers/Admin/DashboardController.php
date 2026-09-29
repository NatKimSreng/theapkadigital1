<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Guest;
use App\Models\Invitation;
use App\Models\Order;
use App\Models\Package;
use App\Models\PageView;
use App\Models\Post;
use App\Models\Rsvp;
use App\Models\User;
use Carbon\CarbonInterface;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const MONTHS = 6;

    public function __invoke(): Response
    {
        $approved = Order::query()->where('status', Order::APPROVED);
        $since = now()->startOfMonth()->subMonths(self::MONTHS - 1);

        // Grouped in PHP so the query works the same on SQLite and MySQL.
        $revenueByMonth = (clone $approved)
            ->where('reviewed_at', '>=', $since)
            ->get(['amount', 'reviewed_at'])
            ->groupBy(fn (Order $order) => $order->reviewed_at->format('Y-m'))
            ->map->sum('amount');

        $usersByMonth = User::query()
            ->where('created_at', '>=', $since)
            ->pluck('created_at')
            ->countBy(fn (CarbonInterface $date) => $date->format('Y-m'));

        $months = collect(range(0, self::MONTHS - 1))->map(function (int $offset) use ($since, $revenueByMonth, $usersByMonth) {
            $key = $since->copy()->addMonths($offset)->format('Y-m');

            return [
                'month' => $key,
                'revenue' => round((float) ($revenueByMonth[$key] ?? 0), 2),
                'users' => (int) ($usersByMonth[$key] ?? 0),
            ];
        });

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'revenue' => round((float) (clone $approved)->sum('amount'), 2),
                'revenue_month' => round((float) (clone $approved)->where('reviewed_at', '>=', now()->startOfMonth())->sum('amount'), 2),
                'pending' => Order::query()->where('status', Order::PENDING)->count(),
                'users' => User::count(),
                'events' => Event::count(),
                'paid_events' => Event::query()->whereNotNull('package_id')->count(),
                'users_week' => User::query()->where('created_at', '>=', now()->subDays(7))->count(),
                'guests' => Guest::count(),
                'invitations' => Invitation::count(),
                'rsvps' => Rsvp::count(),
                'attending' => Rsvp::query()->where('attending', true)->count(),
                'posts' => Post::query()->published()->count(),
                'drafts' => Post::query()->whereNull('published_at')->count(),
                'post_views' => (int) Post::query()->sum('views'),
                'views_today' => PageView::query()->where('created_at', '>=', now()->startOfDay())->count(),
                'views_week' => PageView::query()->where('created_at', '>=', now()->subDays(7))->count(),
            ],
            'recentUsers' => User::query()
                ->withCount('events')
                ->latest()
                ->limit(5)
                ->get(['id', 'name', 'email', 'created_at']),
            'topPosts' => Post::query()
                ->published()
                ->orderByDesc('views')
                ->limit(5)
                ->get(['id', 'title', 'slug', 'views', 'published_at']),
            'months' => $months,
            'packages' => Package::query()
                ->ordered()
                ->withCount(['orders as sales' => fn ($query) => $query->where('status', Order::APPROVED)])
                ->withSum(['orders as revenue' => fn ($query) => $query->where('status', Order::APPROVED)], 'amount')
                ->get(['id', 'name', 'price']),
            'pendingOrders' => Order::query()
                ->where('status', Order::PENDING)
                ->with(['user:id,name,email', 'package:id,name', 'event:id,name'])
                ->oldest()
                ->limit(5)
                ->get(),
        ]);
    }
}
