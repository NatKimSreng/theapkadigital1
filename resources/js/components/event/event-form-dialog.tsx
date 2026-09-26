import type { ReactNode } from 'react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import { ConfirmDelete } from '@/components/event/confirm-delete';
import { Field, SelectField, TextField } from '@/components/event/fields';
import { FormDialog } from '@/components/event/form-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import type { PlannerEvent } from '@/types';
import { EVENT_TYPES } from '@/types/event';

type Props = {
    trigger: ReactNode;
    event?: PlannerEvent;
};

export function EventFormDialog({ trigger, event }: Props) {
    const { t } = useTranslation();

    return (
        <FormDialog
            title={event ? t('event.edit') : t('events.new')}
            trigger={trigger}
            form={
                event
                    ? EventController.update.form(event.id)
                    : EventController.store.form()
            }
            resetOnSuccess={!event}
            footer={
                event && (
                    <ConfirmDelete
                        url={EventController.destroy.url(event.id)}
                        trigger={
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-destructive"
                            >
                                {t('event.delete')}
                            </Button>
                        }
                    />
                )
            }
        >
            {(errors) => (
                <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                        label={t('event.name')}
                        name="name"
                        required
                        defaultValue={event?.name}
                        error={errors.name}
                        wrapperClassName="sm:col-span-2"
                    />
                    <SelectField
                        label={t('event.type')}
                        name="type"
                        defaultValue={event?.type ?? 'wedding'}
                        error={errors.type}
                        options={EVENT_TYPES.map((type) => ({
                            value: type,
                            label: t(`type.${type}`),
                        }))}
                    />
                    <TextField
                        label={t('event.date')}
                        name="event_date"
                        type="date"
                        defaultValue={event?.event_date ?? ''}
                        error={errors.event_date}
                    />
                    <TextField
                        label={t('event.groom')}
                        name="groom_name"
                        defaultValue={event?.groom_name ?? ''}
                        error={errors.groom_name}
                    />
                    <TextField
                        label={t('event.bride')}
                        name="bride_name"
                        defaultValue={event?.bride_name ?? ''}
                        error={errors.bride_name}
                    />
                    <TextField
                        label={t('event.venue')}
                        name="venue"
                        defaultValue={event?.venue ?? ''}
                        error={errors.venue}
                        wrapperClassName="sm:col-span-2"
                    />
                    <TextField
                        label={t('event.rate')}
                        name="exchange_rate"
                        type="number"
                        min={1}
                        required
                        defaultValue={event?.exchange_rate ?? 4000}
                        error={errors.exchange_rate}
                    />
                    <TextField
                        label={t('event.budget')}
                        name="budget"
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={event?.budget ?? ''}
                        error={errors.budget}
                    />
                    <Field
                        label={t('event.description')}
                        htmlFor="description"
                        error={errors.description}
                        className="sm:col-span-2"
                    >
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            defaultValue={event?.description ?? ''}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
                        />
                    </Field>
                </div>
            )}
        </FormDialog>
    );
}
