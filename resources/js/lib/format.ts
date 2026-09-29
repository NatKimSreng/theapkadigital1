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

const KM_MONTHS = [
    'មករា',
    'កុម្ភៈ',
    'មីនា',
    'មេសា',
    'ឧសភា',
    'មិថុនា',
    'កក្កដា',
    'សីហា',
    'កញ្ញា',
    'តុលា',
    'វិច្ឆិកា',
    'ធ្នូ',
];

const EN_MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

// Timestamps are shown in Cambodian time everywhere, so the server-rendered
// page and the browser always print the same date.
const cambodia = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
});

function dayParts(value: string): { day: number; month: number; year: number } {
    if (!value.includes('T')) {
        const [year, month, day] = value.slice(0, 10).split('-').map(Number);

        return { day, month, year };
    }

    const parts = Object.fromEntries(
        cambodia
            .formatToParts(new Date(value))
            .map((part) => [part.type, Number(part.value)]),
    );

    return { day: parts.day, month: parts.month, year: parts.year };
}

/**
 * "28 កញ្ញា 2026" / "28 Sep 2026". Built by hand rather than with
 * toLocaleDateString, whose Khmer output differs between Node and browsers.
 */
export function formatDate(value: string | null, locale: string): string {
    if (!value) {
        return '—';
    }

    const { day, month, year } = dayParts(value);

    if (!day || !month || !year) {
        return '—';
    }

    const months = locale === 'km' ? KM_MONTHS : EN_MONTHS;

    return `${day} ${months[month - 1]} ${year}`;
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
