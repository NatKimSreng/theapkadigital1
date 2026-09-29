import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    CheckCircle2,
    CircleAlert,
    Eye,
    Globe,
    Monitor,
    Smartphone,
    Tablet,
    TrendingDown,
    TrendingUp,
    UserRound,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    axisTick,
    ChartCard,
    tooltipProps,
} from '@/components/event/dashboard-charts';
import { AdminPage } from '@/layouts/admin-layout';
import { formatDate, formatNumber } from '@/lib/format';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';

type Row = { label: string; views: number; visitors: number };

type Props = {
    days: number;
    totals: {
        views: number;
        visitors: number;
        previous_views: number;
        today: number;
        today_visitors: number;
    };
    daily: { date: string; views: number; visitors: number }[];
    pages: Row[];
    sources: Row[];
    direct: number;
    devices: { device: 'mobile' | 'desktop' | 'tablet'; views: number }[];
    seo: { key: string; ok: boolean; detail?: number }[];
};

const RANGES = [7, 30, 90];

const DEVICE_ICONS = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };

function Stat({
    icon: Icon,
    label,
    value,
    hint,
}: {
    icon: typeof Eye;
    label: string;
    value: string;
    hint?: ReactNode;
}) {
    return (
        <div className="rounded-2xl border bg-background p-5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="size-4 text-primary" />
                {label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
                {value}
            </p>
            {hint && <div className="mt-1 text-sm">{hint}</div>}
        </div>
    );
}

function TopList({
    title,
    rows,
    empty,
    format = (label) => label,
}: {
    title: string;
    rows: Row[];
    empty: string;
    format?: (label: string) => string;
}) {
    const { t } = useTranslation();
    const top = Math.max(1, ...rows.map((row) => row.views));

    return (
        <section className="min-w-0 rounded-2xl border bg-background p-5">
            <h2 className="mb-4 text-lg font-semibold">{title}</h2>
            {rows.length === 0 ? (
                <p className="rounded-xl bg-muted/60 p-6 text-center text-sm text-muted-foreground">
                    {empty}
                </p>
            ) : (
                <ul className="space-y-2.5">
                    {rows.map((row) => (
                        <li key={row.label} className="relative">
                            <div
                                className="absolute inset-y-0 left-0 rounded-lg bg-primary/12"
                                style={{ width: `${(row.views / top) * 100}%` }}
                            />
                            <div className="relative flex items-center justify-between gap-3 px-2.5 py-1.5 text-sm">
                                <span className="truncate" title={row.label}>
                                    {format(row.label)}
                                </span>
                                <span className="shrink-0 text-muted-foreground tabular-nums">
                                    {formatNumber(row.views)}
                                    <span className="ml-2 text-xs">
                                        {t('analytics.people', {
                                            count: formatNumber(row.visitors),
                                        })}
                                    </span>
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default function AdminAnalytics({
    days,
    totals,
    daily,
    pages,
    sources,
    direct,
    devices,
    seo,
}: Props) {
    const { t, locale } = useTranslation();
    const change =
        totals.previous_views > 0
            ? Math.round(
                  ((totals.views - totals.previous_views) /
                      totals.previous_views) *
                      100,
              )
            : null;
    const deviceTotal = Math.max(
        1,
        devices.reduce((sum, row) => sum + row.views, 0),
    );
    const chart = daily.map((row) => ({
        ...row,
        label: formatDate(row.date, locale).replace(/ \d{4}$/, ''),
    }));
    const passed = seo.filter((item) => item.ok).length;

    // Friendlier names for the pages people visit most.
    const pageName = (path: string) => {
        const named: Record<string, TranslationKey> = {
            '/': 'nav.home',
            '/pricing': 'nav.pricing',
            '/blog': 'nav.blog',
            '/templates': 'nav.templates',
            '/login': 'auth.login',
            '/register': 'auth.register',
        };

        if (named[path]) {
            return `${t(named[path])} (${path})`;
        }

        try {
            return decodeURIComponent(path);
        } catch {
            return path;
        }
    };

    return (
        <>
            <Head title={t('admin.analytics')} />
            <AdminPage
                title={t('admin.analytics')}
                actions={
                    <div className="flex gap-1 rounded-full bg-muted p-1">
                        {RANGES.map((range) => (
                            <Link
                                key={range}
                                href={admin.analytics({
                                    query: { days: range },
                                })}
                                preserveScroll
                                className={cn(
                                    'rounded-full px-4 py-1.5 text-sm transition-colors',
                                    days === range
                                        ? 'bg-background font-medium shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {t('analytics.days', { count: range })}
                            </Link>
                        ))}
                    </div>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat
                        icon={Eye}
                        label={t('analytics.views')}
                        value={formatNumber(totals.views)}
                        hint={
                            change !== null && (
                                <span
                                    className={cn(
                                        'flex items-center gap-1',
                                        change >= 0
                                            ? 'text-emerald-600'
                                            : 'text-red-600',
                                    )}
                                >
                                    {change >= 0 ? (
                                        <TrendingUp className="size-4" />
                                    ) : (
                                        <TrendingDown className="size-4" />
                                    )}
                                    {t('analytics.change', {
                                        change: `${change >= 0 ? '+' : ''}${change}%`,
                                    })}
                                </span>
                            )
                        }
                    />
                    <Stat
                        icon={UserRound}
                        label={t('analytics.visitors')}
                        value={formatNumber(totals.visitors)}
                        hint={
                            <span className="text-muted-foreground">
                                {t('analytics.visitors_hint')}
                            </span>
                        }
                    />
                    <Stat
                        icon={Eye}
                        label={t('analytics.today')}
                        value={formatNumber(totals.today)}
                        hint={
                            <span className="text-muted-foreground">
                                {t('analytics.people', {
                                    count: formatNumber(totals.today_visitors),
                                })}
                            </span>
                        }
                    />
                    <Stat
                        icon={Globe}
                        label={t('analytics.from_other_sites')}
                        value={formatNumber(
                            sources.reduce((sum, row) => sum + row.views, 0),
                        )}
                        hint={
                            <span className="text-muted-foreground">
                                {t('analytics.direct', {
                                    count: formatNumber(direct),
                                })}
                            </span>
                        }
                    />
                </div>

                <div className="mt-6">
                    <ChartCard title={t('analytics.chart')}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chart}
                                margin={{
                                    top: 4,
                                    right: 8,
                                    left: -18,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="views-fill"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="var(--primary)"
                                            stopOpacity={0.35}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="var(--primary)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    vertical={false}
                                    stroke="var(--chart-grid)"
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={axisTick}
                                    tickLine={false}
                                    axisLine={{ stroke: 'var(--chart-grid)' }}
                                    minTickGap={24}
                                />
                                <YAxis
                                    tick={axisTick}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip {...tooltipProps} />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    name={t('analytics.views')}
                                    stroke="var(--primary)"
                                    strokeWidth={2}
                                    fill="url(#views-fill)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="visitors"
                                    name={t('analytics.visitors')}
                                    stroke="var(--series-1)"
                                    strokeWidth={2}
                                    fill="none"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
                    <TopList
                        title={t('analytics.top_pages')}
                        rows={pages}
                        empty={t('analytics.empty')}
                        format={pageName}
                    />
                    <TopList
                        title={t('analytics.sources')}
                        rows={sources}
                        empty={t('analytics.no_sources')}
                    />
                </div>

                <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[1fr_1.4fr]">
                    <section className="rounded-2xl border bg-background p-5">
                        <h2 className="mb-4 text-lg font-semibold">
                            {t('analytics.devices')}
                        </h2>
                        {devices.length === 0 ? (
                            <p className="rounded-xl bg-muted/60 p-6 text-center text-sm text-muted-foreground">
                                {t('analytics.empty')}
                            </p>
                        ) : (
                            <ul className="space-y-4">
                                {devices.map((row) => {
                                    const Icon = DEVICE_ICONS[row.device];
                                    const share = Math.round(
                                        (row.views / deviceTotal) * 100,
                                    );

                                    return (
                                        <li key={row.device}>
                                            <div className="mb-1.5 flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2">
                                                    <Icon className="size-4 text-primary" />
                                                    {t(
                                                        `analytics.device_${row.device}`,
                                                    )}
                                                </span>
                                                <span className="font-semibold tabular-nums">
                                                    {share}%
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary"
                                                    style={{
                                                        width: `${share}%`,
                                                    }}
                                                />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    <section className="rounded-2xl border bg-background p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold">
                                {t('analytics.seo')}
                            </h2>
                            <span className="rounded-full bg-muted px-3 py-0.5 text-sm font-medium tabular-nums">
                                {passed}/{seo.length}
                            </span>
                        </div>
                        <ul className="space-y-2.5">
                            {seo.map((item) => (
                                <li
                                    key={item.key}
                                    className="flex items-start gap-2.5 text-sm"
                                >
                                    {item.ok ? (
                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                    ) : (
                                        <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
                                    )}
                                    <span
                                        className={cn(
                                            !item.ok && 'text-foreground',
                                            item.ok && 'text-muted-foreground',
                                        )}
                                    >
                                        {t(
                                            `analytics.seo_${item.key}` as TranslationKey,
                                            { count: item.detail ?? 0 },
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <Link
                            href={admin.settings.edit()}
                            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                        >
                            {t('analytics.fix_in_settings')}
                        </Link>
                    </section>
                </div>
            </AdminPage>
        </>
    );
}
