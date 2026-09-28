import { Link } from '@inertiajs/react';
import { Palette, Receipt, ShieldCheck, UserRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { index as ordersIndex } from '@/routes/orders';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const items: { label: TranslationKey; href: string; icon: typeof Palette }[] = [
    { label: 'settings.profile', href: edit.url(), icon: UserRound },
    {
        label: 'settings.security',
        href: editSecurity.url(),
        icon: ShieldCheck,
    },
    {
        label: 'settings.appearance',
        href: editAppearance.url(),
        icon: Palette,
    },
    { label: 'nav.orders', href: ordersIndex.url(), icon: Receipt },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { t } = useTranslation();
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="mx-auto grid w-full max-w-5xl grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
                <h1 className="mb-3 hidden font-serif text-3xl font-semibold lg:block">
                    {t('nav.settings')}
                </h1>
                <nav
                    aria-label={t('nav.settings')}
                    className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:rounded-3xl lg:border lg:bg-card lg:p-3 lg:shadow-sm"
                >
                    {items.map((item) => {
                        const active = isCurrentOrParentUrl(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch
                                className={cn(
                                    'flex shrink-0 items-center gap-3 rounded-full border bg-card px-4 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground lg:rounded-xl lg:border-0 lg:bg-transparent lg:px-3 lg:py-2.5 lg:hover:bg-accent',
                                    active &&
                                        'border-primary bg-primary font-medium text-primary-foreground hover:text-primary-foreground lg:bg-primary lg:hover:bg-primary',
                                )}
                            >
                                <item.icon className="size-[18px]" />
                                {t(item.label)}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div className="min-w-0 space-y-5">{children}</div>
        </div>
    );
}

/**
 * One settings section in its own card.
 */
export function SettingsCard({
    title,
    description,
    danger = false,
    children,
}: PropsWithChildren<{
    title: string;
    description?: string;
    danger?: boolean;
}>) {
    return (
        <section
            className={cn(
                'rounded-3xl border bg-card p-5 shadow-sm sm:p-7',
                danger && 'border-red-200 dark:border-red-900/60',
            )}
        >
            <header className="mb-5">
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </header>
            {children}
        </section>
    );
}
