import { Link, usePage } from '@inertiajs/react';
import { Send } from 'lucide-react';
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
    const { telegram } = usePage().props;

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
                {telegram && (
                    <a
                        href={telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-full bg-[#229ED9] px-4 py-1.5 font-medium text-white transition-opacity hover:opacity-90 sm:ml-auto"
                    >
                        <Send className="size-4" />
                        {t('footer.telegram')}
                    </a>
                )}
                <p>
                    © {new Date().getFullYear()} Theapka. {t('welcome.rights')}
                </p>
            </div>
        </footer>
    );
}
