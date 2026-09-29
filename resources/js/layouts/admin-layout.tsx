import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarHeart,
    ChartLine,
    LayoutDashboard,
    Newspaper,
    Package as PackageIcon,
    Receipt,
    Settings,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import AppLogo from '@/components/app-logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { adminPending } = usePage().props;
    const { t } = useTranslation();
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    const items: {
        label: TranslationKey;
        href: string;
        icon: typeof Users;
        exact?: boolean;
        badge?: number | null;
    }[] = [
        {
            label: 'admin.overview',
            href: admin.dashboard.url(),
            icon: LayoutDashboard,
            exact: true,
        },
        {
            label: 'admin.analytics',
            href: admin.analytics.url(),
            icon: ChartLine,
        },
        {
            label: 'admin.orders',
            href: admin.orders.index.url(),
            icon: Receipt,
            badge: adminPending,
        },
        {
            label: 'admin.packages',
            href: admin.packages.index.url(),
            icon: PackageIcon,
        },
        { label: 'admin.users', href: admin.users.index.url(), icon: Users },
        {
            label: 'admin.events',
            href: admin.events.index.url(),
            icon: CalendarHeart,
        },
        { label: 'admin.blog', href: admin.posts.index.url(), icon: Newspaper },
        {
            label: 'admin.site_settings',
            href: admin.settings.edit.url(),
            icon: Settings,
        },
    ];

    const active = (item: (typeof items)[number]) =>
        item.exact ? isCurrentUrl(item.href) : isCurrentOrParentUrl(item.href);

    return (
        <div className="flex min-h-svh flex-col bg-background">
            <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
                <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
                    <Link
                        href={admin.dashboard()}
                        className="flex items-center"
                    >
                        <AppLogo />
                    </Link>
                    <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">
                        {t('admin.title')}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                        <LanguageSwitcher />
                        <Link
                            href={dashboard()}
                            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            <span className="hidden sm:inline">
                                {t('admin.back')}
                            </span>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-[minmax(0,1fr)] gap-5 p-3 sm:p-5 lg:grid-cols-[14rem_minmax(0,1fr)]">
                <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
                    <nav className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:rounded-3xl lg:border lg:bg-card lg:p-3 lg:shadow-sm">
                        {items.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                prefetch
                                className={cn(
                                    'flex shrink-0 items-center gap-3 rounded-full border bg-card px-4 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground lg:rounded-xl lg:border-0 lg:bg-transparent lg:px-3 lg:py-2.5 lg:hover:bg-accent',
                                    active(item) &&
                                        'border-primary bg-primary font-medium text-primary-foreground hover:text-primary-foreground lg:bg-primary lg:hover:bg-primary',
                                )}
                            >
                                <item.icon className="size-[18px]" />
                                {t(item.label)}
                                {item.badge ? (
                                    <span
                                        className={cn(
                                            'ml-auto rounded-full bg-amber-500 px-2 text-xs font-semibold text-white',
                                        )}
                                    >
                                        {item.badge}
                                    </span>
                                ) : null}
                            </Link>
                        ))}
                    </nav>
                </aside>

                <main className="min-w-0">{children}</main>
            </div>
        </div>
    );
}

export function AdminPage({
    title,
    actions,
    children,
}: {
    title: string;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="rounded-3xl border bg-card p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-serif text-3xl font-semibold">{title}</h1>
                {actions}
            </div>
            {children}
        </div>
    );
}
