import { createInertiaApp, router } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import { initializeLocale } from '@/lib/i18n';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Theapka';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome' ||
                name === 'invitation' ||
                name === 'pricing' ||
                name.startsWith('blog/'):
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('admin/'):
                return AdminLayout;
            case name.startsWith('settings/') || name === 'orders':
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#b07d2b',
    },
});

// This will set light / dark mode on load...
initializeTheme();
initializeLocale();

// Google Analytics (enabled from Admin → Site settings) counts each Inertia page.
router.on('navigate', (event) => {
    // After the page's <Head> has set the new title.
    setTimeout(() => {
        window.gtag?.('event', 'page_view', {
            page_location: window.location.href,
            page_path: event.detail.page.url,
            page_title: document.title,
        });
    });
});
