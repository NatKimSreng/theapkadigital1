import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    const { t } = useTranslation();

    const tabs: {
        value: Appearance;
        icon: LucideIcon;
        label: TranslationKey;
    }[] = [
        { value: 'light', icon: Sun, label: 'settings.light' },
        { value: 'dark', icon: Moon, label: 'settings.dark' },
        { value: 'system', icon: Monitor, label: 'settings.system' },
    ];

    return (
        <div
            className={cn(
                'inline-flex gap-1 rounded-full bg-muted p-1',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex items-center rounded-full px-4 py-1.5 transition-colors',
                        appearance === value
                            ? 'bg-background font-medium shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    <Icon className="-ml-1 h-4 w-4" />
                    <span className="ml-1.5 text-sm">{t(label)}</span>
                </button>
            ))}
        </div>
    );
}
