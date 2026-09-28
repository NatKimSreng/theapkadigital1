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
import { daysUntil, formatDate } from '@/lib/format';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
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

            <div className="rounded-3xl bg-card p-3 shadow-sm sm:p-5">
                <nav className="-mx-1 overflow-x-auto px-1 pb-1">
                    <div className="inline-flex gap-1 rounded-2xl bg-muted p-1.5">
                        {tabs.map((tab) => {
                            const active = isCurrentUrl(tab.href);

                            return (
                                <Link
                                    key={tab.key}
                                    href={tab.href}
                                    prefetch
                                    preserveScroll
                                    className={cn(
                                        'flex min-w-24 flex-col items-center gap-1 rounded-xl px-4 py-2.5 text-xs whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground sm:min-w-28 sm:text-sm',
                                        active &&
                                            'bg-background font-medium text-primary shadow-sm hover:text-primary',
                                    )}
                                >
                                    <tab.icon className="size-5" />
                                    {t(tab.key)}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold">{title}</h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {event.name}
                            </span>
                            {event.event_date && (
                                <span className="flex items-center gap-1">
                                    <CalendarDays className="size-4" />
                                    {formatDate(event.event_date, locale)}
                                    {days !== null && (
                                        <span className="ml-1 rounded-full bg-rose-100 px-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                            {days > 0
                                                ? t('event.days_left', {
                                                      count: days,
                                                  })
                                                : days === 0
                                                  ? t('event.today')
                                                  : t('event.passed')}
                                        </span>
                                    )}
                                </span>
                            )}
                            {event.venue && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="size-4" />
                                    {event.venue}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {actions}
                        <EventFormDialog
                            event={event}
                            trigger={
                                <Button className="rounded-full">
                                    <Pencil className="size-4" />
                                    {t('event.edit')}
                                </Button>
                            }
                        />
                    </div>
                </div>

                <div className="mt-5">{children}</div>
            </div>
        </>
    );
}
