<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BlogTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['is_admin' => true]);
    }

    private function makePost(array $attributes = []): Post
    {
        return Post::create([
            'title' => 'Wedding checklist',
            'slug' => 'wedding-checklist',
            'body' => "## Start early\n\nBook the venue first.",
            'published_at' => now()->subDay(),
            ...$attributes,
        ]);
    }

    public function test_blog_lists_only_published_posts()
    {
        $this->makePost();
        $this->makePost(['title' => 'Draft', 'slug' => 'draft', 'published_at' => null]);
        $this->makePost(['title' => 'Later', 'slug' => 'later', 'published_at' => now()->addWeek()]);

        $this->get(route('blog.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('blog/index')
                ->has('posts.data', 1)
                ->where('posts.data.0.slug', 'wedding-checklist'));
    }

    public function test_published_post_renders_markdown_and_counts_views()
    {
        $post = $this->makePost();

        $this->get(route('blog.show', $post->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('blog/show')
                ->where('post.html', fn (string $html) => str_contains($html, '<h2>Start early</h2>')));

        $this->assertSame(1, $post->fresh()->views);
    }

    public function test_raw_html_in_a_post_is_stripped()
    {
        $post = $this->makePost(['body' => "Hello <script>alert(1)</script>\n\n[x](javascript:alert(1))"]);

        $this->get(route('blog.show', $post->slug))
            ->assertInertia(fn (Assert $page) => $page
                ->where('post.html', fn (string $html) => ! str_contains($html, '<script') && ! str_contains($html, 'javascript:')));
    }

    public function test_drafts_are_hidden_from_visitors_but_admins_can_preview()
    {
        $post = $this->makePost(['published_at' => null]);

        $this->get(route('blog.show', $post->slug))->assertNotFound();

        $this->actingAs($this->admin())
            ->get(route('blog.show', $post->slug))
            ->assertOk()
            ->assertSee('noindex', false);

        $this->assertSame(0, $post->fresh()->views);
    }

    public function test_post_page_has_article_meta_tags()
    {
        $post = $this->makePost(['meta_description' => 'How to plan a Khmer wedding.']);

        $this->get(route('blog.show', $post->slug))
            ->assertSee('<meta property="og:type" content="article">', false)
            ->assertSee('<meta name="description" content="How to plan a Khmer wedding.">', false)
            ->assertSee('"@type":"BlogPosting"', false)
            ->assertSee('<link rel="canonical" href="'.route('blog.show', $post->slug).'">', false);
    }

    public function test_admin_can_create_a_post_with_a_cover()
    {
        Storage::fake('public');

        $this->actingAs($this->admin())
            ->post(route('admin.posts.store'), [
                'title' => 'ពិធីមង្គលការខ្មែរ',
                'body' => 'Some text',
                'locale' => 'km',
                'published' => '1',
                'cover' => UploadedFile::fake()->image('cover.jpg', 1200, 630),
            ])
            ->assertRedirect();

        $post = Post::firstOrFail();

        // Khmer letters survive in the slug.
        $this->assertSame('ពិធីមង្គលការខ្មែរ', $post->slug);
        $this->assertTrue($post->isPublished());
        Storage::disk('public')->assertExists($post->cover_path);
    }

    public function test_slugs_are_made_unique()
    {
        $this->makePost();

        $this->actingAs($this->admin())
            ->post(route('admin.posts.store'), [
                'title' => 'Wedding checklist',
                'body' => 'Again',
                'locale' => 'en',
            ]);

        $this->assertSame('wedding-checklist-2', Post::latest('id')->first()->slug);
        $this->assertNull(Post::latest('id')->first()->published_at);
    }

    public function test_admin_can_schedule_and_unpublish()
    {
        $post = $this->makePost();
        $admin = $this->admin();
        $later = now()->addDays(3)->startOfMinute();

        $this->actingAs($admin)->put(route('admin.posts.update', $post), [
            'title' => $post->title,
            'slug' => $post->slug,
            'body' => $post->body,
            'locale' => 'en',
            'published' => '1',
            'published_at' => $later->toIso8601String(),
        ])->assertSessionHasNoErrors();

        $this->assertTrue($post->fresh()->published_at->equalTo($later));
        $this->assertFalse($post->fresh()->isPublished());

        $this->actingAs($admin)->put(route('admin.posts.update', $post), [
            'title' => $post->title,
            'slug' => $post->slug,
            'body' => $post->body,
            'locale' => 'en',
            'published' => '0',
        ]);

        $this->assertNull($post->fresh()->published_at);
    }

    public function test_deleting_a_post_removes_its_cover()
    {
        Storage::fake('public');
        $path = UploadedFile::fake()->image('c.jpg')->store('posts', 'public');
        $post = $this->makePost(['cover_path' => $path]);

        $this->actingAs($this->admin())
            ->delete(route('admin.posts.destroy', $post))
            ->assertRedirect(route('admin.posts.index'));

        $this->assertModelMissing($post);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_admin_can_upload_body_images_and_preview()
    {
        Storage::fake('public');
        $admin = $this->admin();

        $this->actingAs($admin)
            ->postJson(route('admin.posts.image'), ['image' => UploadedFile::fake()->image('a.png')])
            ->assertOk()
            ->assertJsonStructure(['url']);

        $this->actingAs($admin)
            ->postJson(route('admin.posts.preview'), ['body' => '**hi**'])
            ->assertOk()
            ->assertJson(['html' => "<p><strong>hi</strong></p>\n"]);
    }

    public function test_non_admins_cannot_manage_posts()
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('admin.posts.index'))->assertForbidden();
        $this->actingAs($user)->post(route('admin.posts.store'), ['title' => 'x', 'body' => 'x', 'locale' => 'en'])->assertForbidden();
        $this->assertSame(0, Post::count());
    }
}
