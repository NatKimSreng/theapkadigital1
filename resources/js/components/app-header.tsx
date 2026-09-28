import { Link, usePage } from '@inertiajs/react';
import { ChevronsUpDown, ListChecks } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as eventsIndex } from '@/routes/events';

export function AppHeader() {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();
    const { t } = useTranslation();

    return (
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 sm:gap-6 sm:px-6">
                <Link href={dashboard()} prefetch>
                    <AppLogo />
                </Link>

                <Link
                    href={eventsIndex()}
                    prefetch
                    className={cn(
                        'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-accent',
                        isCurrentUrl(eventsIndex()) &&
                            'bg-accent',
                    )}
                >
                    <ListChecks className="size-4" />
                    {t('nav.events')}
                </Link>

                <div className="ml-auto flex items-center gap-2">
                    <LanguageSwitcher />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-10 gap-2 rounded-full px-1.5 sm:pr-3"
                            >
                                <Avatar className="size-8 overflow-hidden rounded-full">
                                    <AvatarImage
                                        src={auth.user?.avatar}
                                        alt={auth.user?.name}
                                    />
                                    <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(auth.user?.name ?? '')}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden max-w-40 truncate sm:inline">
                                    {auth.user?.name}
                                </span>
                                <ChevronsUpDown className="hidden size-4 opacity-60 sm:inline" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            {auth.user && <UserMenuContent user={auth.user} />}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
