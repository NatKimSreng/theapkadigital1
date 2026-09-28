import { Head, Link } from '@inertiajs/react';
import { Receipt } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, packageName } from '@/lib/billing';
import { formatUsd } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { pricing } from '@/routes';
import type { Order } from '@/types';

export default function Orders({ orders }: { orders: Order[] }) {
    const { t, locale } = useTranslation();

    return (
        <>
            <Head title={t('orders.title')} />

            <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl font-semibold">
                            {t('orders.title')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('orders.subtitle')}
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-full">
                        <Link href={pricing()}>{t('orders.see_packages')}</Link>
                    </Button>
                </div>

                {orders.length === 0 ? (
                    <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
                        <Receipt className="size-8 text-primary" />
                        {t('orders.empty')}
                    </div>
                ) : (
                    <ul className="mt-6 divide-y rounded-2xl border bg-background">
                        {orders.map((order) => (
                            <li
                                key={order.id}
                                className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4"
                            >
                                <div className="min-w-40 flex-1">
                                    <p className="font-semibold">
                                        {order.package
                                            ? packageName(order.package, locale)
                                            : '—'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.event?.name ?? '—'} ·{' '}
                                        {formatDateTime(
                                            order.created_at,
                                            locale,
                                        )}
                                    </p>
                                    {order.admin_note && (
                                        <p className="mt-1 text-sm">
                                            <span className="text-muted-foreground">
                                                {t('orders.admin_note')}:
                                            </span>{' '}
                                            {order.admin_note}
                                        </p>
                                    )}
                                </div>
                                <p className="font-semibold tabular-nums">
                                    {formatUsd(order.amount)}
                                </p>
                                <StatusBadge status={order.status} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
