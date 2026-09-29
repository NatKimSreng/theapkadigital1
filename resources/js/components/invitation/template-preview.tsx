import { Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { show as templateDemo } from '@/routes/templates';
import type { InvitationLang } from '@/types';
import { demoEvent, demoMedia, demoSettings } from './demo';
import { InvitationCard } from './invitation-card';
import type { TemplateDefinition } from './templates';

/**
 * The whole invitation, every section filled with sample content, in a
 * phone-sized dialog.
 */
export function TemplatePreviewDialog({
    template,
    onClose,
    actions,
}: {
    template: TemplateDefinition | null;
    onClose: () => void;
    actions?: ReactNode;
}) {
    const { t } = useTranslation();
    const [lang, setLang] = useState<InvitationLang>('km');

    return (
        <Dialog
            open={template !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="flex max-h-[92svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[420px]">
                <DialogTitle className="sr-only">
                    {template && t(template.name)}
                </DialogTitle>
                {template && (
                    <>
                        <div className="relative min-h-0 flex-1 overflow-y-auto">
                            <div className="absolute top-3 left-3 z-40 flex overflow-hidden rounded-full bg-black/40 text-xs text-white backdrop-blur-sm">
                                {(['km', 'en'] as const).map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setLang(option)}
                                        className={cn(
                                            'px-3 py-1.5',
                                            lang === option &&
                                                'bg-white/25 font-bold',
                                        )}
                                    >
                                        {option === 'km' ? 'ខ្មែរ' : 'EN'}
                                    </button>
                                ))}
                            </div>
                            <InvitationCard
                                template={template}
                                settings={demoSettings(template)}
                                media={demoMedia(template)}
                                event={demoEvent(template)}
                                lang={lang}
                            />
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-background p-3">
                            <Link
                                href={templateDemo(template.key)}
                                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                            >
                                <ExternalLink className="size-4" />
                                {t('showcase.full_demo')}
                            </Link>
                            {actions}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
