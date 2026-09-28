import { router } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import ExpenseController from '@/actions/App/Http/Controllers/ExpenseController';
import { ConfirmDelete } from '@/components/event/confirm-delete';
import { EventShell } from '@/components/event/event-shell';
import { SelectField, TextField } from '@/components/event/fields';
import { FormDialog } from '@/components/event/form-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatUsd } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Expense, PlannerEvent } from '@/types';
import { EXPENSE_CATEGORIES } from '@/types/event';

function ExpenseFields({
    expense,
    errors,
}: {
    expense?: Expense;
    errors: Record<string, string>;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <TextField
                label={t('expense.title')}
                name="title"
                required
                defaultValue={expense?.title}
                error={errors.title}
                wrapperClassName="sm:col-span-2"
            />
            <SelectField
                label={t('expense.category')}
                name="category"
                defaultValue={expense?.category ?? 'other'}
                error={errors.category}
                options={EXPENSE_CATEGORIES.map((category) => ({
                    value: category,
                    label: t(`category.${category}`),
                }))}
            />
            <TextField
                label={t('expense.vendor')}
                name="vendor"
                defaultValue={expense?.vendor ?? ''}
                error={errors.vendor}
            />
            <TextField
                label={`${t('expense.estimated')} (USD)`}
                name="estimated_amount"
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                defaultValue={expense?.estimated_amount || ''}
                error={errors.estimated_amount}
            />
            <TextField
                label={`${t('expense.actual')} (USD)`}
                name="actual_amount"
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                defaultValue={expense?.actual_amount || ''}
                error={errors.actual_amount}
            />
            <TextField
                label={t('common.note')}
                name="note"
                defaultValue={expense?.note ?? ''}
                error={errors.note}
            />
            <div className="flex items-end gap-2 pb-2">
                <input type="hidden" name="paid" value="0" />
                <Checkbox
                    id="paid"
                    name="paid"
                    value="1"
                    defaultChecked={expense?.paid}
                />
                <Label htmlFor="paid">{t('expense.paid')}</Label>
            </div>
        </div>
    );
}

export default function Expenses({
    event,
    expenses,
}: {
    event: PlannerEvent;
    expenses: Expense[];
}) {
    const { t } = useTranslation();

    const estimated = expenses.reduce(
        (sum, expense) => sum + expense.estimated_amount,
        0,
    );
    const actual = expenses.reduce(
        (sum, expense) => sum + expense.actual_amount,
        0,
    );
    const remaining = event.budget - actual;

    const togglePaid = (expense: Expense) => {
        router.patch(
            ExpenseController.update.url({
                event: event.id,
                expense: expense.id,
            }),
            { paid: !expense.paid },
            { preserveScroll: true },
        );
    };

    return (
        <EventShell
            event={event}
            title={t('tab.expenses')}
            actions={
                <FormDialog
                    title={t('expense.add')}
                    form={ExpenseController.store.form(event.id)}
                    resetOnSuccess
                    trigger={
                        <Button variant="outline" className="rounded-full">
                            <Plus className="size-4" />
                            {t('expense.add')}
                        </Button>
                    }
                >
                    {(errors) => <ExpenseFields errors={errors} />}
                </FormDialog>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border p-4">
                    <p className="text-sm text-muted-foreground">
                        {t('expense.budget')}
                    </p>
                    <p className="text-2xl font-bold">
                        {formatUsd(event.budget)}
                    </p>
                </div>
                <div className="rounded-2xl border p-4">
                    <p className="text-sm text-muted-foreground">
                        {t('expense.estimated')}
                    </p>
                    <p className="text-2xl font-bold">{formatUsd(estimated)}</p>
                </div>
                <div className="rounded-2xl border bg-accent/60 p-4">
                    <p className="text-sm text-muted-foreground">
                        {t('expense.actual')}
                    </p>
                    <p className="text-2xl font-bold">{formatUsd(actual)}</p>
                </div>
                <div className="rounded-2xl border p-4">
                    <p className="text-sm text-muted-foreground">
                        {t('expense.remaining')}
                    </p>
                    <p
                        className={cn(
                            'text-2xl font-bold',
                            remaining < 0 && 'text-destructive',
                        )}
                    >
                        {formatUsd(remaining)}
                    </p>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-left text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">
                                {t('expense.title')}
                            </th>
                            <th className="px-4 py-3 font-medium">
                                {t('expense.category')}
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                {t('expense.estimated')}
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                {t('expense.actual')}
                            </th>
                            <th className="px-4 py-3 font-medium">
                                {t('expense.paid')}
                            </th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {expenses.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-10 text-center text-muted-foreground"
                                >
                                    {t('common.no_records')}
                                </td>
                            </tr>
                        )}
                        {expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-muted/30">
                                <td className="px-4 py-3">
                                    <p className="font-medium">
                                        {expense.title}
                                    </p>
                                    {expense.vendor && (
                                        <p className="text-xs text-muted-foreground">
                                            {expense.vendor}
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {t(`category.${expense.category}`)}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums">
                                    {formatUsd(expense.estimated_amount)}
                                </td>
                                <td
                                    className={cn(
                                        'px-4 py-3 text-right tabular-nums',
                                        expense.estimated_amount > 0 &&
                                            expense.actual_amount >
                                                expense.estimated_amount &&
                                            'font-medium text-destructive',
                                    )}
                                >
                                    {formatUsd(expense.actual_amount)}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={() => togglePaid(expense)}
                                        className={cn(
                                            'rounded-full px-2.5 py-1 text-xs font-medium',
                                            expense.paid
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                : 'bg-muted text-muted-foreground',
                                        )}
                                    >
                                        {expense.paid
                                            ? t('expense.paid')
                                            : t('expense.unpaid')}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        <FormDialog
                                            title={t('expense.edit')}
                                            form={ExpenseController.update.form(
                                                {
                                                    event: event.id,
                                                    expense: expense.id,
                                                },
                                            )}
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
                                                <ExpenseFields
                                                    expense={expense}
                                                    errors={errors}
                                                />
                                            )}
                                        </FormDialog>
                                        <ConfirmDelete
                                            url={ExpenseController.destroy.url({
                                                event: event.id,
                                                expense: expense.id,
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
