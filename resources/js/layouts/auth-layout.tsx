import { Link } from '@inertiajs/react';
import { Check, HeartHandshake } from 'lucide-react';
import type { ReactNode } from 'react';
import AppLogo from '@/components/app-logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { home } from '@/routes';

const highlights: TranslationKey[] = ['welcome.f1', 'welcome.f2', 'welcome.f5'];

/**
 * Pages set `title` and `description` as translation keys through their
 * `layout` property.
 */
export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: ReactNode;
}) {
    const { t } = useTranslation();
    const translate = (value: string) =>
        value ? t(value as TranslationKey) : '';

    return (
        <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <aside className="relative hidden overflow-hidden bg-[oklch(0.2_0.012_60)] p-12 text-[oklch(0.96_0.01_85)] lg:flex lg:flex-col">
                <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,oklch(0.76_0.11_80/0.28),transparent_55%),radial-gradient(circle_at_90%_90%,oklch(0.76_0.11_80/0.18),transparent_50%)]"
                />
                <div
                    aria-hidden
                    className="absolute inset-5 rounded-[2rem] border border-[oklch(0.76_0.11_80/0.3)]"
                />

                <Link
                    href={home()}
                    className="relative flex items-center gap-2.5"
                >
                    <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.82_0.11_85)] to-[oklch(0.66_0.12_75)] text-[oklch(0.2_0.02_60)]">
                        <HeartHandshake className="size-5" />
                    </span>
                    <span className="font-serif text-2xl font-semibold tracking-wide">
                        Theapka
                    </span>
                </Link>

                <div className="relative my-auto max-w-md">
                    <p className="text-xs font-semibold tracking-[0.25em] text-[oklch(0.8_0.11_82)] uppercase">
                        {t('welcome.tagline')}
                    </p>
                    <h2 className="mt-5 font-serif text-5xl leading-[1.1] font-semibold">
                        {t('welcome.title')}
                    </h2>
                    <ul className="mt-10 space-y-4">
                        {highlights.map((key) => (
                            <li key={key} className="flex items-center gap-3">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[oklch(0.76_0.11_80/0.2)] text-[oklch(0.82_0.11_85)]">
                                    <Check className="size-4" />
                                </span>
                                <span className="text-[oklch(0.86_0.02_80)]">
                                    {t(key)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-sm text-[oklch(0.7_0.02_80)]">
                    © {new Date().getFullYear()} Theapka
                </p>
            </aside>

            <main className="relative flex flex-col bg-[radial-gradient(ellipse_at_top,var(--accent),transparent_60%)] lg:bg-none">
                <div className="flex items-center justify-between p-4 sm:p-6">
                    <Link href={home()} className="lg:invisible">
                        <AppLogo />
                    </Link>
                    <LanguageSwitcher />
                </div>

                <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
                    <div className="w-full max-w-sm">
                        <div className="mb-8 text-center">
                            <h1 className="font-serif text-4xl font-semibold">
                                {translate(title)}
                            </h1>
                            {description && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {translate(description)}
                                </p>
                            )}
                        </div>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
