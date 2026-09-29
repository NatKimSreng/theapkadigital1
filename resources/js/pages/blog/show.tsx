import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Clock,
    Link2,
    Pencil,
} from 'lucide-react';
import { useState } from 'react';
import { PostCard, PostCover } from '@/components/blog/post-card';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { register } from '@/routes';
import admin from '@/routes/admin';
import blog from '@/routes/blog';
import type { PostDetail, PostSummary } from '@/types';

function ShareLinks({ title }: { title: string }) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const url = typeof window === 'undefined' ? '' : window.location.href;
    const encoded = encodeURIComponent(url);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard can be blocked; the other share buttons still work.
        }
    };

    const links = [
        {
            label: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
        },
        {
            label: 'Telegram',
            href: `https://t.me/share/url?url=${encoded}&text=${encodeURIComponent(title)}`,
        },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
                {t('blog.share')}
            </span>
            {links.map((link) => (
                <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border px-3 py-1 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                    {link.label}
                </a>
            ))}
            <button
                type="button"
                onClick={copy}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors hover:border-primary hover:text-primary"
            >
                <Link2 className="size-3.5" />
                {copied ? t('blog.copied') : t('blog.copy_link')}
            </button>
        </div>
    );
}

export default function BlogShow({
    post,
    related,
}: {
    post: PostDetail;
    related: PostSummary[];
}) {
    const { auth } = usePage().props;
    const { t, locale } = useTranslation();

    return (
        <>
            <Head title={post.title} />
            <div className="min-h-svh bg-background">
                <PublicHeader />

                <main className="mx-auto max-w-6xl px-4 pt-4 pb-24 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link
                            href={blog.index()}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            {t('blog.back')}
                        </Link>
                        {auth.user?.is_admin && (
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                            >
                                <Link href={admin.posts.edit(post.id)}>
                                    <Pencil className="size-3.5" />
                                    {t('blog.edit')}
                                </Link>
                            </Button>
                        )}
                    </div>

                    {!post.is_published && (
                        <p className="mx-auto mt-6 max-w-3xl rounded-2xl bg-amber-100 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                            {t('blog.draft_notice')}
                        </p>
                    )}

                    <article lang={post.locale} className="mx-auto max-w-3xl">
                        <header className="mt-8 text-center">
                            <h1 className="font-serif text-4xl leading-tight font-semibold text-balance sm:text-5xl">
                                {post.title}
                            </h1>
                            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays className="size-4" />
                                    {formatDate(post.published_at, locale)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="size-4" />
                                    {t('blog.minutes', {
                                        count: post.reading_minutes,
                                    })}
                                </span>
                            </p>
                        </header>

                        {post.cover_url && (
                            <PostCover
                                post={post}
                                className="mt-10 aspect-[16/9] w-full rounded-3xl shadow-lg"
                            />
                        )}

                        <div
                            className="blog-content mt-10"
                            dangerouslySetInnerHTML={{ __html: post.html }}
                        />

                        <div className="mt-12 border-t pt-6">
                            <ShareLinks title={post.title} />
                        </div>
                    </article>

                    <section className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-3xl bg-[oklch(0.22_0.012_60)] p-8 text-center text-[oklch(0.96_0.01_85)]">
                        <h2 className="font-serif text-3xl font-semibold">
                            {t('welcome.cta_title')}
                        </h2>
                        <p className="mt-3 text-[oklch(0.8_0.02_80)]">
                            {t('welcome.cta_sub')}
                        </p>
                        <Button
                            asChild
                            className="mt-6 rounded-full bg-[oklch(0.78_0.11_82)] px-6 text-[oklch(0.2_0.02_60)] hover:bg-[oklch(0.84_0.1_85)]"
                        >
                            <Link href={register()}>
                                {t('welcome.start')}
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </section>

                    {related.length > 0 && (
                        <section className="mt-20">
                            <h2 className="mb-6 font-serif text-3xl font-semibold">
                                {t('blog.related')}
                            </h2>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {related.map((item) => (
                                    <PostCard key={item.id} post={item} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>
                <PublicFooter />
            </div>
        </>
    );
}
