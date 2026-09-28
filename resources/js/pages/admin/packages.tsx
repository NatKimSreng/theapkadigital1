import { Head } from '@inertiajs/react';
import { Check, Minus, Pencil, Plus, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import PackageController from '@/actions/App/Http/Controllers/Admin/PackageController';
import { ConfirmDelete } from '@/components/event/confirm-delete';
import { Field, TextField } from '@/components/event/fields';
import { FormDialog } from '@/components/event/form-dialog';
import { Button } from '@/components/ui/button';
import { AdminPage } from '@/layouts/admin-layout';
import { formatNumber, formatUsd } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Package } from '@/types';

const textareaClass =
    'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

function Flag({
    name,
    label,
    defaultChecked,
    disabled,
}: {
    name: string;
    label: string;
    defaultChecked?: boolean;
    disabled?: boolean;
}) {
    return (
        <label className="flex items-center gap-2.5 rounded-xl border bg-background px-3 py-2.5 text-sm">
            <input
                type="checkbox"
                name={name}
                value="1"
                defaultChecked={defaultChecked}
                disabled={disabled}
                className="size-4 accent-[var(--primary)]"
            />
            {label}
        </label>
    );
}

function PackageDialog({
    pkg,
    trigger,
}: {
    pkg?: Package;
    trigger: ReactNode;
}) {
    const { t } = useTranslation();

    return (
        <FormDialog
            title={pkg ? t('admin.edit_package') : t('admin.new_package')}
            trigger={trigger}
            form={
                pkg
                    ? PackageController.update.form(pkg.id)
                    : PackageController.store.form()
            }
            resetOnSuccess={!pkg}
            footer={
                pkg &&
                !pkg.is_default && (
                    <ConfirmDelete
                        url={PackageController.destroy.url(pkg.id)}
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
                        label={t('admin.name_en')}
                        name="name"
                        required
                        defaultValue={pkg?.name}
                        error={errors.name}
                    />
                    <TextField
                        label={t('admin.name_km')}
                        name="name_km"
                        defaultValue={pkg?.name_km ?? ''}
                        error={errors.name_km}
                    />
                    <Field
                        label={t('admin.desc_en')}
                        htmlFor="description"
                        error={errors.description}
                    >
                        <textarea
                            id="description"
                            name="description"
                            rows={2}
                            maxLength={500}
                            defaultValue={pkg?.description ?? ''}
                            className={textareaClass}
                        />
                    </Field>
                    <Field
                        label={t('admin.desc_km')}
                        htmlFor="description_km"
                        error={errors.description_km}
                    >
                        <textarea
                            id="description_km"
                            name="description_km"
                            rows={2}
                            maxLength={500}
                            defaultValue={pkg?.description_km ?? ''}
                            className={textareaClass}
                        />
                    </Field>
                    <TextField
                        label={t('admin.price')}
                        name="price"
                        type="number"
                        min={0}
                        step="0.01"
                        required
                        defaultValue={pkg?.price ?? ''}
                        error={errors.price}
                        disabled={pkg?.is_default}
                    />
                    <TextField
                        label={t('admin.guest_limit')}
                        name="guest_limit"
                        type="number"
                        min={1}
                        defaultValue={pkg?.guest_limit ?? ''}
                        error={errors.guest_limit}
                    />
                    {pkg?.is_default && (
                        <>
                            <input type="hidden" name="price" value="0" />
                            <TextField
                                label={t('admin.event_limit')}
                                name="event_limit"
                                type="number"
                                min={1}
                                defaultValue={pkg.event_limit ?? ''}
                                error={errors.event_limit}
                            />
                        </>
                    )}
                    <TextField
                        label={t('admin.sort')}
                        name="sort_order"
                        type="number"
                        min={0}
                        defaultValue={pkg?.sort_order ?? 0}
                        error={errors.sort_order}
                    />
                    <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
                        <Flag
                            name="premium_templates"
                            label={t('pricing.premium_templates')}
                            defaultChecked={pkg?.premium_templates}
                        />
                        <Flag
                            name="remove_branding"
                            label={t('pricing.remove_branding')}
                            defaultChecked={pkg?.remove_branding}
                        />
                        <Flag
                            name="is_featured"
                            label={t('admin.featured')}
                            defaultChecked={pkg?.is_featured}
                        />
                        <Flag
                            name="is_active"
                            label={t('admin.active')}
                            defaultChecked={pkg?.is_active ?? true}
                            disabled={pkg?.is_default}
                        />
                    </div>
                </div>
            )}
        </FormDialog>
    );
}

