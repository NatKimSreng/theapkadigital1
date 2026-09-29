import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
    ArrowRight,
    CalendarHeart,
    ClipboardCheck,
    Gift,
    Languages,
    MailOpen,
    ReceiptText,
    Users,
} from 'lucide-react';
import { PostCard } from '@/components/blog/post-card';
import { TemplateCard } from '@/components/invitation/template-card';
import { TemplatePreviewDialog } from '@/components/invitation/template-preview';
import { TemplateThumbnail } from '@/components/invitation/template-thumbnail';
import type { TemplateDefinition } from '@/components/invitation/templates';
import { findTemplate } from '@/components/invitation/templates';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { Button } from '@/components/ui/button';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { dashboard, register } from '@/routes';
import blog from '@/routes/blog';
import { index as templatesIndex } from '@/routes/templates';
import type { PostSummary } from '@/types';

const features: {
    title: TranslationKey;
    body: TranslationKey;
    icon: typeof Users;
}[] = [
    { title: 'welcome.f1', body: 'welcome.f1d', icon: Users },
    { title: 'welcome.f2', body: 'welcome.f2d', icon: Gift },
    { title: 'welcome.f3', body: 'welcome.f3d', icon: ReceiptText },
    { title: 'welcome.f4', body: 'welcome.f4d', icon: ClipboardCheck },
    { title: 'welcome.f5', body: 'welcome.f5d', icon: MailOpen },
    { title: 'welcome.f6', body: 'welcome.f6d', icon: Languages },
];

const steps: { title: TranslationKey; body: TranslationKey }[] = [
    { title: 'welcome.s1', body: 'welcome.s1d' },
    { title: 'welcome.s2', body: 'welcome.s2d' },
    { title: 'welcome.s3', body: 'welcome.s3d' },
];

function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            <span className="h-px w-8 bg-primary/60" />
            {children}
        </p>
    );
}

// The first is the front phone in the hero, the second the one behind it.
const FEATURED = [
    'paper-frame',
    'blush-garden',
    'royal-wedding',
    'angkor-cinematic',
]
    .map((key) => findTemplate(key))
    .filter((template): template is TemplateDefinition => !!template?.theme);

function Phone({
    template,
    className,
    onOpen,
}: {
    template: TemplateDefinition;
    className?: string;
    onOpen: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className={cn(
                'block w-56 overflow-hidden rounded-[2.4rem] border-[7px] border-neutral-900 bg-neutral-900 shadow-2xl shadow-black/30 transition-transform hover:-translate-y-1 sm:w-64',
                className,
            )}
        >
            <TemplateThumbnail
                template={template}
                className="aspect-[9/17] rounded-[1.9rem]"
            />
        </button>
    );
}

function HeroPhones({
    onOpen,
}: {
    onOpen: (template: TemplateDefinition) => void;
}) {
    const [front, back] = FEATURED;

    return (
        <div className="relative mx-auto flex h-[520px] w-full max-w-md items-center justify-center sm:h-[580px]">
            <div className="absolute inset-10 -z-10 rounded-full bg-gradient-to-br from-primary/30 via-accent to-transparent blur-3xl" />
            {back && (
                <Phone
                    template={back}
                    onOpen={() => onOpen(back)}
                    className="absolute top-2 right-0 hidden rotate-6 opacity-95 sm:block"
                />
            )}
            {front && (
                <Phone
                    template={front}
                    onOpen={() => onOpen(front)}
                    className="relative -rotate-3 sm:-translate-x-16"
                />
            )}
        </div>
    );
}

