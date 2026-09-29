<?php

namespace Tests\Feature;

use App\Models\Invitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TemplateShowcaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_template_gallery_is_public_and_indexable()
    {
        $this->get(route('templates.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('templates/index')
                ->where('premium', Invitation::PREMIUM_TEMPLATES))
            ->assertSee('<meta name="robots" content="index, follow, max-image-preview:large">', false);
    }

    public function test_every_template_has_a_demo_page()
    {
        foreach (Invitation::TEMPLATES as $template) {
            $this->get(route('templates.show', $template))
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('templates/show')
                    ->where('template', $template)
                    ->where('premium', in_array($template, Invitation::PREMIUM_TEMPLATES, true)));
        }
    }

    public function test_unknown_templates_are_not_found()
    {
        $this->get(route('templates.show', 'does-not-exist'))->assertNotFound();
    }

    public function test_sitemap_lists_the_template_pages()
    {
        $this->get(route('sitemap'))
            ->assertSee('<loc>'.route('templates.index').'</loc>', false)
            ->assertSee('<loc>'.route('templates.show', 'angkor-cinematic').'</loc>', false);
    }

    public function test_new_premium_templates_need_a_premium_package()
    {
        $user = User::factory()->create();
        $event = $user->events()->create(['name' => 'Wedding', 'exchange_rate' => 4000]);

        $this->actingAs($user)
            ->post(route('events.invitations.store', $event), ['template' => 'angkor-cinematic']);

        $this->assertSame(0, $event->invitations()->count());
    }
}
