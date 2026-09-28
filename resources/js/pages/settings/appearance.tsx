import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import { SettingsCard } from '@/layouts/settings/layout';
import type { Locale } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const LANGUAGES: { value: Locale; label: string }[] = [
    { value: 'km', label: 'ភាសាខ្មែរ' },
    { value: 'en', label: 'English' },
];

export default function Appearance() {
    const { t, locale, setLocale } = useTranslation();

    return (
        <>
            <Head title={t('settings.appearance')} />

            <SettingsCard
                title={t('settings.theme')}
                description={t('settings.theme_desc')}
            >
                <AppearanceTabs />
            </SettingsCard>

            <SettingsCard
                title={t('settings.language')}
                description={t('settings.language_desc')}
            >
                <div className="inline-flex gap-1 rounded-full bg-muted p-1">
                    {LANGUAGES.map((language) => (
                        <button
                            key={language.value}
                            type="button"
                            onClick={() => setLocale(language.value)}
                            className={cn(
                                'rounded-full px-5 py-1.5 text-sm transition-colors',
                                locale === language.value
                                    ? 'bg-background font-medium shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {language.label}
                        </button>
                    ))}
                </div>
            </SettingsCard>
        </>
    );
}
