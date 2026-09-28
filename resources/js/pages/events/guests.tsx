import { router } from '@inertiajs/react';
import { Pencil, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import GuestController from '@/actions/App/Http/Controllers/GuestController';
import { ConfirmDelete } from '@/components/event/confirm-delete';
import { EventShell } from '@/components/event/event-shell';
import { GuestInviteActions } from '@/components/event/guest-invite';
import {
    SelectField,
    TextField,
    selectClassName,
} from '@/components/event/fields';
import { FormDialog } from '@/components/event/form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatUsd } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Guest, GuestStatus, PlannerEvent } from '@/types';
import { GUEST_SIDES, GUEST_STATUSES } from '@/types/event';

const statusStyles: Record<GuestStatus, string> = {
    confirmed:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    pending:
        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    declined: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
};

function GuestFields({
    guest,
    errors,
}: {
    guest?: Guest;
    errors: Record<string, string>;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <TextField
                label={t('guest.name')}
                name="name"
                required
                defaultValue={guest?.name}
                error={errors.name}
                wrapperClassName="sm:col-span-2"
            />
            <TextField
                label={t('guest.phone')}
                name="phone"
                type="tel"
                defaultValue={guest?.phone ?? ''}
                error={errors.phone}
            />
            <TextField
                label={t('guest.group')}
                name="group"
                defaultValue={guest?.group ?? ''}
                error={errors.group}
            />
            <SelectField
                label={t('guest.side')}
                name="side"
                defaultValue={guest?.side ?? 'both'}
                error={errors.side}
                options={GUEST_SIDES.map((side) => ({
                    value: side,
                    label: t(`side.${side}`),
                }))}
            />
            <SelectField
                label={t('guest.status')}
                name="status"
                defaultValue={guest?.status ?? 'pending'}
                error={errors.status}
                options={GUEST_STATUSES.map((status) => ({
                    value: status,
                    label: t(`status.${status}`),
                }))}
            />
            <TextField
                label={t('guest.party')}
                name="party_size"
                type="number"
                min={1}
                required
                defaultValue={guest?.party_size ?? 1}
                error={errors.party_size}
            />
            <TextField
                label={t('common.note')}
                name="note"
                defaultValue={guest?.note ?? ''}
                error={errors.note}
            />
        </div>
    );
}

export default function Guests({
    event,
    guests,
    inviteReady,
}: {
    event: PlannerEvent;
    guests: Guest[];
    inviteReady: boolean;
}) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<GuestStatus | 'all'>('all');

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return guests.filter(
            (guest) =>
                (status === 'all' || guest.status === status) &&
                (term === '' ||
                    guest.name.toLowerCase().includes(term) ||
                    (guest.phone ?? '').includes(term) ||
                    (guest.group ?? '').toLowerCase().includes(term)),
        );
    }, [guests, search, status]);

    const counts = GUEST_STATUSES.map((key) => ({
        key,
        count: guests.filter((guest) => guest.status === key).length,
    }));

    const updateStatus = (guest: Guest, value: GuestStatus) => {
        router.patch(
            GuestController.update.url({ event: event.id, guest: guest.id }),
            { status: value },
            { preserveScroll: true },
        );
    };

    return (
        <EventShell
            event={event}
            title={t('tab.guests')}
            actions={
                <FormDialog
                    title={t('guest.add')}
                    form={GuestController.store.form(event.id)}
                    resetOnSuccess
                    trigger={
                        <Button variant="outline" className="rounded-full">
                            <Plus className="size-4" />
                            {t('guest.add')}
                        </Button>
                    }
                >
                    {(errors) => <GuestFields errors={errors} />}
                </FormDialog>
            }
        >
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => setStatus('all')}
                    className={cn(
                        'rounded-full border px-3 py-1 text-sm',
                        status === 'all' &&
                            'border-primary bg-primary/10 text-primary',
                    )}
                >
                    {t('common.all')} ({guests.length})
                </button>
                {counts.map(({ key, count }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setStatus(key)}
                        className={cn(
                            'rounded-full border px-3 py-1 text-sm',
                            status === key &&
                                'border-primary bg-primary/10 text-primary',
                        )}
                    >
                        {t(`status.${key}`)} ({count})
                    </button>
                ))}
                <div className="relative ml-auto w-full sm:w-64">
                    <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('common.search')}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-left text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">
                                {t('guest.name')}
                            </th>
                            <th className="px-4 py-3 font-medium">
                                {t('guest.side')}
                            </th>
                            <th className="px-4 py-3 font-medium">
                                {t('guest.group')}
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                {t('guest.party')}
                            </th>
                            <th className="px-4 py-3 font-medium">
                                {t('guest.status')}
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                {t('guest.gift')}
                            </th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filtered.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-10 text-center text-muted-foreground"
                                >
                                    {t('common.no_records')}
                                </td>
                            </tr>
                        )}
                        {filtered.map((guest) => (
                            <tr key={guest.id} className="hover:bg-muted/30">
                                <td className="px-4 py-3">
                                    <p className="font-medium">{guest.name}</p>
                                    {guest.phone && (
                                        <p className="text-xs text-muted-foreground">
                                            {guest.phone}
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {t(`side.${guest.side}`)}
                                </td>
                                <td className="px-4 py-3">
                                    {guest.group ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums">
                                    {guest.party_size}
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        aria-label={t('guest.status')}
                                        value={guest.status}
                                        onChange={(e) =>
                                            updateStatus(
                                                guest,
                                                e.target.value as GuestStatus,
                                            )
                                        }
                                        className={cn(
                                            selectClassName,
                                            'h-8 w-auto rounded-full border-0 text-xs font-medium',
                                            statusStyles[guest.status],
                                        )}
                                    >
                                        {GUEST_STATUSES.map((key) => (
                                            <option key={key} value={key}>
                                                {t(`status.${key}`)}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums">
                                    {guest.gifts_sum_amount_usd
                                        ? formatUsd(
                                              Number(
                                                  guest.gifts_sum_amount_usd,
                                              ),
                                          )
                                        : '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <GuestInviteActions
                                            event={event}
                                            guest={guest}
                                            ready={inviteReady}
                                        />
                                        <FormDialog
                                            title={t('guest.edit')}
                                            form={GuestController.update.form({
                                                event: event.id,
                                                guest: guest.id,
                                            })}
                                            trigger={
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-muted-foreground"
                                                    aria-label={t(
                                                        'common.edit',
                                                    )}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                            }
                                        >
                                            {(errors) => (
                                                <GuestFields
                                                    guest={guest}
                                                    errors={errors}
                                                />
                                            )}
                                        </FormDialog>
                                        <ConfirmDelete
                                            url={GuestController.destroy.url({
                                                event: event.id,
                                                guest: guest.id,
                                            })}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </EventShell>
    );
}
