import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardCheck,
    Gift,
    LayoutGrid,
    MapPin,
    Paintbrush,
    Pencil,
    Plus,
    Sparkles,
    ReceiptText,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import ExpenseController from '@/actions/App/Http/Controllers/ExpenseController';
import GiftController from '@/actions/App/Http/Controllers/GiftController';
import GuestController from '@/actions/App/Http/Controllers/GuestController';
import InvitationController from '@/actions/App/Http/Controllers/InvitationController';
import TaskController from '@/actions/App/Http/Controllers/TaskController';
import { EventFormDialog } from '@/components/event/event-form-dialog';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { packageName } from '@/lib/billing';
import { daysUntil, formatDate } from '@/lib/format';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { pricing } from '@/routes';
import type { PlannerEvent } from '@/types';

type Props = {
    event: PlannerEvent;
    title: string;
    actions?: ReactNode;
    children: ReactNode;
};

export function EventShell({ event, title, actions, children }: Props) {
    const { t, locale } = useTranslation();
    const { isCurrentUrl } = useCurrentUrl();

    const tabs: { key: TranslationKey; href: string; icon: typeof Users }[] = [
        {
            key: 'tab.dashboard',
            href: EventController.show.url(event.id),
            icon: LayoutGrid,
        },
        {
            key: 'tab.guests',
            href: GuestController.index.url(event.id),
            icon: Users,
        },
        {
            key: 'tab.expenses',
            href: ExpenseController.index.url(event.id),
            icon: ReceiptText,
        },
        {
            key: 'tab.gifts',
            href: GiftController.index.url(event.id),
            icon: Gift,
        },
        {
            key: 'tab.tasks',
            href: TaskController.index.url(event.id),
            icon: ClipboardCheck,
        },
        {
            key: 'tab.design',
            href: InvitationController.index.url(event.id),
            icon: Paintbrush,
        },
        {
            key: 'tab.add_template',
            href: InvitationController.catalog.url(event.id),
            icon: Plus,
        },
    ];

    const days = daysUntil(event.event_date);

    return (
        <>
            <Head title={`${title} · ${event.name}`} />

            <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
                <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
                    <div className="hidden rounded-3xl border bg-card p-4 shadow-sm lg:block">
                        <p className="font-serif text-xl leading-snug font-semibold">
                            {event.name}
                        </p>
                        {event.event_date && (
                            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                                <CalendarDays className="size-4 shrink-0" />
                                {formatDate(event.event_date, locale)}
                            </p>
                        )}
                        {event.venue && (
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MapPin className="size-4 shrink-0" />
                                {event.venue}
                            </p>
                        )}
                        {days !== null && (
                            <p className="mt-3 inline-block rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-accent-foreground">
                                {days > 0
                                    ? t('event.days_left', { count: days })
                                    : days === 0
                                      ? t('event.today')
                                      : t('event.passed')}
                            </p>
                        )}
                        <div className="my-4 h-px bg-border" />
                        <nav className="flex flex-col gap-1">
                            {tabs.map((tab) => (
                                <NavLink
                                    key={tab.key}
                                    href={tab.href}
                                    active={isCurrentUrl(tab.href)}
                                    icon={tab.icon}
                                    label={t(tab.key)}
                                />
                            ))}
                        </nav>
                        <PlanCard event={event} />
                    </div>

                    <nav className="-mx-3 overflow-x-auto px-3 pb-1 lg:hidden">
                        <div className="flex w-max gap-2">
                            {tabs.map((tab) => {
                                const active = isCurrentUrl(tab.href);

                                return (
                                    <Link
                                        key={tab.key}
                                        href={tab.href}
                                        prefetch
                                        preserveScroll
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-full border bg-card px-4 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors',
                                            active &&
                                                'border-primary bg-primary font-medium text-primary-foreground',
                                        )}
                                    >
                                        <tab.icon className="size-4" />
                                        {t(tab.key)}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </aside>

                <div className="min-w-0 rounded-3xl border bg-card p-4 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="font-serif text-3xl font-semibold">
                                {title}
                            </h1>
                            <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground lg:hidden">
                                {event.name}
                                <PlanChip event={event} />
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {actions}
                            <EventFormDialog
                                event={event}
                                trigger={
                                    <Button
                                        variant="outline"
                                        className="rounded-full"
                                    >
                                        <Pencil className="size-4" />
                                        {t('event.edit')}
                                    </Button>
                                }
                            />
                        </div>
                    </div>

                    <div className="mt-6">{children}</div>
                </div>
            </div>
        </>
    );
}

function NavLink({
    href,
    active,
    icon: Icon,
    label,
}: {
    href: string;
    active: boolean;
    icon: typeof Users;
    label: string;
}) {
    return (
        <Link
            href={href}
            prefetch
            preserveScroll
            className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                active &&
                    'bg-primary font-medium text-primary-foreground hover:bg-primary hover:text-primary-foreground',
            )}
        >
            <Icon className="size-[18px]" />
            {label}
        </Link>
    );
}

function PlanCard({ event }: { event: PlannerEvent }) {
    const { t, locale } = useTranslation();

    return (
        <div className="mt-4 rounded-2xl bg-accent/70 p-3">
            <p className="text-xs text-muted-foreground">{t('plan.label')}</p>
            <p className="font-semibold">
                {event.package
                    ? packageName(event.package, locale)
                    : t('plan.free')}
            </p>
            {!event.package && (
                <Button asChild size="sm" className="mt-2 w-full rounded-full">
                    <Link href={pricing({ query: { event: event.id } })}>
                        <Sparkles className="size-4" />
                        {t('plan.upgrade')}
                    </Link>
                </Button>
            )}
        </div>
    );
}

function PlanChip({ event }: { event: PlannerEvent }) {
    const { t, locale } = useTranslation();

    if (event.package) {
        return (
            <span className="rounded-full bg-accent px-2 text-xs text-accent-foreground">
                {packageName(event.package, locale)}
            </span>
        );
    }

    return (
        <Link
            href={pricing({ query: { event: event.id } })}
            className="flex items-center gap-1 rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground"
        >
            <Sparkles className="size-3" />
            {t('plan.upgrade')}
        </Link>
    );
}
