import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Bold,
    ExternalLink,
    Heading2,
    Heading3,
    ImagePlus,
    Italic,
    Link2,
    List,
    ListOrdered,
    Quote,
    Trash2,
    Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import PostController from '@/actions/App/Http/Controllers/Admin/PostController';
import { ConfirmDelete } from '@/components/event/confirm-delete';
import { Field, selectClassName } from '@/components/event/fields';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { postJson, postStatus, slugify, toLocalInput } from '@/lib/blog';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import blog from '@/routes/blog';
import type { EditablePost } from '@/types';

const textareaClass =
    'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30';

function Card({ title, children }: { title?: string; children: ReactNode }) {
    return (
        <section className="rounded-3xl border bg-card p-5 shadow-sm">
            {title && <h2 className="mb-4 font-semibold">{title}</h2>}
            <div className="space-y-4">{children}</div>
        </section>
    );
}

function Counter({ value, max }: { value: string; max: number }) {
    // Khmer and Latin text is all in the BMP, so UTF-16 length is the character count.
    const length = value.length;

    return (
        <span
            className={cn(
                'text-xs tabular-nums',
                length > max ? 'text-amber-600' : 'text-muted-foreground',
            )}
        >
            {length}/{max}
        </span>
    );
}

type Wrap = { before: string; after?: string; placeholder: string };

