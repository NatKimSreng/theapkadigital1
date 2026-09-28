import type { ReactNode } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { formatUsd } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import type { EventSummary } from '@/types';

export const axisTick = { fill: 'var(--chart-axis)', fontSize: 12 };

export const tooltipProps = {
    contentStyle: {
        background: 'var(--popover)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        color: 'var(--popover-foreground)',
        fontSize: 13,
    },
    itemStyle: { color: 'var(--popover-foreground)' },
    labelStyle: { color: 'var(--muted-foreground)' },
    cursor: { fill: 'var(--muted)', opacity: 0.6 },
};

export const compactUsd = (value: number) =>
    Math.abs(value) >= 1000 ? `$${Math.round(value / 100) / 10}k` : `$${value}`;

export function ChartCard({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="flex min-w-0 flex-col rounded-2xl border p-5">
            <h2 className="mb-4 text-lg font-semibold">{title}</h2>
            <div className="h-72 min-w-0">{children}</div>
        </section>
    );
}

function Empty() {
    const { t } = useTranslation();

    return (
        <div className="flex h-full items-center justify-center rounded-xl bg-muted/50 text-sm text-muted-foreground">
            {t('chart.empty')}
        </div>
    );
}

export function GuestChart({ guests }: { guests: EventSummary['guests'] }) {
    const { t } = useTranslation();

    if (guests.total === 0) {
        return <Empty />;
    }

    // Guest replies are a status, so they use the reserved status colors (always paired with a label).
    const data = [
        {
            key: 'confirmed',
            name: t('status.confirmed'),
            value: guests.confirmed,
            color: 'var(--status-good)',
        },
        {
            key: 'pending',
            name: t('status.pending'),
            value: guests.pending,
            color: 'var(--status-warning)',
        },
        {
            key: 'declined',
            name: t('status.declined'),
            value: guests.declined,
            color: 'var(--status-critical)',
        },
    ].filter((row) => row.value > 0);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="52%"
                    outerRadius="78%"
                    stroke="var(--card)"
                    strokeWidth={2}
                    label={({ value }) =>
                        `${Math.round(((value as number) / guests.total) * 100)}%`
                    }
                    labelLine={false}
                    isAnimationActive={false}
                >
                    {data.map((row) => (
                        <Cell key={row.key} fill={row.color} />
                    ))}
                </Pie>
                <Tooltip {...tooltipProps} />
                <Legend
                    iconType="circle"
                    itemSorter={null}
                    formatter={(value, entry) => (
                        <span className="text-sm text-foreground">
                            {value} (
                            {(entry.payload as { value: number }).value})
                        </span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

export function FinanceChart({ summary }: { summary: EventSummary }) {
    const { t } = useTranslation();

    const data = [
        { name: t('finance.gifts'), value: summary.gifts.total_usd },
        { name: t('finance.estimated'), value: summary.expenses.estimated },
        { name: t('finance.actual'), value: summary.expenses.actual },
        { name: t('finance.balance'), value: summary.balance },
    ];

    if (data.every((row) => row.value === 0)) {
        return <Empty />;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
            >
                <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
                <XAxis
                    type="number"
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={compactUsd}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    tick={axisTick}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--chart-grid)' }}
                    interval={0}
                    width={110}
                />
                <Tooltip
                    {...tooltipProps}
                    formatter={(value) => [formatUsd(Number(value)), null]}
                />
                <Bar
                    dataKey="value"
                    fill="var(--series-1)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={28}
                    isAnimationActive={false}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}

export function ExpenseChart({
    categories,
}: {
    categories: EventSummary['expenses']['by_category'];
}) {
    const { t } = useTranslation();

    if (categories.length === 0) {
        return <Empty />;
    }

    const data = categories.map((row) => ({
        name: t(`category.${row.category}`),
        estimated: row.estimated,
        actual: row.actual,
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                barGap={2}
            >
                <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
                <XAxis
                    type="number"
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={compactUsd}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    tick={axisTick}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--chart-grid)' }}
                    interval={0}
                    width={110}
                />
                <Tooltip
                    {...tooltipProps}
                    formatter={(value, name) => [
                        formatUsd(Number(value)),
                        name,
                    ]}
                />
                <Legend
                    iconType="circle"
                    itemSorter={null}
                    formatter={(value) => (
                        <span className="text-sm text-foreground">{value}</span>
                    )}
                />
                <Bar
                    dataKey="estimated"
                    name={t('expense.estimated')}
                    fill="var(--series-1)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={14}
                    isAnimationActive={false}
                />
                <Bar
                    dataKey="actual"
                    name={t('expense.actual')}
                    fill="var(--series-2)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={14}
                    isAnimationActive={false}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
