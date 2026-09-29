import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { TemplatePreviewDialog } from '@/components/invitation/template-preview';
import { TemplateCard } from '@/components/invitation/template-card';
import type {
    TemplateCategory,
    TemplateDefinition,
} from '@/components/invitation/templates';
import { TEMPLATES } from '@/components/invitation/templates';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { dashboard, register } from '@/routes';

const READY = TEMPLATES.filter((template) => template.theme);

export default function TemplatesIndex({ premium }: { premium: string[] }) {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    const [category, setCategory] = useState<TemplateCategory | 'all'>('all');
    const [previewing, setPreviewing] = useState<TemplateDefinition | null>(
        null,
    );

    const categories = [
        'all',
        ...new Set(READY.map((template) => template.category)),
    ] as const;
    const shown = READY.filter(
        (template) => category === 'all' || template.category === category,
    );
    const startHref = auth.user ? dashboard() : register();

    return (
        <>
            <Head title={t('showcase.title')} />
            <div className="min-h-svh bg-background">
                <div className="relative">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,var(--accent),transparent_65%)]"
                    />
                    <PublicHeader />

                    <main className="relative mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6">
                        <header className="mx-auto max-w-2xl text-center">
                            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                                {t('showcase.eyebrow')}
                            </p>
                            <h1 className="mt-3 font-serif text-5xl font-semibold">
                                {t('showcase.title')}
                            </h1>
                            <p className="mt-4 text-muted-foreground">
                                {t('showcase.subtitle')}
                            </p>
                        </header>

                        <div className="mt-10 flex flex-wrap justify-center gap-2">
                            {categories.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setCategory(item)}
                                    className={cn(
                                        'rounded-full border px-4 py-1.5 text-sm transition-colors',
                                        category === item
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'bg-card text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {item === 'all'
                                        ? t('admin.all')
                                        : t(`type.${item}`)}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                            {shown.map((template) => (
                                <TemplateCard
                                    key={template.key}
                                    template={template}
                                    premium={premium.includes(template.key)}
                                    onPreview={() => setPreviewing(template)}
                                />
                            ))}
                        </div>

                        <div className="mt-14 text-center">
                            <Button
                                asChild
                                size="lg"
                                className="h-12 rounded-full px-8"
                            >
                                <Link href={startHref}>
                                    {t('showcase.cta')}
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </main>
                </div>
                <PublicFooter />
            </div>

            <TemplatePreviewDialog
                template={previewing}
                onClose={() => setPreviewing(null)}
                actions={
                    <Button asChild size="sm" className="rounded-full">
                        <Link href={startHref}>{t('showcase.use')}</Link>
                    </Button>
                }
            />
        </>
    );
}
