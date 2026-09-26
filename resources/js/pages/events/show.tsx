import type { ReactNode } from 'react';
import {
    ChartCard,
    ExpenseChart,
    FinanceChart,
    GuestChart,
} from '@/components/event/dashboard-charts';
import { EventShell } from '@/components/event/event-shell';
import { formatKhr, formatNumber, formatUsd } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { EventSummary, PlannerEvent } from '@/types';

const tones = {
    blue: 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
    purple: 'border-violet-100 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-300',
    rose: 'border-rose-100 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300',
    cyan: 'border-cyan-100 bg-cyan-50 text-cyan-700 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-300',
};

function StatCard({
    tone,
    value,
    label,
    children,
}: {
    tone: keyof typeof tones;
    value: string;
    label: ReactNode;
    children?: ReactNode;
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-1 rounded-2xl border p-4 sm:min-h-40',
                tones[tone],
            )}
        >
            <p className="text-3xl font-bold">{value}</p>
            <div className="text-foreground">{label}</div>
            {children}
        </div>
    );
}

export default function EventDashboard({
    event,
    summary,
}: {
    event: PlannerEvent;
    summary: EventSummary;
}) {
    const { t } = useTranslation();
    const { expenses, gifts, guests } = summary;

    const limit = expenses.budget > 0 ? expenses.budget : expenses.estimated;
    const spentPercent =
        limit > 0 ? Math.round((expenses.actual / limit) * 100) : 0;

    return (
        <EventShell event={event} title={t('dashboard.title')}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                    tone="blue"
                    value={formatNumber(guests.total)}
                    label={t('stat.guests_invited')}
                >
                    <p className="mt-auto text-sm opacity-80">
                        {t('stat.people', { count: guests.people })}
                    </p>
                </StatCard>

                <StatCard
                    tone="green"
                    value={formatNumber(guests.confirmed)}
                    label={t('stat.confirmed')}
                />

                <StatCard
                    tone="purple"
                    value={formatUsd(gifts.total_usd)}
                    label={t('stat.gifts_total')}
                >
                    <p className="text-sm text-foreground">
                        {formatUsd(gifts.usd)} + {formatKhr(gifts.khr)}{' '}
                        <span className="text-muted-foreground">
                            {t('stat.in_riel')}
                        </span>
                    </p>
                    <p className="mt-auto text-xs opacity-80">
                        {t('stat.rate')}: 1 USD ={' '}
                        {formatNumber(event.exchange_rate)} KHR
                    </p>
                </StatCard>

                <StatCard
                    tone="rose"
                    value={formatUsd(expenses.actual)}
                    label={t('stat.expenses')}
                >
                    <div className="mt-auto space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span>
                                {t('stat.actual')}: {formatUsd(expenses.actual)}
                            </span>
                            <span>
                                {expenses.budget > 0
                                    ? t('expense.budget')
                                    : t('stat.estimated')}
                                : {formatUsd(limit)}
                            </span>
                        </div>
                        <div
                            className="h-2.5 overflow-hidden rounded-full bg-rose-200/70 dark:bg-rose-900/50"
                            role="progressbar"
                            aria-valuenow={spentPercent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            <div
                                className={cn(
                                    'h-full rounded-full',
                                    spentPercent > 100
                                        ? 'bg-red-600'
                                        : 'bg-rose-500',
                                )}
                                style={{
                                    width: `${Math.min(spentPercent, 100)}%`,
                                }}
                            />
                        </div>
                        <p className="text-right text-xs">{spentPercent}%</p>
                    </div>
                </StatCard>

                <StatCard
                    tone="cyan"
                    value={formatUsd(summary.balance)}
                    label={t('stat.balance')}
                >
                    <p className="mt-auto text-xs opacity-80">
                        {t('stat.balance_hint')}
                    </p>
                </StatCard>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <ChartCard title={t('chart.guests')}>
                    <GuestChart guests={guests} />
                </ChartCard>
                <ChartCard title={t('chart.finance')}>
                    <FinanceChart summary={summary} />
                </ChartCard>
                <ChartCard title={t('chart.expenses')}>
                    <ExpenseChart categories={expenses.by_category} />
                </ChartCard>
            </div>
        </EventShell>
    );
}
