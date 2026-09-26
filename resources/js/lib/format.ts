const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const numberFormatter = new Intl.NumberFormat('en-US');

export function formatUsd(value: number): string {
    return usdFormatter.format(value || 0);
}

export function formatKhr(value: number): string {
    return `៛${numberFormatter.format(Math.round(value || 0))}`;
}

export function formatNumber(value: number): string {
    return numberFormatter.format(value || 0);
}

export function formatDate(value: string | null, locale: string): string {
    if (!value) {
        return '—';
    }

    return new Date(`${value}T00:00:00`).toLocaleDateString(
        locale === 'km' ? 'km-KH' : 'en-GB',
        { day: 'numeric', month: 'short', year: 'numeric' },
    );
}

export function daysUntil(value: string | null): number | null {
    if (!value) {
        return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Math.round(
        (new Date(`${value}T00:00:00`).getTime() - today.getTime()) /
            86_400_000,
    );
}
