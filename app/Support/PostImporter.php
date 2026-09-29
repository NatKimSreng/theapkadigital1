<?php

namespace App\Support;

use App\Models\Post;
use Carbon\CarbonInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use RuntimeException;

/**
 * Creates or updates blog posts from a spreadsheet exported as CSV.
 *
 * The whole file is checked first; if any row is invalid nothing is saved,
 * so a half-imported file never has to be cleaned up by hand.
 */
class PostImporter
{
    public const COLUMNS = ['title', 'body', 'slug', 'excerpt', 'locale', 'published', 'published_at', 'meta_title', 'meta_description'];

    public const MAX_ROWS = 500;

    private const MAX_ERRORS = 20;

    /**
     * Friendlier header names people are likely to type.
     */
    private const ALIASES = [
        'content' => 'body',
        'text' => 'body',
        'language' => 'locale',
        'lang' => 'locale',
        'link' => 'slug',
        'url' => 'slug',
        'summary' => 'excerpt',
        'status' => 'published',
        'publish' => 'published',
        'date' => 'published_at',
        'publish_date' => 'published_at',
        'seo_title' => 'meta_title',
        'seo_description' => 'meta_description',
        'description' => 'meta_description',
    ];

    private const YES = ['1', 'yes', 'y', 'true', 'published', 'publish', 'បាទ', 'ចាស', 'ផ្សាយ'];

    private const NO = ['', '0', 'no', 'n', 'false', 'draft', 'ទេ', 'ព្រាង'];

    /**
     * @return array{created: int, updated: int}
     *
     * @throws ValidationException
     */
    public function import(UploadedFile $file, ?int $authorId): array
    {
        $rows = $this->read($file);
        $errors = [];
        $posts = [];
        $slugs = [];

        foreach ($rows as $line => $row) {
            $validator = Validator::make($row, [
                'title' => ['required', 'string', 'max:200'],
                'body' => ['required', 'string', 'max:200000'],
                'slug' => ['nullable', 'string', 'max:120'],
                'excerpt' => ['nullable', 'string', 'max:500'],
                'locale' => ['nullable', Rule::in(Post::LOCALES)],
                'published' => ['nullable', Rule::in([...self::YES, ...self::NO])],
                'published_at' => ['nullable', 'date'],
                'meta_title' => ['nullable', 'string', 'max:200'],
                'meta_description' => ['nullable', 'string', 'max:500'],
            ]);

            if ($validator->fails()) {
                foreach ($validator->errors()->all() as $message) {
                    $errors[] = __('Row :row: :message', ['row' => $line, 'message' => $message]);
                }

                continue;
            }

            $slug = Post::slugFrom((string) ($row['slug'] ?? ''));

            if ($slug !== '') {
                if (isset($slugs[$slug])) {
                    $errors[] = __('Row :row: the link ":slug" is also used on row :other.', ['row' => $line, 'slug' => $slug, 'other' => $slugs[$slug]]);

                    continue;
                }

                $slugs[$slug] = $line;
            }

            $posts[] = [...$row, 'slug' => $slug];
        }

        if ($errors !== []) {
            $extra = count($errors) - self::MAX_ERRORS;
            $shown = array_slice($errors, 0, self::MAX_ERRORS);

            if ($extra > 0) {
                $shown[] = __('…and :count more problems.', ['count' => $extra]);
            }

            throw ValidationException::withMessages(['csv' => implode("\n", $shown)]);
        }

        return DB::transaction(function () use ($posts, $authorId) {
            $created = 0;
            $updated = 0;

            foreach ($posts as $row) {
                // A link that matches an existing post updates it, so a
                // corrected file can simply be uploaded again.
                $post = $row['slug'] !== '' ? Post::query()->where('slug', $row['slug'])->first() : null;
                $isNew = $post === null;
                $post ??= new Post;

                if ($isNew) {
                    $post->author_id = $authorId;
                }

                $post->fill([
                    'title' => $row['title'],
                    'body' => $row['body'],
                    'slug' => $row['slug'] !== '' ? $row['slug'] : Post::uniqueSlug($row['title']),
                    'excerpt' => $row['excerpt'] ?? null,
                    'locale' => $row['locale'] ?? 'km',
                    'meta_title' => $row['meta_title'] ?? null,
                    'meta_description' => $row['meta_description'] ?? null,
                    'published_at' => $this->publishedAt($row),
                ])->save();

                $isNew ? $created++ : $updated++;
            }

            return ['created' => $created, 'updated' => $updated];
        });
    }

