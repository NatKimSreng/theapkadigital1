import { Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Locale } from '@/lib/i18n';
import { translate, useTranslation } from '@/lib/i18n';

const locales: Locale[] = ['km', 'en'];

export function LanguageSwitcher() {
    const { t, locale, setLocale } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="rounded-full"
                    aria-label={t('lang.switch')}
                >
                    <Globe className="size-4" />
                    <span className="hidden sm:inline">
                        {t('lang.current')}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {locales.map((option) => (
                    <DropdownMenuItem
                        key={option}
                        onClick={() => setLocale(option)}
                        className="justify-between gap-6"
                    >
                        {translate('lang.current', {}, option)}
                        {option === locale && <Check className="size-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
