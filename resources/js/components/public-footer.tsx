import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { useTranslation } from '@/lib/i18n';
import { home, pricing } from '@/routes';
import blog from '@/routes/blog';
import { index as templatesIndex } from '@/routes/templates';

/**
 * The footer of the public pages (home, pricing, blog).
 */
export function PublicFooter() {
    const { t } = useTranslation();

    const links = [
        { href: home.url(), label: t('nav.home') },
        { href: templatesIndex.url(), label: t('nav.templates') },
        { href: pricing.url(), label: t('nav.pricing') },
        { href: blog.index.url(), label: t('nav.blog') },
    ];

    return (
        <footer className="border-t border-border/70">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
                <Link href={home()}>
                    <AppLogo />
                </Link>
                <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <p className="sm:ml-auto">
                    © {new Date().getFullYear()} Theapka. {t('welcome.rights')}
                </p>
            </div>
        </footer>
    );
}
