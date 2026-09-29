import { Link } from '@inertiajs/react';
import { CalendarDays, Newspaper } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import blog from '@/routes/blog';
import type { PostSummary } from '@/types';

export function PostCover({
    post,
    className,
}: {
    post: Pick<PostSummary, 'cover_url' | 'title'>;
    className?: string;
}) {
    return post.cover_url ? (
        <img
            src={post.cover_url}
            alt={post.title}
            loading="lazy"
            className={cn('object-cover', className)}
        />
    ) : (
        <div
            className={cn(
                'flex items-center justify-center bg-gradient-to-br from-accent to-primary/25 text-primary',
                className,
            )}
        >
            <Newspaper className="size-10 opacity-70" />
        </div>
    );
}

export function PostCard({ post }: { post: PostSummary }) {
    const { locale } = useTranslation();

    return (
        <Link
            href={blog.show(post.slug)}
            className="group flex flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/10"
        >
            <PostCover
                post={post}
                className="aspect-[16/9] w-full transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="flex flex-1 flex-col gap-2 p-5">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {formatDate(post.published_at, locale)}
                </p>
                <h3
                    lang={post.locale}
                    className="font-serif text-xl leading-snug font-semibold transition-colors group-hover:text-primary"
                >
                    {post.title}
                </h3>
                {post.excerpt && (
                    <p
                        lang={post.locale}
                        className="line-clamp-3 text-sm text-muted-foreground"
                    >
                        {post.excerpt}
                    </p>
                )}
            </div>
        </Link>
    );
}
