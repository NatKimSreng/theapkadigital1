import type { OrderStatus, Package } from '@/types';
import { formatDate } from '@/lib/format';

type Named = Pick<Package, 'name'> & { name_km?: string | null };

export function packageName(pkg: Named, locale: string): string {
    return locale === 'km' && pkg.name_km ? pkg.name_km : pkg.name;
}

export function packageDescription(pkg: Package, locale: string): string {
    return (
        (locale === 'km' && pkg.description_km
            ? pkg.description_km
            : pkg.description) ?? ''
    );
}

export const statusStyles: Record<OrderStatus, string> = {
    pending:
        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    approved:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
};

export function formatDateTime(value: string | null, locale: string): string {
    return formatDate(value, locale);
}
