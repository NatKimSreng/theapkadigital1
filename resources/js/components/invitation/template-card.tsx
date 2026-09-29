import { Eye, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { TemplateThumbnail } from './template-thumbnail';
import type { TemplateDefinition } from './templates';

/**
 * A template card: live cover preview, name and a way to see the whole design.
 */
export function TemplateCard({
    template,
    premium,
    onPreview,
}: {
    template: TemplateDefinition;
    premium: boolean;
    onPreview: () => void;
}) {
    const { t } = useTranslation();

    return (
        <article className="group flex flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/10">
            <button
                type="button"
                onClick={onPreview}
                className="relative block overflow-hidden text-left"
                aria-label={t('templates.view')}
            >
                <TemplateThumbnail
                    template={template}
                    className="aspect-[3/4] transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <span className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent pt-10 pb-4 text-sm font-medium text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                    <Eye className="size-4" />
                    {t('templates.view')}
                </span>
            </button>
            <div className="flex items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                    <p className="truncate font-semibold">{t(template.name)}</p>
                    <p className="text-xs text-muted-foreground">
                        {t(`type.${template.category}`)}
                    </p>
                </div>
                {premium ? (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                        <Sparkles className="size-3" />
                        {t('templates.premium')}
                    </span>
                ) : (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {t('templates.free')}
                    </span>
                )}
            </div>
        </article>
    );
}
