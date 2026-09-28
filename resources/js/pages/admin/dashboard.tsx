import { Head, Link } from '@inertiajs/react';
import {
    CalendarHeart,
    Clock,
    DollarSign,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    axisTick,
    ChartCard,
    compactUsd,
    tooltipProps,
} from '@/components/event/dashboard-charts';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { AdminPage } from '@/layouts/admin-layout';
import { formatDateTime } from '@/lib/billing';
import { formatNumber, formatUsd } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import type { Order } from '@/types';

type Props = {
    stats: {
        revenue: number;
        revenue_month: number;
        pending: number;
        users: number;
        events: number;
        paid_events: number;
    };
    months: { month: string; revenue: number; users: number }[];
    packages: {
        id: number;
        name: string;
        price: number;
        sales: number;
        revenue: number | null;
    }[];
    pendingOrders: Order[];
};

function Stat({
    icon: Icon,
    tone,
    label,
    value,
    hint,
}: {
    icon: typeof Users;
    tone: string;
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <div className="rounded-2xl border bg-background p-5">
            <div className="flex items-center gap-3">
                <span
                    className={cn(
                        'flex size-10 items-center justify-center rounded-xl',
                        tone,
                    )}
                >
                    <Icon className="size-5" />
                </span>
                <p className="text-sm font-medium text-muted-foreground">
                    {label}
                </p>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
            {hint && (
                <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
            )}
        </div>
    );
}

export default function AdminDashboard({
    stats,
    months,
    packages,
    pendingOrders,
}: Props) {
    const { t, locale } = useTranslation();

    const monthLabel = (value: string) =>
        new Date(`${value}-01T00:00:00`).toLocaleDateString(
            locale === 'km' ? 'km-KH' : 'en-GB',
            { month: 'short' },
        );
    const chartData = months.map((row) => ({
        ...row,
        label: monthLabel(row.month),
    }));
    const topRevenue = Math.max(1, ...packages.map((pkg) => pkg.revenue ?? 0));

    return (
        <>
            <Head title={t('admin.overview')} />
            <AdminPage title={t('admin.overview')}>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat
                        icon={DollarSign}
                        tone="bg-accent text-primary"
                        label={t('admin.revenue')}
                        value={formatUsd(stats.revenue)}
                        hint={`${t('admin.revenue_month')}: ${formatUsd(stats.revenue_month)}`}
                    />
                    <Stat
                        icon={Clock}
                        tone="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        label={t('admin.pending')}
                        value={formatNumber(stats.pending)}
                    />
                    <Stat
                        icon={Users}
                        tone="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        label={t('admin.users_total')}
                        value={formatNumber(stats.users)}
                    />
                    <Stat
                        icon={CalendarHeart}
                        tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        label={t('admin.events_total')}
                        value={formatNumber(stats.events)}
                        hint={t('admin.paid_events', {
                            count: formatNumber(stats.paid_events),
                        })}
                    />
                </div>

                <section className="mt-6 rounded-2xl border bg-background p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">
                            {t('admin.review_now')}
                        </h2>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                        >
                            <Link
                                href={admin.orders.index({
                                    query: { status: 'pending' },
                                })}
                            >
                                {t('admin.view_all')}
                            </Link>
                        </Button>
                    </div>
                    {pendingOrders.length === 0 ? (
                        <p className="rounded-xl bg-muted/60 p-6 text-center text-sm text-muted-foreground">
                            {t('admin.no_pending')}
                        </p>
                    ) : (
                        <ul className="divide-y">
                            {pendingOrders.map((order) => (
                                <li
                                    key={order.id}
                                    className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3"
                                >
                                    <div className="min-w-40 flex-1">
                                        <p className="font-medium">
                                            {order.user?.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.package?.name} ·{' '}
                                            {order.event?.name} ·{' '}
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

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <ChartCard title={t('admin.revenue_chart')}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 4,
                                    right: 4,
                                    left: -12,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    vertical={false}
                                    stroke="var(--chart-grid)"
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={axisTick}
                                    tickLine={false}
                                    axisLine={{ stroke: 'var(--chart-grid)' }}
                                />
                                <YAxis
                                    tick={axisTick}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={compactUsd}
                                />
                                <Tooltip
                                    {...tooltipProps}
                                    formatter={(value) => [
                                        formatUsd(Number(value)),
                                        null,
                                    ]}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="var(--primary)"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                    <ChartCard title={t('admin.users_chart')}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 4,
                                    right: 4,
                                    left: -20,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    vertical={false}
                                    stroke="var(--chart-grid)"
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={axisTick}
                                    tickLine={false}
                                    axisLine={{ stroke: 'var(--chart-grid)' }}
                                />
                                <YAxis
                                    tick={axisTick}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    {...tooltipProps}
                                    formatter={(value) => [value, null]}
                                />
                                <Bar
                                    dataKey="users"
                                    fill="var(--series-1)"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <section className="mt-6 rounded-2xl border bg-background p-5">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                        <TrendingUp className="size-5 text-primary" />
                        {t('admin.sales_by_package')}
                    </h2>
                    <ul className="space-y-4">
                        {packages.map((pkg) => (
                            <li key={pkg.id}>
                                <div className="mb-1.5 flex flex-wrap justify-between gap-2 text-sm">
                                    <span className="font-medium">
                                        {pkg.name}{' '}
                                        <span className="text-muted-foreground">
                                            ·{' '}
                                            {t('admin.sales', {
                                                count: pkg.sales,
                                            })}
                                        </span>
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {formatUsd(pkg.revenue ?? 0)}
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary"
                                        style={{
                                            width: `${((pkg.revenue ?? 0) / topRevenue) * 100}%`,
                                        }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </AdminPage>
        </>
    );
}
