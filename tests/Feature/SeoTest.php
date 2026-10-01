<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Post;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Ssr\Gateway;
use Inertia\Ssr\Response as SsrResponse;
use Tests\TestCase;

class SeoTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_is_indexable_with_site_schema()
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertSee('<meta name="robots" content="index, follow, max-image-preview:large">', false)
            ->assertSee('"@type":"Organization"', false)
            ->assertSee('<meta property="og:image" content="'.asset('og-image.png').'">', false);
    }

    public function test_server_rendered_pages_keep_their_seo_tags_and_one_title()
    {
        $this->app->instance(Gateway::class, new class implements Gateway
        {
            public function dispatch(array $page): ?SsrResponse
            {
                return new SsrResponse('<title data-inertia="">Client title</title>', '<div id="app">Rendered</div>');
            }
        });

        $html = $this->get(route('pricing'))->assertOk()->getContent();

        $this->assertStringContainsString('<meta name="description"', $html);
        $this->assertStringContainsString('<meta property="og:title"', $html);
        $this->assertStringContainsString('Rendered', $html);
        $this->assertSame(1, substr_count($html, '<title'));
    }

    public function test_private_pages_are_noindex()
    {
        $this->get(route('login'))->assertSee('<meta name="robots" content="noindex, nofollow">', false);

        $this->actingAs(User::factory()->create())
            ->get(route('events.index'))
            ->assertSee('<meta name="robots" content="noindex, nofollow">', false);
    }

    public function test_admin_seo_settings_change_the_home_page()
    {
        Setting::put(['seo_title' => 'Custom title', 'seo_description' => 'Custom description']);

        $this->get(route('home'))
            ->assertSee('<title>Custom title</title>', false)
            ->assertSee('<meta name="description" content="Custom description">', false);
    }

    public function test_sitemap_lists_public_pages_and_published_posts()
    {
        Post::create(['title' => 'Live', 'slug' => 'live', 'body' => 'x', 'published_at' => now()->subHour()]);
        Post::create(['title' => 'Draft', 'slug' => 'draft', 'body' => 'x']);

        $this->get(route('sitemap'))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee('<loc>'.route('pricing').'</loc>', false)
            ->assertSee('<loc>'.route('blog.show', 'live').'</loc>', false)
            ->assertDontSee(route('blog.show', 'draft'), false);
    }

    public function test_robots_points_to_the_sitemap()
    {
        $this->get(route('robots'))
            ->assertOk()
            ->assertSee('Disallow: /admin')
            ->assertSee('Sitemap: '.route('sitemap'));
    }

    public function test_llms_txt_describes_the_site_for_ai_assistants()
    {
        $this->get(route('llms'))
            ->assertOk()
            ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
            ->assertSee('# '.config('app.name'))
            ->assertSee('[Pricing]('.route('pricing').')')
            ->assertSee('Kbach Royal')
            ->assertSee('[Sitemap]('.route('sitemap').')');
    }

    public function test_invitation_link_has_a_preview_but_is_not_indexed()
    {
        $user = User::factory()->create();
        $event = Event::forceCreate([
            'user_id' => $user->id,
            'name' => 'Wedding',
            'groom_name' => 'Sokha',
            'bride_name' => 'Srey',
            'event_date' => '2026-12-12',
            'venue' => 'Phnom Penh',
            'exchange_rate' => 4000,
        ]);
        $invitation = $event->invitations()->create(['template' => 'classic', 'is_active' => true]);

        $this->get(route('invitations.share', $invitation->public_id))
            ->assertOk()
            ->assertSee('<meta property="og:title" content="Sokha &amp; Srey">', false)
            ->assertSee('Phnom Penh', false)
            ->assertSee('<meta name="robots" content="noindex, nofollow">', false);
    }

    public function test_google_tags_are_added_only_when_configured()
    {
        $this->get(route('home'))->assertDontSee('googletagmanager');

        Setting::put(['ga_id' => 'G-ABC123', 'google_verification' => 'verify-code']);

        $this->get(route('home'))
            ->assertSee('googletagmanager.com/gtag/js?id=G-ABC123', false)
            ->assertSee('<meta name="google-site-verification" content="verify-code">', false);
    }

    public function test_admin_can_update_site_settings_and_checkout_uses_them()
    {
        Storage::fake('public');
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->post(route('admin.settings.update'), [
                'seo_title' => 'Theapka Cambodia',
                'payment_aba_number' => '012 345 678',
                'support_telegram' => '@theapka',
                'payment_khqr_image' => UploadedFile::fake()->image('khqr.png', 400, 400),
            ])
            ->assertSessionHasNoErrors();

        $payment = Setting::payment();
        $this->assertSame('012 345 678', $payment['aba_number']);
        $this->assertSame('@theapka', $payment['telegram']);
        $this->assertNotNull($payment['khqr_image']);
        Storage::disk('public')->assertExists(Setting::get('payment_khqr_image'));

        $this->actingAs($admin)
            ->post(route('admin.settings.update'), ['remove' => ['payment_khqr_image']])
            ->assertSessionHasNoErrors();

        $this->assertNull(Setting::get('payment_khqr_image'));
    }

    public function test_invalid_analytics_ids_are_rejected()
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]))
            ->post(route('admin.settings.update'), ['ga_id' => '<script>'])
            ->assertSessionHasErrors('ga_id');
    }

    public function test_admin_events_page_lists_every_event()
    {
        $owner = User::factory()->create(['name' => 'Dara']);
        $owner->events()->create(['name' => 'Dara wedding', 'exchange_rate' => 4000]);

        $this->actingAs(User::factory()->create(['is_admin' => true]))
            ->get(route('admin.events.index', ['search' => 'Dara']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/events')
                ->has('events.data', 1)
                ->where('events.data.0.user.name', 'Dara'));
    }
}
