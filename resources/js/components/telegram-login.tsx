import { useEffect, useRef } from 'react';

/**
 * Telegram's own login button. Telegram confirms the person in its app,
 * then sends them to our callback, which checks Telegram's signature.
 */
export function TelegramLogin({ bot }: { bot: string }) {
    const box = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = box.current;

        if (!element) {
            return;
        }

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.dataset.telegramLogin = bot;
        script.dataset.size = 'large';
        script.dataset.radius = '20';
        script.dataset.userpic = 'false';
        script.dataset.authUrl = new URL(
            '/auth/telegram/callback',
            window.location.origin,
        ).toString();
        element.replaceChildren(script);

        return () => element.replaceChildren();
    }, [bot]);

    return (
        <div ref={box} className="flex min-h-11 items-center justify-center" />
    );
}
