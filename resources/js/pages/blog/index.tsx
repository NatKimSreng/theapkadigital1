import { Head } from '@inertiajs/react';
import { Newspaper } from 'lucide-react';
import { PostCard } from '@/components/blog/post-card';
import { Pagination } from '@/components/pagination';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { useTranslation } from '@/lib/i18n';
import type { Paginated, PostSummary } from '@/types';

export default function BlogIndex({
    posts,
}: {
    posts: Paginated<PostSummary>;
}) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('blog.title')} />
            <div className="min-h-svh bg-background">
                <div className="relative">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,var(--accent),transparent_65%)]"
                    />
                    <PublicHeader />

                    <main className="relative mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6">
                        <header className="mx-auto max-w-2xl text-center">
                            <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
                                {t('blog.eyebrow')}
                            </p>
                            <h1 className="mt-3 font-serif text-5xl font-semibold">
                                {t('blog.title')}
                            </h1>
                            <p className="mt-4 text-muted-foreground">
                                {t('blog.subtitle')}
                            </p>
                        </header>

                        {posts.data.length === 0 ? (
                            <div className="mx-auto mt-14 max-w-md rounded-3xl border border-dashed p-12 text-center text-muted-foreground">
                                <Newspaper className="mx-auto mb-3 size-10 text-primary/60" />
                                {t('blog.empty')}
                            </div>
                        ) : (
                            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {posts.data.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>
                        )}

                        <Pagination page={posts} />
                    </main>
                </div>
                <PublicFooter />
            </div>
        </>
    );
}
