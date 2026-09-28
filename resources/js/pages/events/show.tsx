import { Link } from '@inertiajs/react';
import {
    ClipboardCheck,
    Gift,
    Paintbrush,
    ReceiptText,
    Scale,
    UserPlus,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import ExpenseController from '@/actions/App/Http/Controllers/ExpenseController';
import GiftController from '@/actions/App/Http/Controllers/GiftController';
import GuestController from '@/actions/App/Http/Controllers/GuestController';
import InvitationController from '@/actions/App/Http/Controllers/InvitationController';
import TaskController from '@/actions/App/Http/Controllers/TaskController';
import {
    ChartCard,
    ExpenseChart,
    FinanceChart,
    GuestChart,
} from '@/components/event/dashboard-charts';
import { EventShell } from '@/components/event/event-shell';
import {
    daysUntil,
    formatDate,
    formatKhr,
    formatNumber,
    formatUsd,
} from '@/lib/format';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { EventSummary, PlannerEvent } from '@/types';

function Progress({ value, over }: { value: number; over?: boolean }) {
    return (
        <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div
                className={cn(
                    'h-full rounded-full',
                    over ? 'bg-red-600' : 'bg-primary',
                )}
                style={{ width: `${Math.min(value, 100)}%` }}
            />
        </div>
    );
}

function StatCard({
    icon: Icon,
    iconTone,
    value,
    label,
    children,
}: {
    icon: typeof Users;
    iconTone: string;
    value: string;
    label: string;
    children?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border bg-background p-5">
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl',
                        iconTone,
                    )}
                >
                    <Icon className="size-5" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                    {label}
                </p>
            </div>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {children && (
                <div className="mt-auto space-y-2 text-sm text-muted-foreground">
                    {children}
                </div>
            )}
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
    const { t, locale } = useTranslation();
    const { expenses, gifts, guests, tasks } = summary;

    const limit = expenses.budget > 0 ? expenses.budget : expenses.estimated;
    const spentPercent =
        limit > 0 ? Math.round((expenses.actual / limit) * 100) : 0;
    const confirmedPercent =
        guests.total > 0
            ? Math.round((guests.confirmed / guests.total) * 100)
            : 0;
    const tasksPercent =
        tasks.total > 0 ? Math.round((tasks.done / tasks.total) * 100) : 0;
    const days = daysUntil(event.event_date);
    const couple =
        event.groom_name && event.bride_name
            ? `${event.groom_name} & ${event.bride_name}`
            : event.name;

    const quickActions: {
        label: TranslationKey;
        href: string;
        icon: typeof Users;
    }[] = [
        {
            label: 'quick.guest',
            href: GuestController.index.url(event.id),
            icon: UserPlus,
        },
        {
            label: 'quick.gift',
            href: GiftController.index.url(event.id),
            icon: Gift,
        },
        {
            label: 'quick.expense',
            href: ExpenseController.index.url(event.id),
            icon: ReceiptText,
        },
        {
            label: 'quick.task',
            href: TaskController.index.url(event.id),
            icon: ClipboardCheck,
        },
        {
            label: 'quick.invitation',
            href: InvitationController.index.url(event.id),
            icon: Paintbrush,
        },
    ];

    return (
        <EventShell event={event} title={t('dashboard.title')}>
            <section className="rounded-3xl bg-gradient-to-br from-accent via-accent/50 to-background p-6 ring-1 ring-primary/20 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                            {t(`type.${event.type}` as TranslationKey)}
                        </p>
                        <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
                            {couple}
                        </h2>
                        {event.event_date && (
                            <p className="mt-2 text-muted-foreground">
                                {formatDate(event.event_date, locale)}
                                {event.venue && ` · ${event.venue}`}
                            </p>
                        )}
                    </div>
                    {days !== null && (
                        <div className="rounded-2xl bg-background/80 px-6 py-4 text-center shadow-sm ring-1 ring-primary/20">
                            {days > 0 ? (
                                <>
                                    <p className="font-serif text-5xl leading-none font-semibold text-primary">
                                        {formatNumber(days)}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {t('dashboard.days_to_go')}
                                    </p>
                                </>
                            ) : (
                                <p className="font-serif text-2xl font-semibold text-primary">
                                    {days === 0
                                        ? t('event.today')
                                        : t('event.passed')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="mt-6">
                <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                    {t('dashboard.quick')}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {quickActions.map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            prefetch
                            className="group flex flex-col items-center gap-2 rounded-2xl border bg-background px-3 py-5 text-center text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                        >
                            <span className="flex size-11 items-center justify-center rounded-full bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <action.icon className="size-5" />
                            </span>
                            {t(action.label)}
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={Users}
                    iconTone="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    value={formatNumber(guests.total)}
                    label={t('stat.guests_invited')}
                >
                    <p>
                        {t('dashboard.confirmed_of', {
                            count: formatNumber(guests.confirmed),
                        })}{' '}
                        · {t('stat.people', { count: guests.people })}
                    </p>
                    <Progress value={confirmedPercent} />
                </StatCard>

                <StatCard
                    icon={Gift}
                    iconTone="bg-accent text-primary"
                    value={formatUsd(gifts.total_usd)}
                    label={t('stat.gifts_total')}
                >
                    <p>
                        {formatUsd(gifts.usd)} + {formatKhr(gifts.khr)}
                    </p>
                    <p className="text-xs">
                        {t('stat.rate')}: 1 USD ={' '}
                        {formatNumber(event.exchange_rate)} KHR
                    </p>
                </StatCard>

                <StatCard
                    icon={ReceiptText}
                    iconTone="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                    value={formatUsd(expenses.actual)}
                    label={t('stat.expenses')}
                >
                    <p>
                        {spentPercent}% ·{' '}
                        {expenses.budget > 0
                            ? t('expense.budget')
                            : t('stat.estimated')}{' '}
                        {formatUsd(limit)}
                    </p>
                    <Progress value={spentPercent} over={spentPercent > 100} />
                </StatCard>

                <StatCard
                    icon={Scale}
                    iconTone={
                        summary.balance < 0
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }
                    value={formatUsd(summary.balance)}
                    label={t('stat.balance')}
                >
                    <p>{t('stat.balance_hint')}</p>
                </StatCard>
            </section>

            <section className="mt-4 flex items-center gap-4 rounded-2xl border bg-background p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                    <ClipboardCheck className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap justify-between gap-x-3 text-sm">
                        <span className="font-medium">{t('tab.tasks')}</span>
                        <span className="text-muted-foreground">
                            {t('dashboard.tasks_done', {
                                done: tasks.done,
                                total: tasks.total,
                            })}
                        </span>
                    </div>
                    <Progress value={tasksPercent} />
                </div>
            </section>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
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
