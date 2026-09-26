import { Form, router } from '@inertiajs/react';
import { CalendarDays, Plus } from 'lucide-react';
import TaskController from '@/actions/App/Http/Controllers/TaskController';
import InputError from '@/components/input-error';
import { ConfirmDelete } from '@/components/event/confirm-delete';
import { EventShell } from '@/components/event/event-shell';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { daysUntil, formatDate } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { PlannerEvent, Task } from '@/types';

export default function Tasks({
    event,
    tasks,
}: {
    event: PlannerEvent;
    tasks: Task[];
}) {
    const { t, locale } = useTranslation();

    const done = tasks.filter((task) => task.done).length;
    const percent =
        tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

    const toggle = (task: Task) => {
        router.patch(
            TaskController.update.url({ event: event.id, task: task.id }),
            { done: !task.done },
            { preserveScroll: true },
        );
    };

    return (
        <EventShell event={event} title={t('tab.tasks')}>
            <div className="rounded-2xl border p-4">
                <div className="flex items-center justify-between text-sm">
                    <span>
                        {t('task.progress', { done, total: tasks.length })}
                    </span>
                    <span className="font-semibold">{percent}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>

            <Form
                {...TaskController.store.form(event.id)}
                options={{ preserveScroll: true }}
                resetOnSuccess
                className="mt-4 flex flex-col gap-2 sm:flex-row"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex-1">
                            <Input
                                name="title"
                                required
                                placeholder={t('task.placeholder')}
                                aria-label={t('task.title')}
                            />
                            <InputError message={errors.title} />
                        </div>
                        <Input
                            name="due_date"
                            type="date"
                            aria-label={t('task.due')}
                            className="sm:w-44"
                        />
                        <Button type="submit" disabled={processing}>
                            <Plus className="size-4" />
                            {t('task.add')}
                        </Button>
                    </>
                )}
            </Form>

            <ul className="mt-4 divide-y rounded-2xl border">
                {tasks.length === 0 && (
                    <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                        {t('common.no_records')}
                    </li>
                )}
                {tasks.map((task) => {
                    const days = daysUntil(task.due_date);
                    const overdue = !task.done && days !== null && days < 0;

                    return (
                        <li
                            key={task.id}
                            className="flex items-center gap-3 px-4 py-3"
                        >
                            <Checkbox
                                checked={task.done}
                                onCheckedChange={() => toggle(task)}
                                aria-label={task.title}
                            />
                            <div className="min-w-0 flex-1">
                                <p
                                    className={cn(
                                        'truncate',
                                        task.done &&
                                            'text-muted-foreground line-through',
                                    )}
                                >
                                    {task.title}
                                </p>
                                {task.due_date && (
                                    <p
                                        className={cn(
                                            'flex items-center gap-1 text-xs text-muted-foreground',
                                            overdue && 'text-destructive',
                                        )}
                                    >
                                        <CalendarDays className="size-3.5" />
                                        {formatDate(task.due_date, locale)}
                                    </p>
                                )}
                            </div>
                            <ConfirmDelete
                                url={TaskController.destroy.url({
                                    event: event.id,
                                    task: task.id,
                                })}
                            />
                        </li>
                    );
                })}
            </ul>
        </EventShell>
    );
}
