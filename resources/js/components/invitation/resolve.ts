import type { CSSProperties } from 'react';
import type {
    InvitationLang,
    InvitationMedia,
    InvitationMediaKey,
    InvitationSettings,
    PlannerEvent,
} from '@/types';
import { INVITATION_MEDIA } from '@/types/event';
import type { TemplateDefinition } from './templates';
import { COPY, SINGLE_HOST } from './templates';

export type InvitationEvent = Pick<
    PlannerEvent,
    'name' | 'groom_name' | 'bride_name' | 'event_date' | 'venue'
>;

export type ResolvedInvitation = ReturnType<typeof resolveInvitation>;

export const TITLE_FONT = "'Moul', 'Kantumruy Pro', serif";
export const BODY_FONT = "'Kantumruy Pro', sans-serif";
export const SCRIPT_FONT = "'Great Vibes', 'Moul', cursive";
export const SERIF_FONT = "'Cormorant Garamond', 'Kantumruy Pro', serif";

export function emptyMedia(): InvitationMedia {
    const single = Object.fromEntries(
        INVITATION_MEDIA.map((key) => [key, null]),
    ) as Record<InvitationMediaKey, null>;

    return { ...single, gallery: [] };
}

// Browsers without full Khmer locale data fall back to English, so Khmer
// dates are built by hand.
export const KM_MONTHS = [
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
export const KM_WEEKDAYS = [
    'អាទិត្យ',
    'ច័ន្ទ',
    'អង្គារ',
    'ពុធ',
    'ព្រហស្បតិ៍',
    'សុក្រ',
    'សៅរ៍',
];

export function khmerDigits(value: string): string {
    return value.replace(/[0-9]/g, (digit) => '០១២៣៤៥៦៧៨៩'[Number(digit)]);
}

function dateParts(value: string | null, lang: InvitationLang) {
    if (!value) {
        return null;
    }

    const date = new Date(`${value.slice(0, 10)}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    if (lang === 'km') {
        return {
            weekday: `ថ្ងៃ${KM_WEEKDAYS[date.getDay()]}`,
            day: khmerDigits(String(date.getDate())),
            month: `ខែ${KM_MONTHS[date.getMonth()]}`,
            year: khmerDigits(String(date.getFullYear())),
        };
    }

    const part = (options: Intl.DateTimeFormatOptions) =>
        date.toLocaleDateString('en-GB', options);

    return {
        weekday: part({ weekday: 'long' }),
        day: String(date.getDate()),
        month: part({ month: 'long' }),
        year: String(date.getFullYear()),
    };
}

export function longDate(value: string | null, lang: InvitationLang): string {
    const parts = dateParts(value, lang);

    if (!parts) {
        return '';
    }

    return lang === 'km'
        ? `${parts.weekday} ទី${parts.day} ${parts.month} ឆ្នាំ${parts.year}`
        : `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year}`;
}

/**
 * The couple's initials for a monogram crest, preferring the English names
 * ("Sok Visal" & "Chan Sreynich" -> "VS" uses given names' first letters).
 */
function monogram(
    settings: InvitationSettings,
    event: InvitationEvent,
): string {
    const names = [
        settings.texts?.en?.host_left || event.groom_name || event.name,
        settings.texts?.en?.host_right || event.bride_name || '',
    ];

    const letters = names
        .map((name) => {
            const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
            // Khmer names put the family name first, so use the given name.
            const given = words.length > 1 ? words[words.length - 1] : words[0];

            return given ? Array.from(given)[0].toUpperCase() : '';
        })
        .filter(Boolean);

    return letters.join('') || '♥';
}

/**
 * The languages an invitation is shown in, in display order.
 */
export function invitationLangs(
    settings: InvitationSettings,
): InvitationLang[] {
    const mode = settings.languages ?? 'both';

    return mode === 'both' ? ['km', 'en'] : [mode];
}

/**
 * The language a guest sees first: the one in the link if it's offered,
 * then the host's default, then the first offered language.
 */
export function startLang(
    settings: InvitationSettings,
    requested?: InvitationLang | null,
): InvitationLang {
    const langs = invitationLangs(settings);

    for (const lang of [requested, settings.language]) {
        if (lang && langs.includes(lang)) {
            return lang;
        }
    }

    return langs[0];
}

/**
 * Resolves an invitation's texts and colours in one language, falling back to
 * the template defaults and the event's own details for anything left blank.
 */
export function resolveInvitation(
    template: TemplateDefinition,
    settings: InvitationSettings,
    event: InvitationEvent,
    lang: InvitationLang,
) {
    const theme = template.theme!;
    const copy = COPY[lang];
    const texts = settings.texts?.[lang] ?? {};
    const single = SINGLE_HOST.includes(template.category);
    const eventTime = settings.event_time || null;

    return {
        theme,
        copy,
        lang,
        bilingual: invitationLangs(settings).length > 1,
        title: texts.title || copy.titles[template.category],
        hostLeft:
            texts.host_left || event.groom_name || (single ? event.name : ''),
        hostRight: single
            ? texts.host_right || ''
            : texts.host_right || event.bride_name || '',
        joiner: texts.joiner || copy.joiner,
        inviteLine: texts.invite_line || copy.inviteLine,
        guestName: texts.guest_name || copy.guestName,
        dateText: texts.date_text || longDate(event.event_date, lang),
        lunarDate: texts.lunar_date || '',
        address: texts.address || '',
        procession: texts.procession || '',
        dateParts: dateParts(event.event_date, lang),
        eventDate: event.event_date,
        eventTime,
        timeText:
            eventTime && lang === 'km' ? khmerDigits(eventTime) : eventTime,
        // The place named in the map link beats the event's own venue field.
        venueText:
            texts.venue_text || settings.map_place?.name || event.venue || '',
        messageTitle: texts.message_title || copy.messageTitle,
        message: texts.message || copy.messages[template.category],
        thanksTitle: texts.thanks_title || copy.thanksTitle,
        thanks: texts.thanks || copy.thanks,
        groomParents: texts.groom_parents || '',
        brideParents: texts.bride_parents || '',
        agenda: (settings.agenda ?? [])
            .map((item) => ({ time: item.time ?? '', title: item[lang] ?? '' }))
            .filter((item) => item.time || item.title),
        primary: settings.primary_color || theme.primary,
        secondary: settings.secondary_color || theme.secondary,
        gold: settings.gold_text ?? theme.gold ?? false,
        monogram: monogram(settings, event),
        hideHosts: settings.hide_hosts ?? false,
        showCountdown: (settings.show_countdown ?? true) && !!event.event_date,
        gift: settings.gift ?? {},
        opening: settings.opening ?? theme.opening,
        effect: settings.effect ?? theme.effect,
        mapPlace: settings.map_place ?? null,
        mapLinked: !!settings.map_url,
        mapQr: settings.map_qr ?? null,
        mapHref:
            settings.map_url ||
            (texts.venue_text || event.venue
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(texts.venue_text || event.venue || '')}`
                : null),
    };
}

