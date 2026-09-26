import { AppHeader } from '@/components/app-header';
import { HelpButton } from '@/components/help-button';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-svh flex-col bg-rose-50/60 dark:bg-background">
            <AppHeader />
            <main className="flex w-full flex-1 flex-col p-3 sm:p-5">
                {children}
            </main>
            <HelpButton />
        </div>
    );
}
