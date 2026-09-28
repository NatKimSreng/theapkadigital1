import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    HeartHandshake,
    MapPin,
    Plus,
    Users,
} from 'lucide-react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import { EventFormDialog } from '@/components/event/event-form-dialog';
import { Button } from '@/components/ui/button';
import { daysUntil, formatDate, formatUsd } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import type { PlannerEvent } from '@/types';

export default function EventsIndex({ events }: { events: PlannerEvent[] }) {
    const { t, locale } = useTranslation();

    const newEventButton = (
        <Button className="rounded-full">
            <Plus className="size-4" />
            {t('events.new')}
        </Button>
    );

    return (
        <>
            <Head title={t('events.title')} />

            <div className="rounded-3xl bg-card p-5 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {t('events.title')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('events.subtitle')}
                        </p>
                    </div>
                    <EventFormDialog trigger={newEventButton} />
                </div>

                {events.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
                            <HeartHandshake className="size-7" />
                        </div>
                        <p className="max-w-sm text-muted-foreground">
                            {t('events.empty')}
                        </p>
                        <EventFormDialog trigger={newEventButton} />
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {events.map((event) => {
                            const days = daysUntil(event.event_date);

                            return (
                                <Link
                                    key={event.id}
                                    href={EventController.show(event.id)}
                                    prefetch
                                    className="group flex flex-col gap-3 rounded-2xl border bg-gradient-to-br from-accent/60 to-card p-5 transition-shadow hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                            {t(`type.${event.type}`)}
                                        </span>
                                        {days !== null && days >= 0 && (
                                            <span className="text-xs text-muted-foreground">
                                                {days === 0
                                                    ? t('event.today')
                                                    : t('event.days_left', {
                                                          count: days,
                                                      })}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-lg font-semibold group-hover:text-primary">
                                        {event.name}
                                    </h2>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <p className="flex items-center gap-2">
                                            <CalendarDays className="size-4" />
                                            {formatDate(
                                                event.event_date,
                                                locale,
                                            )}
                                        </p>
                                        {event.venue && (
                                            <p className="flex items-center gap-2">
                                                <MapPin className="size-4" />
                                                {event.venue}
                                            </p>
                                        )}
                                        <p className="flex items-center gap-2">
                                            <Users className="size-4" />
                                            {t('events.guests_count', {
                                                count: event.guests_count ?? 0,
                                            })}
                                        </p>
                                    </div>
                                    {event.budget > 0 && (
                                        <p className="mt-auto border-t pt-3 text-sm">
                                            {t('expense.budget')}:{' '}
                                            <span className="font-semibold">
                                                {formatUsd(event.budget)}
                                            </span>
                                        </p>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
