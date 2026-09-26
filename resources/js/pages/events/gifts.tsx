import { Pencil, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import GiftController from '@/actions/App/Http/Controllers/GiftController';
import { ConfirmDelete } from '@/components/event/confirm-delete';
import { EventShell } from '@/components/event/event-shell';
import { SelectField, TextField } from '@/components/event/fields';
import { FormDialog } from '@/components/event/form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatKhr, formatUsd } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import type { Gift, PlannerEvent } from '@/types';
import { GIFT_METHODS } from '@/types/event';

type GuestOption = { id: number; name: string };

function GiftFields({
    gift,
    guests,
    errors,
}: {
    gift?: Gift;
    guests: GuestOption[];
    errors: Record<string, string>;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <TextField
                label={t('gift.giver')}
                name="giver_name"
                required
                list="gift-guest-names"
                defaultValue={gift?.giver_name}
                error={errors.giver_name}
            />
            <datalist id="gift-guest-names">
                {guests.map((guest) => (
                    <option key={guest.id} value={guest.name} />
                ))}
            </datalist>
            <SelectField
                label={t('gift.guest')}
                name="guest_id"
                defaultValue={gift?.guest_id ?? ''}
                error={errors.guest_id}
                options={[
                    { value: '', label: t('gift.none') },
                    ...guests.map((guest) => ({
                        value: guest.id,
                        label: guest.name,
                    })),
                ]}
            />
            <TextField
                label={t('gift.usd')}
                name="amount_usd"
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                defaultValue={gift?.amount_usd || ''}
                error={errors.amount_usd}
            />
            <TextField
                label={t('gift.khr')}
                name="amount_khr"
                type="number"
                min={0}
                step="100"
                placeholder="0"
                defaultValue={gift?.amount_khr || ''}
                error={errors.amount_khr}
            />
            <SelectField
                label={t('gift.method')}
                name="method"
                defaultValue={gift?.method ?? 'cash'}
                error={errors.method}
                options={GIFT_METHODS.map((method) => ({
                    value: method,
                    label: t(`method.${method}`),
                }))}
            />
            <TextField
                label={t('common.note')}
                name="note"
                defaultValue={gift?.note ?? ''}
                error={errors.note}
            />
        </div>
    );
}

export default function Gifts({
    event,
    gifts,
    guests,
}: {
    event: PlannerEvent;
    gifts: Gift[];
    guests: GuestOption[];
}) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return term === ''
            ? gifts
            : gifts.filter((gift) =>
                  gift.giver_name.toLowerCase().includes(term),
              );
    }, [gifts, search]);

    const totalUsd = gifts.reduce((sum, gift) => sum + gift.amount_usd, 0);
    const totalKhr = gifts.reduce((sum, gift) => sum + gift.amount_khr, 0);
    const converted = totalUsd + totalKhr / event.exchange_rate;

    return (
        <EventShell
            event={event}
            title={t('tab.gifts')}
            actions={
                <FormDialog
                    title={t('gift.add')}
                    form={GiftController.store.form(event.id)}
                    resetOnSuccess
                    trigger={
                        <Button variant="outline" className="rounded-full">
                            <Plus className="size-4" />
                            {t('gift.add')}
                        </Button>
                    }
                >
                    {(errors) => <GiftFields guests={guests} errors={errors} />}
                </FormDialog>
            }
        >
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border bg-emerald-50 p-4 dark:bg-emerald-950/30">
                    <p className="text-sm text-muted-foreground">
                        {t('gift.total_usd')}
                    </p>
                    <p className="text-2xl font-bold">{formatUsd(totalUsd)}</p>
                </div>
                <div className="rounded-2xl border bg-amber-50 p-4 dark:bg-amber-950/30">
                    <p className="text-sm text-muted-foreground">
                        {t('gift.total_khr')}
                    </p>
                    <p className="text-2xl font-bold">{formatKhr(totalKhr)}</p>
                </div>
                <div className="rounded-2xl border bg-violet-50 p-4 dark:bg-violet-950/30">
                    <p className="text-sm text-muted-foreground">
                        {t('gift.total_all')}
                    </p>
                    <p className="text-2xl font-bold">{formatUsd(converted)}</p>
                    <p className="text-xs text-muted-foreground">
                        1 USD = {event.exchange_rate} KHR
                    </p>
                </div>
            </div>

            <div className="relative mt-4 w-full sm:w-64">
                <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('common.search')}
                    className="pl-9"
                />
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-left text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">
                                {t('gift.giver')}
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                USD
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                KHR
                            </th>
                            <th className="px-4 py-3 font-medium">
                                {t('gift.method')}
                            </th>
                            <th className="px-4 py-3 font-medium">
                                {t('common.note')}
                            </th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filtered.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-10 text-center text-muted-foreground"
                                >
                                    {t('common.no_records')}
                                </td>
                            </tr>
                        )}
                        {filtered.map((gift) => (
                            <tr key={gift.id} className="hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">
                                    {gift.giver_name}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums">
                                    {gift.amount_usd
                                        ? formatUsd(gift.amount_usd)
                                        : '—'}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums">
                                    {gift.amount_khr
                                        ? formatKhr(gift.amount_khr)
                                        : '—'}
                                </td>
                                <td className="px-4 py-3">
                                    {t(`method.${gift.method}`)}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {gift.note ?? ''}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        <FormDialog
                                            title={t('gift.edit')}
                                            form={GiftController.update.form({
                                                event: event.id,
                                                gift: gift.id,
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
                                                <GiftFields
                                                    gift={gift}
                                                    guests={guests}
                                                    errors={errors}
                                                />
                                            )}
                                        </FormDialog>
                                        <ConfirmDelete
                                            url={GiftController.destroy.url({
                                                event: event.id,
                                                gift: gift.id,
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
