<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class PostImportTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['is_admin' => true]);
    }

    private function csv(string $contents): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('posts.csv', $contents);
    }

    public function test_admin_can_import_posts()
    {
        $csv = "title,body,locale,published,published_at,excerpt\n"
            ."ពិធីមង្គលការ,\"## ផ្នែកទី១\n\nខ្លឹមសារ\",km,yes,,សង្ខេប\n"
            ."Draft post,Some text,en,,,\n"
            ."Scheduled,Later,en,,2030-01-01 09:00,\n";

        $this->actingAs($this->admin())
            ->post(route('admin.posts.import'), ['csv' => $this->csv($csv)])
            ->assertRedirect(route('admin.posts.index'))
            ->assertSessionHasNoErrors();

        $this->assertSame(3, Post::count());

        $khmer = Post::where('title', 'ពិធីមង្គលការ')->firstOrFail();
        $this->assertSame('ពិធីមង្គលការ', $khmer->slug);
        $this->assertTrue($khmer->isPublished());
        $this->assertStringContainsString('<h2>ផ្នែកទី១</h2>', $khmer->bodyHtml());

        $this->assertNull(Post::where('title', 'Draft post')->value('published_at'));
        $this->assertFalse(Post::where('title', 'Scheduled')->firstOrFail()->isPublished());
    }

    public function test_excel_files_with_bom_and_semicolons_work()
    {
        $csv = "\xEF\xBB\xBFTitle;Content;Language\nHello;World;EN\n";

        $this->actingAs($this->admin())
            ->post(route('admin.posts.import'), ['csv' => $this->csv($csv)])
            ->assertSessionHasNoErrors();

        $this->assertSame('en', Post::firstOrFail()->locale);
    }

    public function test_matching_links_update_existing_posts()
    {
        Post::create(['title' => 'Old', 'slug' => 'my-post', 'body' => 'old']);

        $this->actingAs($this->admin())
            ->post(route('admin.posts.import'), ['csv' => $this->csv("title,body,slug\nNew title,new body,my-post\n")])
            ->assertSessionHasNoErrors();

        $this->assertSame(1, Post::count());
        $this->assertSame('New title', Post::firstOrFail()->title);
    }

    public function test_an_invalid_row_imports_nothing_and_names_the_row()
    {
        $csv = "title,body,locale\nGood,Fine,en\n,Missing title,en\nBad language,x,fr\n";

        $this->actingAs($this->admin())
            ->post(route('admin.posts.import'), ['csv' => $this->csv($csv)])
            ->assertSessionHasErrors('csv');

        $message = session('errors')->first('csv');
        $this->assertStringContainsString('3', $message);
        $this->assertStringContainsString('4', $message);
        $this->assertSame(0, Post::count());
    }

    public function test_missing_columns_and_non_utf8_files_are_rejected()
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->post(route('admin.posts.import'), ['csv' => $this->csv("name,text\nx,y\n")])
            ->assertSessionHasErrors('csv');

        $this->actingAs($admin)
            ->post(route('admin.posts.import'), ['csv' => $this->csv("title,body\n\xE9t\xE9,x\n")])
            ->assertSessionHasErrors('csv');

        $this->assertSame(0, Post::count());
    }

    public function test_template_downloads_and_round_trips()
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)->get(route('admin.posts.template'))->assertOk();
        $this->assertStringStartsWith("\xEF\xBB\xBFtitle,body", $response->getContent());

        $this->actingAs($admin)
            ->post(route('admin.posts.import'), ['csv' => $this->csv($response->getContent())])
            ->assertSessionHasNoErrors();

        $this->assertSame(2, Post::count());
    }

    public function test_non_admins_cannot_import()
    {
        $this->actingAs(User::factory()->create())
            ->post(route('admin.posts.import'), ['csv' => $this->csv("title,body\nx,y\n")])
            ->assertForbidden();

        $this->assertSame(0, Post::count());
    }
}
