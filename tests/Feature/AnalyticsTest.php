<?php

namespace Tests\Feature;

use App\Models\PageView;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private const BROWSER = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';

    public function test_visits_are_counted_without_storing_the_ip()
    {
        $this->withHeaders(['User-Agent' => self::BROWSER, 'Referer' => 'https://m.facebook.com/story'])
            ->get('/pricing?utm_medium=x')
            ->assertOk();

        $view = PageView::sole();
        $this->assertSame('/pricing', $view->path);
        $this->assertSame('facebook.com', $view->source);
        $this->assertSame('mobile', $view->device);
        $this->assertSame(16, strlen($view->visitor));
        $this->assertStringNotContainsString('127.0.0.1', json_encode($view->toArray()));
    }

    public function test_campaign_tags_name_the_source()
    {
        $this->withHeaders(['User-Agent' => self::BROWSER])->get('/?utm_source=Telegram_Group');

        $this->assertSame('telegram_group', PageView::sole()->source);
    }

    public function test_bots_prefetches_admins_and_missing_pages_are_not_counted()
    {
        $this->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; Googlebot/2.1)'])->get('/');
        $this->withHeaders(['User-Agent' => self::BROWSER, 'Purpose' => 'prefetch'])->get('/pricing');
        $this->withHeaders(['User-Agent' => self::BROWSER])->get('/templates/nope');

        $this->actingAs(User::factory()->create(['is_admin' => true]))
            ->withHeaders(['User-Agent' => self::BROWSER])
            ->get('/');

        $this->assertSame(0, PageView::count());
    }

    public function test_the_same_browser_is_one_visitor_per_day()
    {
        $this->withHeaders(['User-Agent' => self::BROWSER])->get('/');
        $this->withHeaders(['User-Agent' => self::BROWSER])->get('/pricing');

        $this->assertSame(1, PageView::query()->distinct()->count('visitor'));
    }

    public function test_admin_sees_the_numbers()
    {
        $this->withHeaders(['User-Agent' => self::BROWSER])->get('/');
        $this->withHeaders(['User-Agent' => self::BROWSER])->get('/pricing');
        $this->withHeaders(['User-Agent' => self::BROWSER])->get('/pricing');

        $this->actingAs(User::factory()->create(['is_admin' => true]))
            ->get(route('admin.analytics', ['days' => 7]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/analytics')
                ->where('days', 7)
                ->where('totals.views', 3)
                ->where('totals.visitors', 1)
                ->where('pages.0.label', '/pricing')
                ->where('pages.0.views', 2)
                ->has('daily', 7)
                ->has('seo', 9));
    }

    public function test_only_admins_can_open_analytics()
    {
        $this->actingAs(User::factory()->create())
            ->get(route('admin.analytics'))
            ->assertForbidden();
    }
}
