import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import type { Paginated } from '@/types';

export function Pagination({ page }: { page: Paginated<unknown> }) {
    const { t } = useTranslation();

    if (page.last_page <= 1) {
        return null;
    }

    return (
        <nav className="mt-5 flex items-center justify-between gap-3 text-sm">
            <Button
                asChild={page.prev_page_url !== null}
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page.prev_page_url === null}
            >
                {page.prev_page_url ? (
                    <Link href={page.prev_page_url} preserveScroll>
                        <ChevronLeft className="size-4" />
                        {t('admin.previous')}
                    </Link>
                ) : (
                    <span>
                        <ChevronLeft className="size-4" />
                        {t('admin.previous')}
                    </span>
                )}
            </Button>
            <span className="text-muted-foreground tabular-nums">
                {page.current_page} / {page.last_page}
            </span>
            <Button
                asChild={page.next_page_url !== null}
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page.next_page_url === null}
            >
                {page.next_page_url ? (
                    <Link href={page.next_page_url} preserveScroll>
                        {t('admin.next')}
                        <ChevronRight className="size-4" />
                    </Link>
                ) : (
                    <span>
                        {t('admin.next')}
                        <ChevronRight className="size-4" />
                    </span>
                )}
            </Button>
        </nav>
    );
}
