import { Head, router, usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import { AdminInviteLinks } from '@/components/admin-invite-links';
import type { InviteLink } from '@/components/admin-invite-links';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { AdminPage } from '@/layouts/admin-layout';
import { formatDateTime } from '@/lib/billing';
import { formatDate, formatUsd } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import type { Order, Package, PlannerEvent, User } from '@/types';

type Props = {
    user: User & { events_count: number; orders_count: number };
    events: (PlannerEvent & { invite_links: InviteLink[] })[];
    orders: Order[];
    packages: Pick<Package, 'id' | 'name' | 'is_default'>[];
};

export default function AdminUser({ user, events, orders, packages }: Props) {
    const { t, locale } = useTranslation();
    const { auth } = usePage().props;
    const isSelf = auth.user.id === user.id;
    const freeId = packages.find((pkg) => pkg.is_default)?.id;

    const update = (data: Record<string, boolean>) =>
        router.patch(UserController.update.url(user.id), data, {
            preserveScroll: true,
        });

    const changePackage = (eventId: number, value: string) =>
        router.patch(
            UserController.updateEventPackage.url(eventId),
            { package_id: value ? Number(value) : null },
            { preserveScroll: true },
        );

    return (
        <>
            <Head title={user.name} />
            <AdminPage
                title={user.name}
                actions={
                    !isSelf && (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                className="rounded-full"
                                onClick={() =>
                                    update({ is_admin: !user.is_admin })
                                }
                            >
                                <ShieldCheck className="size-4" />
                                {user.is_admin
                                    ? t('admin.remove_admin')
                                    : t('admin.make_admin')}
                            </Button>
                            <Button
                                variant={
                                    user.disabled_at ? 'default' : 'outline'
                                }
                                className={
                                    user.disabled_at
                                        ? 'rounded-full'
                                        : 'rounded-full text-destructive'
                                }
                                onClick={() =>
                                    update({ disabled: !user.disabled_at })
                                }
                            >
                                {user.disabled_at
                                    ? t('admin.enable')
                                    : t('admin.disable')}
                            </Button>
                        </div>
                    )
                }
            >
                <div className="-mt-4 mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {user.email}
                    <span>·</span>
                    {t('admin.joined')}{' '}
                    {formatDateTime(user.created_at, locale)}
                    {user.is_admin && (
                        <span className="rounded-full bg-accent px-2 text-xs text-accent-foreground">
                            {t('admin.is_admin')}
                        </span>
                    )}
                    {user.disabled_at && (
                        <span className="rounded-full bg-red-100 px-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                            {t('admin.disabled')}
                        </span>
                    )}
                </div>

                <section>
                    <h2 className="mb-3 text-lg font-semibold">
                        {t('admin.events_total')}
                    </h2>
                    {events.length === 0 ? (
                        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                            {t('admin.no_events')}
                        </p>
                    ) : (
                        <ul className="divide-y rounded-2xl border bg-background">
                            {events.map((event) => (
                                <li
                                    key={event.id}
                                    className="flex flex-wrap items-center gap-x-5 gap-y-2 p-4"
                                >
                                    <div className="min-w-48 flex-1">
                                        <p className="font-medium">
                                            {event.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(
                                                event.event_date,
                                                locale,
                                            )}{' '}
                                            ·{' '}
                                            {t('admin.guests', {
                                                count: event.guests_count ?? 0,
                                            })}
                                        </p>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">
                                            {t('orders.package')}
                                        </span>
                                        <select
                                            value={
                                                event.package_id ?? freeId ?? ''
                                            }
                                            onChange={(e) =>
                                                changePackage(
                                                    event.id,
                                                    e.target.value,
                                                )
                                            }
                                            className="h-9 rounded-full border border-input bg-background px-3 text-sm"
                                        >
                                            {packages.map((pkg) => (
                                                <option
                                                    key={pkg.id}
                                                    value={pkg.id}
                                                >
                                                    {pkg.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <AdminInviteLinks
                                        links={event.invite_links}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="mt-8">
                    <h2 className="mb-3 text-lg font-semibold">
                        {t('admin.orders')}
                    </h2>
                    {orders.length === 0 ? (
                        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                            {t('admin.no_orders')}
                        </p>
                    ) : (
                        <ul className="divide-y rounded-2xl border bg-background">
                            {orders.map((order) => (
                                <li
                                    key={order.id}
                                    className="flex flex-wrap items-center gap-x-5 gap-y-1 p-4"
                                >
                                    <div className="min-w-48 flex-1">
                                        <p className="font-medium">
                                            {order.package?.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.event?.name ?? '—'} ·{' '}
                                            {formatDateTime(
                                                order.created_at,
                                                locale,
                                            )}
                                        </p>
                                    </div>
                                    <span className="font-semibold tabular-nums">
                                        {formatUsd(order.amount)}
                                    </span>
                                    <StatusBadge status={order.status} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </AdminPage>
        </>
    );
}