function MarkdownEditor({
    value,
    onChange,
    error,
}: {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    const { t } = useTranslation();
    const textarea = useRef<HTMLTextAreaElement>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const [tab, setTab] = useState<'write' | 'preview'>('write');
    const [preview, setPreview] = useState('');
    const [busy, setBusy] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const insert = ({ before, after = '', placeholder }: Wrap) => {
        const el = textarea.current;

        if (!el) {
            return;
        }

        const { selectionStart: start, selectionEnd: end } = el;
        const selected = value.slice(start, end) || placeholder;
        const next =
            value.slice(0, start) +
            before +
            selected +
            after +
            value.slice(end);

        onChange(next);

        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(
                start + before.length,
                start + before.length + selected.length,
            );
        });
    };

    const line = (prefix: string, placeholder: string) => {
        const el = textarea.current;
        const start = el?.selectionStart ?? value.length;
        const atLineStart = start === 0 || value[start - 1] === '\n';

        insert({
            before: `${atLineStart ? '' : '\n'}${prefix}`,
            placeholder,
        });
    };

    const upload = async (file: File) => {
        const body = new FormData();
        body.append('image', file);
        setBusy(true);
        setUploadError(null);

        try {
            const { url } = await postJson<{ url: string }>(
                PostController.image.url(),
                body,
            );
            insert({
                before: `\n![`,
                after: `](${url})\n`,
                placeholder: file.name.replace(/\.[^.]+$/, ''),
            });
        } catch (e) {
            setUploadError(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        if (tab !== 'preview') {
            return;
        }

        const body = new FormData();
        body.append('body', value);
        setBusy(true);

        postJson<{ html: string }>(PostController.preview.url(), body)
            .then(({ html }) => setPreview(html))
            .catch(() => setPreview(''))
            .finally(() => setBusy(false));
    }, [tab, value]);

    const tools = [
        {
            icon: Heading2,
            label: t('posts.tool_h2'),
            run: () => line('## ', t('posts.tool_heading')),
        },
        {
            icon: Heading3,
            label: t('posts.tool_h3'),
            run: () => line('### ', t('posts.tool_heading')),
        },
        {
            icon: Bold,
            label: t('posts.tool_bold'),
            run: () =>
                insert({ before: '**', after: '**', placeholder: 'text' }),
        },
        {
            icon: Italic,
            label: t('posts.tool_italic'),
            run: () => insert({ before: '_', after: '_', placeholder: 'text' }),
        },
        {
            icon: Link2,
            label: t('posts.tool_link'),
            run: () =>
                insert({
                    before: '[',
                    after: '](https://)',
                    placeholder: t('posts.tool_link_text'),
                }),
        },
        {
            icon: List,
            label: t('posts.tool_list'),
            run: () => line('- ', t('posts.tool_item')),
        },
        {
            icon: ListOrdered,
            label: t('posts.tool_numbered'),
            run: () => line('1. ', t('posts.tool_item')),
        },
        {
            icon: Quote,
            label: t('posts.tool_quote'),
            run: () => line('> ', t('posts.tool_quote')),
        },
    ];

    return (
        <div className="grid gap-1.5">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{t('posts.body')}</span>
                <div className="flex gap-1 rounded-full bg-muted p-1 text-sm">
                    {(['write', 'preview'] as const).map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setTab(item)}
                            className={cn(
                                'rounded-full px-3 py-0.5',
                                tab === item
                                    ? 'bg-background font-medium shadow-sm'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {t(`posts.${item}`)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border">
                {tab === 'write' && (
                    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1">
                        {tools.map((tool) => (
                            <button
                                key={tool.label}
                                type="button"
                                title={tool.label}
                                aria-label={tool.label}
                                onClick={tool.run}
                                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                            >
                                <tool.icon className="size-4" />
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => fileInput.current?.click()}
                            disabled={busy}
                            className="ml-auto flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                        >
                            {busy ? (
                                <Spinner />
                            ) : (
                                <ImagePlus className="size-4" />
                            )}
                            {t('posts.insert_image')}
                        </button>
                        <input
                            ref={fileInput}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(event) => {
                                const file = event.target.files?.[0];

                                if (file) {
                                    void upload(file);
                                }

                                event.target.value = '';
                            }}
                        />
                    </div>
                )}

                <textarea
                    ref={textarea}
                    name="body"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    rows={22}
                    placeholder={t('posts.body_placeholder')}
                    className={cn(
                        'block min-h-[28rem] w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed outline-none',
                        tab === 'preview' && 'hidden',
                    )}
                />

                {tab === 'preview' && (
                    <div className="min-h-[28rem] p-5">
                        {preview ? (
                            <div
                                className="blog-content"
                                dangerouslySetInnerHTML={{ __html: preview }}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {busy ? '…' : t('posts.nothing_preview')}
                            </p>
                        )}
                    </div>
                )}
            </div>
            <p className="text-xs text-muted-foreground">
                {t('posts.markdown_hint')}
            </p>
            <InputError message={uploadError ?? error} />
        </div>
    );
}

function CoverField({
    current,
    error,
}: {
    current: string | null;
    error?: string;
}) {
    const { t } = useTranslation();
    const [preview, setPreview] = useState<string | null>(current);
    const [removed, setRemoved] = useState(false);
    const input = useRef<HTMLInputElement>(null);

    return (
        <div className="grid gap-2">
            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt=""
                        className="aspect-[16/9] w-full rounded-2xl object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setPreview(null);
                            setRemoved(true);

                            if (input.current) {
                                input.current.value = '';
                            }
                        }}
                        className="absolute top-2 right-2 rounded-full bg-background/90 p-1.5 text-muted-foreground shadow hover:text-destructive"
                        aria-label={t('posts.remove_cover')}
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => input.current?.click()}
                    className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                    <Upload className="size-5" />
                    {t('posts.upload_cover')}
                </button>
            )}
            <input
                ref={input}
                type="file"
                name="cover"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                        setPreview(URL.createObjectURL(file));
                        setRemoved(false);
                    }
                }}
            />
            {removed && <input type="hidden" name="remove_cover" value="1" />}
            <p className="text-xs text-muted-foreground">
                {t('posts.cover_hint')}
            </p>
            <InputError message={error} />
        </div>
    );
}

