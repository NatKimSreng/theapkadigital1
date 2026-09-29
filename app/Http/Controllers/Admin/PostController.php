<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Support\PostImporter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public const STATUSES = ['all', 'published', 'scheduled', 'draft'];

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));
        $status = in_array($request->query('status'), self::STATUSES, true) ? $request->query('status') : 'all';

        return Inertia::render('admin/posts/index', [
            'posts' => Post::query()
                ->when($search !== '', fn ($query) => $query->where('title', 'like', "%{$search}%"))
                ->when($status === 'published', fn ($query) => $query->published())
                ->when($status === 'scheduled', fn ($query) => $query->where('published_at', '>', now()))
                ->when($status === 'draft', fn ($query) => $query->whereNull('published_at'))
                ->latest('updated_at')
                ->paginate(20, ['id', 'title', 'slug', 'cover_path', 'locale', 'published_at', 'views', 'updated_at'])
                ->withQueryString(),
            'search' => $search,
            'status' => $status,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/posts/edit', ['post' => null]);
    }

    public function store(Request $request): RedirectResponse
    {
        $post = new Post;
        $post->author_id = $request->user()->id;
        $this->save($request, $post);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return to_route('admin.posts.edit', $post);
    }

    public function edit(Post $post): Response
    {
        return Inertia::render('admin/posts/edit', [
            'post' => [
                ...$post->only(['id', 'title', 'slug', 'excerpt', 'body', 'cover_url', 'locale', 'meta_title', 'meta_description', 'views']),
                'published_at' => $post->published_at?->toIso8601String(),
            ],
        ]);
    }

    public function update(Request $request, Post $post): RedirectResponse
    {
        $this->save($request, $post);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.saved']);

        return back();
    }

    public function destroy(Post $post): RedirectResponse
    {
        $post->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'toast.deleted']);

        return to_route('admin.posts.index');
    }

    /**
     * Creates or updates posts from a CSV file (e.g. exported from Excel or Google Sheets).
     */
    public function import(Request $request, PostImporter $importer): RedirectResponse
    {
        $request->validate(['csv' => ['required', 'file', 'mimes:csv,txt', 'extensions:csv,txt', 'max:5120']]);

        $result = $importer->import($request->file('csv'), $request->user()->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'toast.posts_imported',
            'params' => $result,
        ]);

        return to_route('admin.posts.index');
    }

    public function importTemplate(): HttpResponse
    {
        return response(PostImporter::template(), 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="theapka-blog-template.csv"',
        ]);
    }

    /**
     * Uploads a picture for the post body and returns its URL for the editor.
     */
    public function image(Request $request): JsonResponse
    {
        $request->validate(['image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120']]);

        $path = self::storeUpload($request->file('image'), 'posts/images');

        return response()->json(['url' => Storage::disk('public')->url($path)]);
    }

    /**
     * Renders the Markdown body the same way the public page will.
     */
    public function preview(Request $request): JsonResponse
    {
        $request->validate(['body' => ['nullable', 'string', 'max:200000']]);

        return response()->json(['html' => Post::renderMarkdown((string) $request->input('body'))]);
    }

    /**
     * Saves an upload on the public disk, failing loudly if the disk refuses it.
     */
    public static function storeUpload(UploadedFile $file, string $directory): string
    {
        $path = $file->store($directory, 'public');

        if ($path === false) {
            abort(500, 'The file could not be saved.');
        }

        return $path;
    }

    private function save(Request $request, Post $post): void
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:120'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'string', 'max:200000'],
            'locale' => ['required', Rule::in(Post::LOCALES)],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_cover' => ['boolean'],
        ]);

        $slug = Post::slugFrom($data['slug'] ?? '') ?: $data['title'];

        $post->fill([
            ...Arr::only($data, ['title', 'excerpt', 'body', 'locale', 'meta_title', 'meta_description']),
            'slug' => Post::uniqueSlug($slug, $post->id),
            'published_at' => $request->boolean('published')
                ? ($data['published_at'] ?? null ? Carbon::parse($data['published_at']) : ($post->published_at ?? now()))
                : null,
        ]);

        $oldCover = $post->cover_path;

        if ($request->hasFile('cover')) {
            $post->cover_path = self::storeUpload($request->file('cover'), 'posts');
        } elseif ($request->boolean('remove_cover')) {
            $post->cover_path = null;
        }

        $post->save();

        if ($oldCover && $oldCover !== $post->cover_path) {
            Storage::disk('public')->delete($oldCover);
        }
    }
}
