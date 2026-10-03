import type { Auth } from '@/types/auth';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            adminPending: number | null;
            telegram: string | null;
            googleSignIn: boolean;
            /** The Telegram login bot's username, when Telegram sign-in is on. */
            telegramBot: string | null;
            [key: string]: unknown;
        };
    }
}
