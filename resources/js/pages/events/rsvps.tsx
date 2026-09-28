import { Check, Heart, MessageCircleHeart, Trash2, X } from 'lucide-react';
import RsvpController from '@/actions/App/Http/Controllers/RsvpController';
import { ConfirmDelete } from '@/components/event/confirm-delete';
import { EventShell } from '@/components/event/event-shell';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/billing';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { PlannerEvent } from '@/types';

type Rsvp = {
    id: number;
    guest_id: number | null;
    name: string;
    attending: boolean;
    message: string | null;
    updated_at: string;
};

export default function Rsvps({
    event,
    rsvps,
    counts,
}: {
    event: PlannerEvent;
    rsvps: Rsvp[];
    counts: { attending: number; declined: number; wishes: number };
}) {
    const { t, locale } = useTranslation();

    const stats = [
        {
            label: t('rsvp.attending'),
            value: counts.attending,
            icon: Check,
            tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        },
        {
            label: t('rsvp.declined'),
            value: counts.declined,
            icon: X,
            tone: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
        },
        {
            label: t('rsvp.wishes'),
            value: counts.wishes,
            icon: Heart,
            tone: 'bg-accent text-primary',
        },
    ];

    return (
        <EventShell event={event} title={t('tab.rsvps')}>
            <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="flex items-center gap-3 rounded-2xl border bg-background p-4"
                    >
                        <span
                            className={cn(
                                'flex size-10 items-center justify-center rounded-xl',
                                stat.tone,
                            )}
                        >
                            <stat.icon className="size-5" />
                        </span>
                        <div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">
                                {stat.label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
                {t('rsvp.hint')}
            </p>

            {rsvps.length === 0 ? (
                <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
                    <MessageCircleHeart className="size-8 text-primary" />
                    {t('rsvp.empty')}
                </div>
            ) : (
                <ul className="mt-4 space-y-3">
                    {rsvps.map((rsvp) => (
                        <li
                            key={rsvp.id}
                            className="rounded-2xl border bg-background p-4"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold">{rsvp.name}</p>
                                <span
                                    className={cn(
                                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                        rsvp.attending
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
                                    )}
                                >
                                    {rsvp.attending
                                        ? t('rsvp.attending')
                                        : t('rsvp.declined')}
                                </span>
                                {rsvp.guest_id === null && (
                                    <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">
                                        {t('rsvp.public_link')}
                                    </span>
                                )}
                                <span className="ml-auto text-xs text-muted-foreground">
                                    {formatDateTime(rsvp.updated_at, locale)}
                                </span>
                                <ConfirmDelete
                                    url={RsvpController.destroy.url({
                                        event: event.id,
                                        rsvp: rsvp.id,
                                    })}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-muted-foreground"
                                            aria-label={t('event.delete')}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    }
                                />
                            </div>
                            {rsvp.message && (
                                <p className="mt-2 rounded-xl bg-accent/50 px-3 py-2 text-sm leading-relaxed whitespace-pre-line">
                                    {rsvp.message}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </EventShell>
    );
}