function Row({ on, label }: { on: boolean; label: string }) {
    return (
        <li
            className={cn(
                'flex items-center gap-2',
                !on && 'text-muted-foreground',
            )}
        >
            {on ? (
                <Check className="size-4 text-primary" />
            ) : (
                <Minus className="size-4" />
            )}
            {label}
        </li>
    );
}

export default function AdminPackages({ packages }: { packages: Package[] }) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('admin.packages')} />
            <AdminPage
                title={t('admin.packages')}
                actions={
                    <PackageDialog
                        trigger={
                            <Button className="rounded-full">
                                <Plus className="size-4" />
                                {t('admin.new_package')}
                            </Button>
                        }
                    />
                }
            >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {packages.map((pkg) => (
                        <article
                            key={pkg.id}
                            className={cn(
                                'flex flex-col rounded-2xl border bg-background p-5',
                                pkg.is_featured && 'border-primary',
                                !pkg.is_active && 'opacity-60',
                            )}
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-serif text-2xl font-semibold">
                                    {pkg.name}
                                </h2>
                                {pkg.is_default && (
                                    <span className="rounded-full bg-muted px-2 text-xs">
                                        {t('admin.free_plan')}
                                    </span>
                                )}
                                {pkg.is_featured && (
                                    <Sparkles className="size-4 text-primary" />
                                )}
                                {!pkg.is_active && (
                                    <span className="rounded-full bg-muted px-2 text-xs">
                                        {t('admin.hidden')}
                                    </span>
                                )}
                            </div>
                            {pkg.name_km && (
                                <p className="text-sm text-muted-foreground">
                                    {pkg.name_km}
                                </p>
                            )}
                            <p className="mt-3 text-3xl font-bold">
                                {pkg.price > 0
                                    ? formatUsd(pkg.price)
                                    : t('plan.free')}
                            </p>
                            <ul className="mt-4 space-y-1.5 text-sm">
                                <Row
                                    on
                                    label={
                                        pkg.guest_limit
                                            ? t('pricing.guests', {
                                                  count: formatNumber(
                                                      pkg.guest_limit,
                                                  ),
                                              })
                                            : t('pricing.unlimited_guests')
                                    }
                                />
                                <Row
                                    on={pkg.premium_templates}
                                    label={t('pricing.premium_templates')}
                                />
                                <Row
                                    on={pkg.remove_branding}
                                    label={t('pricing.remove_branding')}
                                />
                                {pkg.is_default && pkg.event_limit && (
                                    <Row
                                        on
                                        label={t('pricing.events', {
                                            count: pkg.event_limit,
                                        })}
                                    />
                                )}
                            </ul>
                            <p className="mt-4 text-xs text-muted-foreground">
                                {t('admin.in_use', {
                                    orders: pkg.orders_count ?? 0,
                                    events: pkg.events_count ?? 0,
                                })}
                            </p>
                            <div className="mt-auto pt-4">
                                <PackageDialog
                                    pkg={pkg}
                                    trigger={
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full"
                                        >
                                            <Pencil className="size-4" />
                                            {t('admin.edit_package')}
                                        </Button>
                                    }
                                />
                            </div>
                        </article>
                    ))}
                </div>
            </AdminPage>
        </>
    );
}
