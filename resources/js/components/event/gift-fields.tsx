import { SelectField, TextField } from '@/components/event/fields';
import { useTranslation } from '@/lib/i18n';
import type { Gift } from '@/types';
import { GIFT_METHODS } from '@/types/event';

export type GuestOption = { id: number; name: string };

/**
 * Gift form fields. With `forGuest` the gift is tied to that guest and the
 * giver fields are hidden.
 */
export function GiftFields({
    gift,
    guests = [],
    forGuest,
    errors,
}: {
    gift?: Gift;
    guests?: GuestOption[];
    forGuest?: GuestOption;
    errors: Record<string, string>;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {forGuest ? (
                <>
                    <input type="hidden" name="guest_id" value={forGuest.id} />
                    <input
                        type="hidden"
                        name="giver_name"
                        value={gift?.giver_name ?? forGuest.name}
                    />
                    <p className="rounded-xl bg-muted px-3 py-2 text-sm sm:col-span-2">
                        {t('gift.giver')}:{' '}
                        <span className="font-semibold">{forGuest.name}</span>
                    </p>
                </>
            ) : (
                <>
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
                </>
            )}
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
