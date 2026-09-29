import { Form, Head, Link } from '@inertiajs/react';
import { Eye, Plus, Search } from 'lucide-react';
import PostController from '@/actions/App/Http/Controllers/Admin/PostController';
import { PostCover } from '@/components/blog/post-card';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminPage } from '@/layouts/admin-layout';
import { formatDateTime } from '@/lib/billing';
import { postStatus, statusBadge } from '@/lib/blog';
import { formatNumber } from '@/lib/format';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { AdminPost, Paginated } from '@/types';

type Status = 'all' | 'published' | 'scheduled' | 'draft';

const STATUSES: { value: Status; label: TranslationKey }[] = [
    { value: 'all', label: 'admin.all' },
    { value: 'published', label: 'posts.published' },
    { value: 'scheduled', label: 'posts.scheduled' },
    { value: 'draft', label: 'posts.draft' },
];

export default function AdminPosts({
    posts,
    search,
    status,
}: {
    posts: Paginated<AdminPost>;
    search: string;
    status: Status;
}) {
    const { t, locale } = useTranslation();

    return (
        <>
            <Head title={t('admin.blog')} />
            <AdminPage
                title={t('admin.blog')}
                actions={
                    <Button asChild className="rounded-full">
                        <Link href={PostController.create()}>
                            <Plus className="size-4" />
                            {t('posts.new')}
                        </Link>
                    </Button>
                }
            >
                <div className="mb-5 flex flex-wrap items-center gap-3">
                    <div className="flex gap-1 rounded-full bg-muted p-1">
                        {STATUSES.map((item) => (
                            <Link
                                key={item.value}
                                href={PostController.index({
                                    query: {
                                        status: item.value,
                                        search: search || undefined,
                                    },
                                })}
                                preserveState
                                className={cn(
                                    'rounded-full px-4 py-1.5 text-sm transition-colors',
                                    status === item.value
                                        ? 'bg-background font-medium shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {t(item.label)}
                            </Link>
                        ))}
                    </div>
                    <Form
                        {...PostController.index.form()}
                        className="relative w-full max-w-xs"
                    >
                        <input type="hidden" name="status" value={status} />
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            name="search"
                            type="search"
                            defaultValue={search}
                            placeholder={t('posts.search')}
                            className="rounded-full pl-9"
                        />
                    </Form>
                </div>

                {posts.data.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                        <p>{t('posts.empty')}</p>
                        <Button asChild className="mt-4 rounded-full">
                            <Link href={PostController.create()}>
                                <Plus className="size-4" />
                                {t('posts.new')}
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <ul className="divide-y rounded-2xl border bg-background">
                        {posts.data.map((post) => {
                            const state = postStatus(post.published_at);

                            return (
                                <li key={post.id}>
                                    <Link
                                        href={PostController.edit(post.id)}
                                        className="flex items-center gap-4 p-3 transition-colors hover:bg-accent/50"
                                    >
                                        <PostCover
                                            post={post}
                                            className="aspect-[16/10] w-24 shrink-0 rounded-xl sm:w-32"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p
                                                lang={post.locale}
                                                className="truncate font-medium"
                                            >
                                                {post.title}
                                            </p>
                                            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2 py-0.5 font-medium',
                                                        statusBadge[state],
                                                    )}
                                                >
                                                    {t(`posts.${state}`)}
                                                </span>
                                                <span className="uppercase">
                                                    {post.locale}
                                                </span>
                                                <span>
                                                    {state === 'draft'
                                                        ? `${t('posts.updated')} ${formatDateTime(post.updated_at, locale)}`
                                                        : formatDateTime(
                                                              post.published_at,
                                                              locale,
                                                          )}
                                                </span>
                                            </p>
                                        </div>
                                        <span className="hidden items-center gap-1 text-sm text-muted-foreground tabular-nums sm:flex">
                                            <Eye className="size-4" />
                                            {formatNumber(post.views)}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <Pagination page={posts} />
            </AdminPage>
        </>
    );
}
