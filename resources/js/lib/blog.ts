export type PostState = 'published' | 'scheduled' | 'draft';

export function postStatus(publishedAt: string | null): PostState {
    if (!publishedAt) {
        return 'draft';
    }

    return new Date(publishedAt) > new Date() ? 'scheduled' : 'published';
}

export const statusBadge: Record<PostState, string> = {
    published:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    scheduled: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    draft: 'bg-muted text-muted-foreground',
};

/**
 * Mirrors Post::slugFrom() on the server: keeps Khmer letters and marks.
 */
export function slugify(text: string): string {
    return text
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 120);
}

/**
 * A JSON POST to the app, with the CSRF token Laravel sets as a cookie.
 */
export async function postJson<T>(url: string, body: FormData): Promise<T> {
    const token = document.cookie
        .split('; ')
        .find((part) => part.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    const response = await fetch(url, {
        method: 'POST',
        body,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}),
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message =
            (data as { message?: string }).message ?? response.statusText;

        throw new Error(message);
    }

    return data as T;
}

/**
 * ISO timestamp → the value a datetime-local input expects, in local time.
 */
export function toLocalInput(iso: string | null): string {
    if (!iso) {
        return '';
    }

    const date = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
