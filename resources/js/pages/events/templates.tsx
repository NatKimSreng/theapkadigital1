import { Link, router, usePage } from '@inertiajs/react';
import { Check, Eye, Lock, Phone, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import InvitationController from '@/actions/App/Http/Controllers/InvitationController';
import { EventShell } from '@/components/event/event-shell';
import { TemplatePreviewDialog } from '@/components/invitation/template-preview';
import { TemplateThumbnail } from '@/components/invitation/template-thumbnail';
import type {
    TemplateCategory,
    TemplateDefinition,
} from '@/components/invitation/templates';
import { TEMPLATES } from '@/components/invitation/templates';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { pricing } from '@/routes';
import type { PlannerEvent } from '@/types';

const categoryStyles: Record<TemplateCategory, string> = {
    wedding: 'bg-pink-100 text-pink-800',
    engagement: 'bg-sky-100 text-sky-800',
    birthday: 'bg-indigo-100 text-indigo-800',
    housewarming: 'bg-amber-100 text-amber-800',
    anniversary: 'bg-purple-100 text-purple-800',
};

export default function Templates({
    event,
    added,
    max,
    premiumUnlocked,
}: {
    event: PlannerEvent;
    added: Record<string, number>;
    max: number;
    premiumUnlocked: boolean;
}) {
    const { t } = useTranslation();
    const { telegram } = usePage().props;
    const [previewing, setPreviewing] = useState<TemplateDefinition | null>(
        null,
    );
    const [adding, setAdding] = useState<string | null>(null);

    const addedCount = Object.keys(added).length;
    const full = addedCount >= max;
    const free = TEMPLATES.filter((template) => template.free);
    const premium = TEMPLATES.filter(
        (template) => !template.free && template.theme,
    );
    const comingSoon = TEMPLATES.filter(
        (template) => !template.free && !template.theme,
    );

    const choose = (template: TemplateDefinition) => {
        router.post(
            InvitationController.store.url(event.id),
            { template: template.key },
            {
                onStart: () => setAdding(template.key),
                onFinish: () => setAdding(null),
            },
        );
    };

    const badge = (template: TemplateDefinition) => (
        <span
            className={`absolute top-3 left-3 z-10 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryStyles[template.category]}`}
        >
            {t(`type.${template.category}`)}
        </span>
    );

    const renderCard = (template: TemplateDefinition) => {
        const invitationId = added[template.key];
        const locked = !template.free && !premiumUnlocked;

        return (
            <article
                key={template.key}
                className="flex flex-col overflow-hidden rounded-2xl border bg-background shadow-sm"
            >
                <button
                    type="button"
                    onClick={() => setPreviewing(template)}
                    className="relative block text-left"
                    aria-label={t('templates.view')}
                >
                    {badge(template)}
                    <TemplateThumbnail template={template} />
                </button>

                <div className="flex flex-1 flex-col gap-3 p-3">
                    <div className="flex items-start justify-between gap-2">
                        <p className="leading-snug font-semibold">
                            {t(template.name)}
                        </p>
                        {template.free ? (
                            <span className="shrink-0 rounded-full border border-emerald-500 px-2 text-xs text-emerald-700 dark:text-emerald-400">
                                {t('templates.free')}
                            </span>
                        ) : (
                            <span className="shrink-0 rounded-full border border-primary/60 px-2 text-xs text-primary">
                                {t('templates.premium')}
                            </span>
                        )}
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                        {invitationId ? (
                            <Button
                                asChild
                                size="sm"
                                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                <Link
                                    href={InvitationController.index.url(
                                        event.id,
                                        {
                                            query: {
                                                invitation: invitationId,
                                            },
                                        },
                                    )}
                                >
                                    <Check className="size-4" />
                                    {t('templates.added')}
                                </Link>
                            </Button>
                        ) : locked ? (
                            <Button asChild size="sm" className="rounded-full">
                                <Link
                                    href={pricing({
                                        query: { event: event.id },
                                    })}
                                >
                                    <Lock className="size-4" />
                                    {t('templates.locked')}
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                className="rounded-full"
                                disabled={full || adding !== null}
                                onClick={() => choose(template)}
                            >
                                <Plus className="size-4" />
                                {t('templates.choose')}
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => setPreviewing(template)}
                        >
                            <Eye className="size-4" />
                            {t('templates.view')}
                        </Button>
                    </div>
                </div>
            </article>
        );
    };

    return (
        <EventShell event={event} title={t('tab.add_template')}>
            <div className="flex items-baseline gap-3">
                <h2 className="text-lg font-bold">{t('templates.title')}</h2>
                <span className="text-sm text-muted-foreground tabular-nums">
                    {addedCount}/{max}
                </span>
            </div>

            {full && (
                <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    {t('templates.limit', { max })}
                </p>
            )}

            <section className="mt-6">
                <h3 className="flex items-center gap-2 font-bold">
                    <Check className="size-5 text-emerald-600" />
                    {t('templates.free')}
                    <span className="rounded-full bg-muted px-2 text-xs font-normal">
                        {free.length}
                    </span>
                </h3>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {free.map(renderCard)}
                </div>
            </section>

            <section className="mt-10">
                <h3 className="flex items-center gap-2 font-bold">
                    <Sparkles className="size-5 text-amber-500" />
                    {t('templates.premium')}
                    <span className="rounded-full bg-muted px-2 text-xs font-normal">
                        {premium.length + comingSoon.length}
                    </span>
                </h3>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {premium.map(renderCard)}
                    {comingSoon.map((template) => (
                        <article
                            key={template.key}
                            className="flex flex-col overflow-hidden rounded-2xl border bg-background shadow-sm"
                        >
                            <div className="relative flex aspect-[9/8] items-center justify-center bg-muted text-sm text-muted-foreground">
                                {badge(template)}
                                {t('templates.coming_soon')}
                            </div>
                            <div className="flex flex-1 flex-col gap-3 p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="leading-snug font-semibold">
                                        {t(template.name)}
                                    </p>
                                    <span className="shrink-0 rounded-full border border-primary/60 px-2 text-xs text-primary">
                                        {t('templates.premium')}
                                    </span>
                                </div>
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="mt-auto w-fit rounded-full"
                                >
                                    <a
                                        href={
                                            telegram ?? 'https://t.me/Kimsreng5'
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Phone className="size-4" />
                                        {t('templates.contact')}
                                    </a>
                                </Button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <TemplatePreviewDialog
                template={previewing}
                onClose={() => setPreviewing(null)}
                actions={
                    previewing &&
                    !added[previewing.key] &&
                    (previewing.free || premiumUnlocked) && (
                        <Button
                            size="sm"
                            className="rounded-full"
                            disabled={full || adding !== null}
                            onClick={() => {
                                choose(previewing);
                                setPreviewing(null);
                            }}
                        >
                            <Plus className="size-4" />
                            {t('templates.choose')}
                        </Button>
                    )
                }
            />
        </EventShell>
    );
}
