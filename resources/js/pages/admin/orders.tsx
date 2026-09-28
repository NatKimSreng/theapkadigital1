import { Head, Link, router } from '@inertiajs/react';
import { Check, ExternalLink, FileText, X } from 'lucide-react';
import { useState } from 'react';
import OrderController from '@/actions/App/Http/Controllers/Admin/OrderController';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { AdminPage } from '@/layouts/admin-layout';
import { formatDateTime } from '@/lib/billing';
import { formatUsd } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import type { Order, OrderStatus, Paginated } from '@/types';

const FILTERS: (OrderStatus | null)[] = [
    null,
    'pending',
    'approved',
    'rejected',
];

function ReviewDialog({
    order,
    onClose,
}: {
    order: Order | null;
    onClose: () => void;
}) {
    const { t, locale } = useTranslation();
    const [note, setNote] = useState('');
    const [processing, setProcessing] = useState(false);

    const receiptUrl = order ? OrderController.receipt.url(order.id) : '';
    const isPdf = order?.receipt_path?.toLowerCase().endsWith('.pdf');

    const decide = (status: 'approved' | 'rejected') => {
        if (!order) {
            return;
        }

        router.patch(
            OrderController.update.url(order.id),
            { status, admin_note: note || null },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    setNote('');
                    onClose();
                },
            },
        );
    };

    return (
        <Dialog
            open={order !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
                {order && (
                    <>
                        <DialogTitle>{t('admin.review')}</DialogTitle>
                        <DialogDescription>
                            {order.user?.name} · {order.user?.email}
                        </DialogDescription>

                        <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-muted/50 p-4 text-sm sm:grid-cols-4">
                            <div>
                                <dt className="text-muted-foreground">
                                    {t('orders.package')}
                                </dt>
                                <dd className="font-medium">
                                    {order.package?.name}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">
                                    {t('orders.event')}
                                </dt>
                                <dd className="font-medium">
                                    {order.event?.name ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">
                                    {t('orders.amount')}
                                </dt>
                                <dd className="font-medium">
                                    {formatUsd(order.amount)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">
                                    {t('checkout.method')}
                                </dt>
                                <dd className="font-medium">
                                    {t(`method.${order.payment_method}`)}
                                    {order.reference && ` · ${order.reference}`}
                                </dd>
                            </div>
                        </dl>

                        {order.note && (
                            <p className="text-sm">
                                <span className="text-muted-foreground">
                                    {t('admin.customer_note')}:
                                </span>{' '}
                                {order.note}
                            </p>
                        )}

                        {order.receipt_path ? (
                            isPdf ? (
                                <a
                                    href={receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-xl border p-4 text-sm font-medium text-primary hover:bg-accent"
                                >
                                    <FileText className="size-5" />
                                    {t('admin.receipt')} (PDF)
                                    <ExternalLink className="ml-auto size-4" />
                                </a>
                            ) : (
                                <a
                                    href={receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block overflow-hidden rounded-xl border bg-muted"
                                >
                                    <img
                                        src={receiptUrl}
                                        alt={t('admin.receipt')}
                                        className="mx-auto max-h-[50svh] object-contain"
                                    />
                                </a>
                            )
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {t('admin.no_receipt')}
                            </p>
                        )}

                        {order.status === 'pending' ? (
                            <>
                                <label className="grid gap-1.5 text-sm font-medium">
                                    {t('admin.note')}
                                    <textarea
                                        value={note}
                                        onChange={(event) =>
                                            setNote(event.target.value)
                                        }
                                        rows={2}
                                        maxLength={500}
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    />
                                </label>
                                <div className="flex flex-wrap justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        className="rounded-full text-destructive"
                                        disabled={processing}
                                        onClick={() => decide('rejected')}
                                    >
                                        <X className="size-4" />
                                        {t('admin.reject')}
                                    </Button>
                                    <Button
                                        className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                                        disabled={processing}
                                        onClick={() => decide('approved')}
                                    >
                                        <Check className="size-4" />
                                        {t('admin.approve')}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <StatusBadge status={order.status} />
                                {order.reviewer &&
                                    t('admin.reviewed_by', {
                                        name: order.reviewer.name,
                                    })}
                                {' · '}
                                {formatDateTime(order.reviewed_at, locale)}
                                {order.admin_note && (
                                    <p className="w-full text-foreground">
                                        {order.admin_note}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default function AdminOrders({
    orders,
    status,
    counts,
}: {
    orders: Paginated<Order>;
    status: OrderStatus | null;
    counts: Partial<Record<OrderStatus, number>>;
}) {
    const { t, locale } = useTranslation();
    const [reviewing, setReviewing] = useState<Order | null>(null);
    const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);

    return (
        <>
            <Head title={t('admin.orders')} />
            <AdminPage title={t('admin.orders')}>
                <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1">
                    {FILTERS.map((filter) => (
                        <Link
                            key={filter ?? 'all'}
                            href={admin.orders.index({
                                query: filter ? { status: filter } : {},
                            })}
                            preserveScroll
                            className={cn(
                                'flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm whitespace-nowrap text-muted-foreground',
                                status === filter &&
                                    'border-primary bg-primary text-primary-foreground',
                            )}
                        >
                            {filter
                                ? t(`order_status.${filter}`)
                                : t('admin.all')}
                            <span className="text-xs opacity-80">
                                {filter ? (counts[filter] ?? 0) : total}
                            </span>
                        </Link>
                    ))}
                </div>

                {orders.data.length === 0 ? (
                    <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                        {t('admin.no_orders')}
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border bg-background">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        {t('admin.customer')}
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        {t('orders.package')}
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        {t('orders.amount')}
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        {t('orders.date')}
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        {t('orders.status')}
                                    </th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.data.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3">
                                            {order.user ? (
                                                <Link
                                                    href={admin.users.show(
                                                        order.user.id,
                                                    )}
                                                    className="font-medium hover:text-primary"
                                                >
                                                    {order.user.name}
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {order.user?.email}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">
                                                {order.package?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {order.event?.name ?? '—'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">
                                            <p className="font-medium">
                                                {formatUsd(order.amount)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {t(
                                                    `method.${order.payment_method}`,
                                                )}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {formatDateTime(
                                                order.created_at,
                                                locale,
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                status={order.status}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                size="sm"
                                                variant={
                                                    order.status === 'pending'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                className="rounded-full"
                                                onClick={() =>
                                                    setReviewing(order)
                                                }
                                            >
                                                {order.status === 'pending'
                                                    ? t('admin.review')
                                                    : t('admin.receipt')}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination page={orders} />
            </AdminPage>

            <ReviewDialog
                order={reviewing}
                onClose={() => setReviewing(null)}
            />
        </>
    );
}