export default function Welcome({ posts }: { posts: PostSummary[] }) {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    const startHref = auth.user ? dashboard() : register();
    const startLabel = auth.user ? t('welcome.dashboard') : t('welcome.start');
    const [previewing, setPreviewing] = useState<TemplateDefinition | null>(
        null,
    );

    return (
        <>
            <Head title={t('welcome.tagline')} />
            <div className="min-h-svh overflow-x-hidden bg-background">
                <div className="relative">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[720px] bg-[radial-gradient(ellipse_at_top_right,var(--accent),transparent_60%)]"
                    />

                    <PublicHeader />

                    <section className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 pt-10 pb-24 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
                        <div className="text-center lg:text-left">
                            <div className="flex justify-center lg:justify-start">
                                <Eyebrow>{t('welcome.tagline')}</Eyebrow>
                            </div>
                            <h1 className="mt-6 font-serif text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                                {t('welcome.title')}
                            </h1>
                            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                                {t('welcome.subtitle')}
                            </p>
                            <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-12 rounded-full px-8 shadow-lg shadow-primary/25"
                                >
                                    <Link href={startHref}>
                                        {startLabel}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="h-12 rounded-full border-primary/40 bg-transparent px-8"
                                >
                                    <a href="#templates">
                                        {t('welcome.explore')}
                                    </a>
                                </Button>
                            </div>

                            <dl className="mx-auto mt-12 grid max-w-md grid-cols-3 divide-x divide-border lg:mx-0">
                                {[
                                    ['∞', 'welcome.stat1'],
                                    ['USD · KHR', 'welcome.stat2'],
                                    [t('welcome.free'), 'welcome.stat3'],
                                ].map(([value, label]) => (
                                    <div
                                        key={label}
                                        className="px-3 first:pl-0"
                                    >
                                        <dt className="font-serif text-xl font-semibold whitespace-nowrap text-primary sm:text-2xl">
                                            {value}
                                        </dt>
                                        <dd className="mt-1 text-xs text-muted-foreground">
                                            {t(label as TranslationKey)}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <HeroPhones onOpen={setPreviewing} />
                    </section>
                </div>

                <section
                    id="templates"
                    className="mx-auto max-w-6xl scroll-mt-8 px-4 pb-24 sm:px-6"
                >
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <Eyebrow>{t('showcase.eyebrow')}</Eyebrow>
                            <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
                                {t('showcase.home_title')}
                            </h2>
                            <p className="mt-3 max-w-xl text-muted-foreground">
                                {t('showcase.home_subtitle')}
                            </p>
                        </div>
                        <Link
                            href={templatesIndex()}
                            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                            {t('showcase.see_all')}
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                        {FEATURED.map((template) => (
                            <TemplateCard
                                key={template.key}
                                template={template}
                                premium={!template.free}
                                onPreview={() => setPreviewing(template)}
                            />
                        ))}
                    </div>
                </section>

                <section
                    id="features"
                    className="scroll-mt-8 border-y border-border/70 bg-card/60 py-24"
                >
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="mx-auto max-w-2xl text-center">
                            <div className="flex justify-center">
                                <Eyebrow>
                                    {t('welcome.features_eyebrow')}
                                </Eyebrow>
                            </div>
                            <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
                                {t('welcome.features_title')}
                            </h2>
                        </div>

                        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group rounded-3xl border bg-background p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                                >
                                    <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-accent text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                        <feature.icon className="size-5" />
                                    </div>
                                    <h3 className="text-lg font-semibold">
                                        {t(feature.title)}
                                    </h3>
                                    <p className="mt-2 leading-relaxed text-muted-foreground">
                                        {t(feature.body)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="flex justify-center">
                            <Eyebrow>{t('welcome.steps_eyebrow')}</Eyebrow>
                        </div>
                        <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
                            {t('welcome.steps_title')}
                        </h2>
                    </div>

                    <ol className="relative mt-16 grid gap-10 md:grid-cols-3">
                        <div
                            aria-hidden
                            className="absolute top-8 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent md:block"
                        />
                        {steps.map((step, i) => (
                            <li
                                key={step.title}
                                className="relative text-center"
                            >
                                <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-primary/40 bg-background font-serif text-3xl font-semibold text-primary shadow-sm">
                                    {i + 1}
                                </div>
                                <h3 className="mt-6 text-lg font-semibold">
                                    {t(step.title)}
                                </h3>
                                <p className="mx-auto mt-2 max-w-xs leading-relaxed text-muted-foreground">
                                    {t(step.body)}
                                </p>
                            </li>
                        ))}
                    </ol>
                </section>

                {posts.length > 0 && (
                    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
                        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <Eyebrow>{t('blog.eyebrow')}</Eyebrow>
                                <h2 className="mt-3 font-serif text-4xl font-semibold">
                                    {t('blog.latest')}
                                </h2>
                            </div>
                            <Link
                                href={blog.index()}
                                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                            >
                                {t('blog.all_posts')}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    </section>
                )}

                <section className="px-4 pb-24 sm:px-6">
                    <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[oklch(0.22_0.012_60)] px-6 py-16 text-center text-[oklch(0.96_0.01_85)] sm:px-12">
                        <div
                            aria-hidden
                            className="absolute inset-3 rounded-[1.5rem] border border-[oklch(0.76_0.11_80_/_0.35)]"
                        />
                        <CalendarHeart className="relative mx-auto size-10 text-[oklch(0.8_0.11_82)]" />
                        <h2 className="relative mt-5 font-serif text-4xl font-semibold sm:text-5xl">
                            {t('welcome.cta_title')}
                        </h2>
                        <p className="relative mt-4 text-[oklch(0.8_0.02_80)]">
                            {t('welcome.cta_sub')}
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="relative mt-8 h-12 rounded-full bg-[oklch(0.78_0.11_82)] px-8 text-[oklch(0.2_0.02_60)] hover:bg-[oklch(0.84_0.1_85)]"
                        >
                            <Link href={startHref}>
                                {startLabel}
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </section>

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
