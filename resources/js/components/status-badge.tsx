import { statusStyles } from '@/lib/billing';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

export function StatusBadge({ status }: { status: OrderStatus }) {
    const { t } = useTranslation();

    return (
        <span
            className={cn(
                'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
                statusStyles[status],
            )}
        >
            {t(`order_status.${status}`)}
        </span>
    );
}
