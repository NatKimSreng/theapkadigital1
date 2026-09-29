import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useState } from 'react';
import {
    demoEvent,
    demoMedia,
    demoSettings,
} from '@/components/invitation/demo';
import { InvitationCard } from '@/components/invitation/invitation-card';
import { findTemplate } from '@/components/invitation/templates';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { dashboard, register } from '@/routes';
import { index as templatesIndex } from '@/routes/templates';
import type { InvitationLang } from '@/types';

/**
 * A template shown exactly like a guest would see it (opening animation
 * included), filled with sample content.
 */
export default function TemplateDemo({
    template: key,
    premium,
}: {
    template: string;
    premium: boolean;
}) {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    const [lang, setLang] = useState<InvitationLang>('km');
    const template = findTemplate(key);

    if (!template?.theme) {
        return null;
    }

    return (
        <>
            <Head title={t(template.name)} />
            <div
                className={cn(
                    'min-h-svh pb-20',
                    template.layout === 'paper'
                        ? 'bg-stone-200'
                        : 'bg-neutral-900',
                )}
            >
                <main className="relative mx-auto min-h-svh max-w-[480px] shadow-2xl">
                    <div className="absolute top-3 left-3 z-40 flex overflow-hidden rounded-full bg-black/40 text-xs text-white backdrop-blur-sm">
                        {(['km', 'en'] as const).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setLang(option)}
                                className={cn(
                                    'px-3 py-1.5',
                                    lang === option && 'bg-white/25 font-bold',
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
                        guestName={
                            lang === 'km' ? 'លោក សុខ ដារ៉ា' : 'Mr. Sok Dara'
                        }
                        gate
                    />
                </main>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-neutral-950/90 text-white backdrop-blur">
                <div className="mx-auto flex max-w-[480px] items-center gap-3 px-3 py-2.5">
                    <Link
                        href={templatesIndex()}
                        className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
                        aria-label={t('showcase.title')}
                    >
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                            {t(template.name)}
                            {premium && (
                                <Sparkles className="size-3.5 text-amber-300" />
                            )}
                        </p>
                        <p className="truncate text-xs text-white/60">
                            {t('showcase.demo_note')}
                        </p>
                    </div>
                    <Button
                        asChild
                        size="sm"
                        className="shrink-0 rounded-full bg-[oklch(0.78_0.11_82)] text-[oklch(0.2_0.02_60)] hover:bg-[oklch(0.84_0.1_85)]"
                    >
                        <Link href={auth.user ? dashboard() : register()}>
                            {t('showcase.use')}
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
