import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    ArrowRight,
    CalendarHeart,
    CheckCircle2,
    ClipboardCheck,
    Gift,
    Languages,
    MailOpen,
    ReceiptText,
    Users,
} from 'lucide-react';
import { PostCard } from '@/components/blog/post-card';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { Button } from '@/components/ui/button';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { dashboard, register } from '@/routes';
import blog from '@/routes/blog';
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

function InvitationPreview() {
    const { t } = useTranslation();

    return (
        <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/25 via-accent to-transparent blur-2xl" />

            <div className="rotate-[-2deg] rounded-[2rem] bg-card p-3 shadow-2xl ring-1 shadow-primary/15 ring-primary/20">
                <div className="rounded-[1.6rem] border border-primary/40 p-1.5">
                    <div className="flex flex-col items-center rounded-[1.3rem] border border-primary/25 bg-gradient-to-b from-accent/70 to-card px-6 py-10 text-center">
                        <svg
                            viewBox="0 0 120 20"
                            className="h-5 w-28 text-primary"
                            aria-hidden
                        >
                            <path
                                d="M2 10h44M74 10h44"
                                stroke="currentColor"
                                strokeWidth="1"
                            />
                            <path
                                d="M60 2l6 8-6 8-6-8z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.2"
                            />
                            <circle
                                cx="50"
                                cy="10"
                                r="1.6"
                                fill="currentColor"
                            />
                            <circle
                                cx="70"
                                cy="10"
                                r="1.6"
                                fill="currentColor"
                            />
                        </svg>
                        <p className="mt-6 text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
                            {t('welcome.mock_label')}
                        </p>
                        <p className="mt-3 font-['Great_Vibes'] text-5xl leading-tight text-primary">
                            Sophea
                        </p>
                        <p className="font-serif text-2xl text-muted-foreground italic">
                            &amp;
                        </p>
                        <p className="font-['Great_Vibes'] text-5xl leading-tight text-primary">
                            Dara
                        </p>
                        <div className="mt-6 h-px w-24 bg-primary/40" />
                        <p className="mt-4 font-serif text-lg">
                            {t('welcome.mock_date')}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Phnom Penh
                        </p>
                    </div>
                </div>
            </div>

            <div className="absolute -top-4 -left-2 flex items-center gap-3 rounded-2xl bg-card/95 px-4 py-3 shadow-lg ring-1 ring-border backdrop-blur sm:-left-14">
                <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="size-5" />
                </div>
                <div className="text-left">
                    <p className="text-lg leading-none font-semibold">128</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {t('welcome.mock_rsvp')}
                    </p>
                </div>
            </div>

            <div className="absolute -right-2 -bottom-6 flex items-center gap-3 rounded-2xl bg-card/95 px-4 py-3 shadow-lg ring-1 ring-border backdrop-blur sm:-right-12">
                <div className="flex size-9 items-center justify-center rounded-full bg-accent text-primary">
                    <Gift className="size-5" />
                </div>
                <div className="text-left">
                    <p className="text-lg leading-none font-semibold">$4,250</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {t('welcome.mock_gifts')}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Welcome({ posts }: { posts: PostSummary[] }) {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    const startHref = auth.user ? dashboard() : register();
    const startLabel = auth.user ? t('welcome.dashboard') : t('welcome.start');

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
                                    <a href="#features">
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

                        <InvitationPreview />
                    </section>
                </div>

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
        </>
    );
}
