import { AppHeader } from '@/components/app-header';
import { HelpButton } from '@/components/help-button';
import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-svh flex-col bg-background">
            <AppHeader />
            <main className="flex w-full flex-1 flex-col p-3 sm:p-5">
                {children}
            </main>
            <HelpButton />
        </div>
    );
}