function SearchPreview({
    title,
    slug,
    description,
}: {
    title: string;
    slug: string;
    description: string;
}) {
    const { t } = useTranslation();
    const host = typeof window === 'undefined' ? '' : window.location.host;

    return (
        <div className="rounded-2xl border bg-background p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
                {t('posts.google_preview')}
            </p>
            <p className="truncate text-xs text-muted-foreground">
                {host} › blog › {slug || '…'}
            </p>
            <p className="mt-0.5 line-clamp-1 text-lg text-[#1a0dab] dark:text-[#8ab4f8]">
                {title || t('posts.title')} - Theapka
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
                {description || t('posts.no_description')}
            </p>
        </div>
    );
}

export default function EditPost({ post }: { post: EditablePost | null }) {
    const { t } = useTranslation();
    const [title, setTitle] = useState(post?.title ?? '');
    const [slug, setSlug] = useState(post?.slug ?? '');
    const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
    const [body, setBody] = useState(post?.body ?? '');
    const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? '');
    const [metaDescription, setMetaDescription] = useState(
        post?.meta_description ?? '',
    );
    const [published, setPublished] = useState(post?.published_at != null);
    const [publishAt, setPublishAt] = useState(
        toLocalInput(post?.published_at ?? null),
    );

    const effectiveSlug = slugify(slug) || slugify(title);
    const plainBody = body
        .replace(/!\[[^\]]*]\([^)]*\)/g, '')
        .replace(/[#>*_`[\]()-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    const state = post ? postStatus(post.published_at) : 'draft';

    return (
        <>
            <Head title={post ? post.title : t('posts.new')} />

            <Form
                {...(post
                    ? PostController.update.form(post.id)
                    : PostController.store.form())}
                options={{ preserveScroll: true }}
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href={PostController.index()}
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="size-4" />
                                {t('admin.blog')}
                            </Link>
                            <div className="ml-auto flex items-center gap-2">
                                {post && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="rounded-full"
                                    >
                                        <a
                                            href={blog.show.url(post.slug)}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <ExternalLink className="size-4" />
                                            {state === 'published'
                                                ? t('posts.view')
                                                : t('posts.preview_page')}
                                        </a>
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-full px-6"
                                >
                                    {processing && <Spinner />}
                                    {t('common.save')}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
                            <div className="space-y-5">
                                <Card>
                                    <Field
                                        label={t('posts.title')}
                                        htmlFor="title"
                                        error={errors.title}
                                    >
                                        <input
                                            id="title"
                                            name="title"
                                            value={title}
                                            onChange={(event) =>
                                                setTitle(event.target.value)
                                            }
                                            required
                                            placeholder={t(
                                                'posts.title_placeholder',
                                            )}
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-serif text-2xl font-semibold shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        />
                                    </Field>

                                    <Field
                                        label={t('posts.slug')}
                                        htmlFor="slug"
                                        error={errors.slug}
                                    >
                                        <div className="flex items-center rounded-md border border-input shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                                            <span className="pl-3 text-sm text-muted-foreground">
                                                /blog/
                                            </span>
                                            <input
                                                id="slug"
                                                name="slug"
                                                value={slug}
                                                onChange={(event) =>
                                                    setSlug(event.target.value)
                                                }
                                                placeholder={
                                                    slugify(title) || 'my-post'
                                                }
                                                className="h-9 min-w-0 flex-1 bg-transparent pr-3 text-sm outline-none"
                                            />
                                        </div>
                                    </Field>

                                    <Field
                                        label={t('posts.excerpt')}
                                        htmlFor="excerpt"
                                        error={errors.excerpt}
                                    >
                                        <textarea
                                            id="excerpt"
                                            name="excerpt"
                                            value={excerpt}
                                            onChange={(event) =>
                                                setExcerpt(event.target.value)
                                            }
                                            rows={2}
                                            maxLength={500}
                                            placeholder={t(
                                                'posts.excerpt_placeholder',
                                            )}
                                            className={textareaClass}
                                        />
                                    </Field>

                                    <MarkdownEditor
                                        value={body}
                                        onChange={setBody}
                                        error={errors.body}
                                    />
                                </Card>
                            </div>

                            <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
                                <Card title={t('posts.publishing')}>
                                    <label className="flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2.5 text-sm">
                                        <span>{t('posts.publish')}</span>
                                        <input
                                            type="checkbox"
                                            checked={published}
                                            onChange={(event) =>
                                                setPublished(
                                                    event.target.checked,
                                                )
                                            }
                                            className="size-4 accent-[var(--primary)]"
                                        />
                                    </label>
                                    <input
                                        type="hidden"
                                        name="published"
                                        value={published ? '1' : '0'}
                                    />
                                    {published && (
                                        <Field
                                            label={t('posts.publish_at')}
                                            htmlFor="publish_at"
                                            error={errors.published_at}
                                        >
                                            <input
                                                id="publish_at"
                                                type="datetime-local"
                                                value={publishAt}
                                                onChange={(event) =>
                                                    setPublishAt(
                                                        event.target.value,
                                                    )
                                                }
                                                className={selectClassName}
                                            />
                                            <input
                                                type="hidden"
                                                name="published_at"
                                                value={
                                                    publishAt
                                                        ? new Date(
                                                              publishAt,
                                                          ).toISOString()
                                                        : ''
                                                }
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {t('posts.publish_at_hint')}
                                            </p>
                                        </Field>
                                    )}

                                    <Field
                                        label={t('posts.language')}
                                        htmlFor="locale"
                                        error={errors.locale}
                                    >
                                        <select
                                            id="locale"
                                            name="locale"
                                            defaultValue={post?.locale ?? 'km'}
                                            className={selectClassName}
                                        >
                                            <option value="km">ភាសាខ្មែរ</option>
                                            <option value="en">English</option>
                                        </select>
                                    </Field>

                                    {post && (
                                        <p className="text-xs text-muted-foreground">
                                            {t('posts.views_count', {
                                                count: post.views,
                                            })}
                                        </p>
                                    )}
                                </Card>

                                <Card title={t('posts.cover')}>
                                    <CoverField
                                        current={post?.cover_url ?? null}
                                        error={errors.cover}
                                    />
                                </Card>

                                <Card title={t('posts.seo')}>
                                    <SearchPreview
                                        title={metaTitle || title}
                                        slug={effectiveSlug}
                                        description={
                                            metaDescription ||
                                            excerpt ||
                                            plainBody.slice(0, 160)
                                        }
                                    />
                                    <div className="grid gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <label
                                                htmlFor="meta_title"
                                                className="text-sm font-medium"
                                            >
                                                {t('posts.meta_title')}
                                            </label>
                                            <Counter
                                                value={metaTitle || title}
                                                max={60}
                                            />
                                        </div>
                                        <Input
                                            id="meta_title"
                                            name="meta_title"
                                            value={metaTitle}
                                            onChange={(event) =>
                                                setMetaTitle(event.target.value)
                                            }
                                            placeholder={title}
                                        />
                                        <InputError
                                            message={errors.meta_title}
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <label
                                                htmlFor="meta_description"
                                                className="text-sm font-medium"
                                            >
                                                {t('posts.meta_description')}
                                            </label>
                                            <Counter
                                                value={
                                                    metaDescription || excerpt
                                                }
                                                max={160}
                                            />
                                        </div>
                                        <textarea
                                            id="meta_description"
                                            name="meta_description"
                                            value={metaDescription}
                                            onChange={(event) =>
                                                setMetaDescription(
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            maxLength={500}
                                            placeholder={t(
                                                'posts.meta_description_placeholder',
                                            )}
                                            className={textareaClass}
                                        />
                                        <InputError
                                            message={errors.meta_description}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('posts.seo_hint')}
                                    </p>
                                </Card>

                                {post && (
                                    <ConfirmDelete
                                        url={PostController.destroy.url(
                                            post.id,
                                        )}
                                        trigger={
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="w-full rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <Trash2 className="size-4" />
                                                {t('posts.delete')}
                                            </Button>
                                        }
                                    />
                                )}
                            </aside>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