/**
 * Text style for headings: flat colour, or a gold gradient when enabled.
 */
export function headlineStyle(
    data: ResolvedInvitation,
    color: string,
): CSSProperties {
    return data.gold
        ? {
              backgroundImage: `linear-gradient(180deg, #fff8e1 0%, ${data.primary} 40%, ${data.secondary} 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))',
          }
        : { color };
}

export function backgroundStyle(
    data: ResolvedInvitation,
    media: InvitationMedia,
): CSSProperties {
    return media.background
        ? {
              backgroundImage: `url("${media.background}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
          }
        : { background: data.theme.background };
}

/**
 * The moment the event starts, in the guest's local time.
 */
export function eventStart(data: ResolvedInvitation): Date | null {
    if (!data.eventDate) {
        return null;
    }

    return new Date(
        `${data.eventDate.slice(0, 10)}T${data.eventTime ?? '00:00'}:00`,
    );
}

export function calendarUrl(data: ResolvedInvitation): string | null {
    if (!data.eventDate) {
        return null;
    }

    const day = data.eventDate.replaceAll('-', '');
    let dates: string;

    if (data.eventTime) {
        const start = `${day}T${data.eventTime.replace(':', '')}00`;
        const endHour = String(
            Math.min(23, Number(data.eventTime.slice(0, 2)) + 4),
        ).padStart(2, '0');
        dates = `${start}/${day}T${endHour}${data.eventTime.slice(3)}00`;
    } else {
        const next = new Date(`${data.eventDate}T00:00:00`);
        next.setDate(next.getDate() + 1);
        const nextDay = [
            next.getFullYear(),
            String(next.getMonth() + 1).padStart(2, '0'),
            String(next.getDate()).padStart(2, '0'),
        ].join('');
        dates = `${day}/${nextDay}`;
    }

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: data.title,
        dates,
        location: data.venueText,
        ctz: 'Asia/Phnom_Penh',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
