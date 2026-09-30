import { Head, Link, usePage } from '@inertiajs/react';
import { Check, Minus, Send, Sparkles } from 'lucide-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { Button } from '@/components/ui/button';
import { packageDescription, packageName } from '@/lib/billing';
import { formatNumber, formatUsd } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { checkout, register } from '@/routes';
import type { Package } from '@/types';

function Feature({ on, children }: { on: boolean; children: string }) {
    return (
        <li
            className={cn(
                'flex items-start gap-2.5',
                !on && 'text-muted-foreground',
            )}
        >
            {on ? (
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            ) : (
                <Minus className="mt-0.5 size-4 shrink-0" />
            )}
            {children}
        </li>
    );
}

export default function Pricing({
    packages,
    eventId,
}: {
    packages: Package[];
    eventId: number | null;
}) {
    const { auth, telegram } = usePage().props;
    const { t, locale } = useTranslation();

    const ctaHref = (pkg: Package) => {
        if (!auth.user) {
            return register();
        }

        return checkout(pkg.id, {
            query: eventId ? { event: eventId } : undefined,
        });
    };

    return (
        <>
            <Head title={t('nav.pricing')} />
            <div className="min-h-svh bg-background">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,var(--accent),transparent_65%)]"
                />
                <PublicHeader />

                <main className="relative mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
                            {t('pricing.eyebrow')}
                        </p>
                        <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
                            {t('pricing.title')}
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            {t('pricing.subtitle')}
                        </p>
                    </div>

                    <div
                        className={cn(
                            'mt-14 grid gap-5 sm:grid-cols-2',
                            packages.length >= 4
                                ? 'lg:grid-cols-4'
                                : 'lg:grid-cols-3',
                        )}
                    >
                        {packages.map((pkg) => (
                            <article
                                key={pkg.id}
                                className={cn(
                                    'relative flex flex-col rounded-3xl border bg-card p-6',
                                    pkg.is_featured &&
                                        'border-primary shadow-xl ring-1 shadow-primary/15 ring-primary',
                                )}
                            >
                                {pkg.is_featured && (
                                    <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium whitespace-nowrap text-primary-foreground">
                                        <Sparkles className="size-3.5" />
                                        {t('pricing.popular')}
                                    </span>
                                )}
                                <h2 className="font-serif text-2xl font-semibold">
                                    {packageName(pkg, locale)}
                                </h2>
                                <p className="mt-1 min-h-10 text-sm text-muted-foreground">
                                    {packageDescription(pkg, locale)}
                                </p>
                                <p className="mt-5 flex items-baseline gap-1">
                                    <span className="text-4xl font-bold tracking-tight">
                                        {pkg.price > 0
                                            ? formatUsd(pkg.price).replace(
                                                  '.00',
                                                  '',
                                              )
                                            : t('plan.free')}
                                    </span>
                                    {pkg.price > 0 && (
                                        <span className="text-sm text-muted-foreground">
                                            {t('pricing.per_event')}
                                        </span>
                                    )}
                                </p>

                                <ul className="mt-6 space-y-2.5 text-sm">
                                    <Feature on>
                                        {pkg.guest_limit
                                            ? t('pricing.guests', {
                                                  count: formatNumber(
                                                      pkg.guest_limit,
                                                  ),
                                              })
                                            : t('pricing.unlimited_guests')}
                                    </Feature>
                                    <Feature on>{t('pricing.basics')}</Feature>
                                    {pkg.price > 0 ? (
                                        <Feature on>
                                            {t('pricing.all_templates')}
                                        </Feature>
                                    ) : (
                                        <Feature on>
                                            {t('pricing.free_template_limit', {
                                                max: 2,
                                            })}
                                        </Feature>
                                    )}
                                    <Feature on={pkg.remove_branding}>
                                        {pkg.remove_branding
                                            ? t('pricing.remove_branding')
                                            : t('pricing.branding')}
                                    </Feature>
                                    {pkg.is_default && pkg.event_limit && (
                                        <Feature on>
                                            {t('pricing.events', {
                                                count: pkg.event_limit,
                                            })}
                                        </Feature>
                                    )}
                                </ul>

                                <div className="mt-auto pt-8">
                                    {pkg.is_default || pkg.price <= 0 ? (
                                        auth.user ? null : (
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="w-full rounded-full"
                                            >
                                                <Link href={register()}>
                                                    {t('pricing.start_free')}
                                                </Link>
                                            </Button>
                                        )
                                    ) : (
                                        <Button
                                            asChild
                                            variant={
                                                pkg.is_featured
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="w-full rounded-full"
                                        >
                                            <Link href={ctaHref(pkg)}>
                                                {t('pricing.choose', {
                                                    name: packageName(
                                                        pkg,
                                                        locale,
                                                    ),
                                                })}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>

                    <section className="mx-auto mt-20 max-w-4xl rounded-3xl border bg-card/60 p-8">
                        <h2 className="text-center font-serif text-3xl font-semibold">
                            {t('pricing.how_title')}
                        </h2>
                        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
                            {(
                                [
                                    'pricing.how1',
                                    'pricing.how2',
                                    'pricing.how3',
                                ] as const
                            ).map((key, i) => (
                                <li key={key} className="text-center">
                                    <span className="mx-auto flex size-11 items-center justify-center rounded-full border border-primary/40 font-serif text-xl font-semibold text-primary">
                                        {i + 1}
                                    </span>
                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {t(key)}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </section>
                    {telegram && (
                        <a
                            href={telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mx-auto mt-12 flex max-w-xl items-center gap-4 rounded-2xl border border-[#229ED9]/30 bg-[#229ED9]/8 p-5 transition-colors hover:bg-[#229ED9]/15"
                        >
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#229ED9] text-white">
                                <Send className="size-5" />
                            </span>
                            <span>
                                <span className="block font-semibold">
                                    {t('contact.title')}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {t('contact.body')}
                                </span>
                            </span>
                        </a>
                    )}
                </main>
                <PublicFooter />
            </div>
        </>
    );
}