    /**
     * A blank "published" column with a date schedules the post for that date.
     *
     * @param  array<string, string|null>  $row
     */
    private function publishedAt(array $row): ?CarbonInterface
    {
        $flag = mb_strtolower(trim((string) ($row['published'] ?? '')));
        $date = $row['published_at'] ?? null;

        if (in_array($flag, self::NO, true) && ! ($flag === '' && $date)) {
            return null;
        }

        return $date ? Carbon::parse($date) : now();
    }

    /**
     * @return array<int, array<string, string|null>> rows keyed by spreadsheet row number
     *
     * @throws ValidationException
     */
    private function read(UploadedFile $file): array
    {
        $contents = (string) file_get_contents($file->getRealPath());
        $contents = (string) preg_replace('/^\xEF\xBB\xBF/', '', $contents);

        if (! mb_check_encoding($contents, 'UTF-8')) {
            throw ValidationException::withMessages(['csv' => __('The file is not UTF-8. In Excel choose "Save as → CSV UTF-8"; Google Sheets exports UTF-8 already.')]);
        }

        $firstLine = strtok($contents, "\n") ?: '';
        $delimiter = substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',';

        $stream = self::memoryStream();
        fwrite($stream, $contents);
        rewind($stream);

        $header = fgetcsv($stream, null, $delimiter, '"', '');

        if (! is_array($header)) {
            throw ValidationException::withMessages(['csv' => __('The file is empty.')]);
        }

        $columns = array_map(function (?string $name) {
            $name = str_replace([' ', '-'], '_', mb_strtolower(trim((string) $name)));

            return self::ALIASES[$name] ?? $name;
        }, $header);

        $missing = array_diff(['title', 'body'], $columns);

        if ($missing !== []) {
            throw ValidationException::withMessages(['csv' => __('The first row must have the column names. Missing: :columns.', ['columns' => implode(', ', $missing)])]);
        }

        $rows = [];
        $line = 1;

        while (($values = fgetcsv($stream, null, $delimiter, '"', '')) !== false) {
            $line++;

            if (count(array_filter($values, fn ($value) => trim((string) $value) !== '')) === 0) {
                continue;
            }

            $row = [];

            foreach ($columns as $index => $column) {
                if (in_array($column, self::COLUMNS, true)) {
                    $value = trim((string) ($values[$index] ?? ''));
                    $row[$column] = $value === '' ? null : $value;
                }
            }

            $row['locale'] = isset($row['locale']) ? mb_strtolower($row['locale']) : null;
            $row['published'] = isset($row['published']) ? mb_strtolower($row['published']) : null;
            $rows[$line] = $row;

            if (count($rows) > self::MAX_ROWS) {
                throw ValidationException::withMessages(['csv' => __('Too many rows: import at most :max posts at a time.', ['max' => self::MAX_ROWS])]);
            }
        }

        fclose($stream);

        if ($rows === []) {
            throw ValidationException::withMessages(['csv' => __('The file has no posts under the column names.')]);
        }

        return $rows;
    }

    /**
     * @return resource
     */
    private static function memoryStream()
    {
        $stream = fopen('php://temp', 'r+');

        if ($stream === false) {
            throw new RuntimeException('Could not open a temporary stream.');
        }

        return $stream;
    }

    /**
     * A ready-to-fill example, with a BOM so Excel shows Khmer correctly.
     */
    public static function template(): string
    {
        $rows = [
            self::COLUMNS,
            [
                'គន្លឹះរៀបចំពិធីមង្គលការ',
                "## ចំណងជើងរង\n\nសរសេរខ្លឹមសារនៅទីនេះ។ ប្រើ **អក្សរដិត** និង - បញ្ជី។",
                '',
                'សេចក្តីសង្ខេបខ្លីមួយប្រយោគ',
                'km',
                'yes',
                '',
                '',
                '',
            ],
            [
                'How to plan a Khmer wedding',
                "## Start early\n\nWrite the post here. Use **bold** and - lists.",
                'plan-a-khmer-wedding',
                'A short one-sentence summary.',
                'en',
                'no',
                '',
                '',
                '',
            ],
        ];

        $stream = self::memoryStream();

        foreach ($rows as $row) {
            fputcsv($stream, $row, ',', '"', '');
        }

        rewind($stream);

        return "\xEF\xBB\xBF".stream_get_contents($stream);
    }
}
