import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { dashboard, home, login, pricing, register } from '@/routes';

/**
 * The header of the public pages (home and pricing).
 */
export function PublicHeader() {
    const { auth } = usePage().props;
    const { t } = useTranslation();

    return (
        <header className="relative mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:px-6">
            <Link href={home()}>
                <AppLogo />
            </Link>
            <Link
                href={pricing()}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
                {t('nav.pricing')}
            </Link>
            <div className="ml-auto flex items-center gap-2">
                <LanguageSwitcher />
                {auth.user ? (
                    <Button asChild className="rounded-full">
                        <Link href={dashboard()}>{t('welcome.dashboard')}</Link>
                    </Button>
                ) : (
                    <>
                        <Button
                            asChild
                            variant="ghost"
                            className="rounded-full"
                        >
                            <Link href={login()}>{t('welcome.login')}</Link>
                        </Button>
                        <Button
                            asChild
                            className="hidden rounded-full sm:inline-flex"
                        >
                            <Link href={register()}>
                                {t('welcome.register')}
                            </Link>
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
}
