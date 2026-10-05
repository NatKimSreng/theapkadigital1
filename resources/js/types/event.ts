import type { Package } from './billing';

export type EventType =
    | 'wedding'
    | 'engagement'
    | 'birthday'
    | 'housewarming'
    | 'ceremony'
    | 'other';

export type PlannerEvent = {
    id: number;
    name: string;
    type: EventType;
    groom_name: string | null;
    bride_name: string | null;
    event_date: string | null;
    venue: string | null;
    exchange_rate: number;
    budget: number;
    description: string | null;
    package_id: number | null;
    package?: Package | null;
    guests_count?: number;
};

export type GuestStatus = 'pending' | 'confirmed' | 'declined';
export type GuestSide = 'groom' | 'bride' | 'both';

export type Guest = {
    id: number;
    name: string;
    phone: string | null;
    side: GuestSide;
    group: string | null;
    status: GuestStatus;
    party_size: number;
    note: string | null;
    gifts?: Gift[];
    invite_code?: string;
    invite_url?: string | null;
    invite_sent_at?: string | null;
};

export type GiftMethod = 'cash' | 'aba' | 'acleda' | 'wing' | 'other';

export type Gift = {
    id: number;
    guest_id: number | null;
    giver_name: string;
    amount_usd: number;
    amount_khr: number;
    method: GiftMethod;
    note: string | null;
    created_at: string;
};

export type ExpenseCategory =
    | 'venue'
    | 'food'
    | 'decoration'
    | 'attire'
    | 'photo'
    | 'music'
    | 'invitation'
    | 'transport'
    | 'ceremony'
    | 'other';

export type Expense = {
    id: number;
    title: string;
    category: ExpenseCategory;
    vendor: string | null;
    estimated_amount: number;
    actual_amount: number;
    paid: boolean;
    note: string | null;
};

export type Task = {
    id: number;
    title: string;
    due_date: string | null;
    done: boolean;
    note: string | null;
};

export type EventSummary = {
    guests: {
        total: number;
        people: number;
        confirmed: number;
        pending: number;
        declined: number;
    };
    gifts: { count: number; usd: number; khr: number; total_usd: number };
    expenses: {
        estimated: number;
        actual: number;
        budget: number;
        by_category: {
            category: ExpenseCategory;
            estimated: number;
            actual: number;
        }[];
    };
    tasks: { total: number; done: number };
    balance: number;
};

export const EVENT_TYPES: EventType[] = [
    'wedding',
    'engagement',
    'birthday',
    'housewarming',
    'ceremony',
    'other',
];
export const GUEST_STATUSES: GuestStatus[] = [
    'confirmed',
    'pending',
    'declined',
];
export const GUEST_SIDES: GuestSide[] = ['groom', 'bride', 'both'];
export const GIFT_METHODS: GiftMethod[] = [
    'cash',
    'aba',
    'acleda',
    'wing',
    'other',
];
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
    'venue',
    'food',
    'decoration',
    'attire',
    'photo',
    'music',
    'invitation',
    'transport',
    'ceremony',
    'other',
];

export type InvitationLang = 'km' | 'en';

export const INVITATION_TEXT_KEYS = [
    'title',
    'host_left',
    'host_right',
    'joiner',
    'invite_line',
    'guest_name',
    'date_text',
    'lunar_date',
    'venue_text',
    'address',
    'message_title',
    'message',
    'thanks_title',
    'thanks',
    'groom_parents',
    'bride_parents',
    'procession',
] as const;

export type InvitationTextKey = (typeof INVITATION_TEXT_KEYS)[number];

export type InvitationTexts = Partial<Record<InvitationTextKey, string | null>>;

export type AgendaItem = {
    time: string | null;
    km: string | null;
    en: string | null;
};

export type GiftAccount = {
    name?: string | null;
    number?: string | null;
    link?: string | null;
};

export type InvitationLanguages = 'both' | InvitationLang;

/** The pin read from the couple's map link on the server. */
export type MapPlace = { lat: number; lng: number; name: string | null };

export type InvitationSettings = {
    texts?: Partial<Record<InvitationLang, InvitationTexts>>;
    agenda?: AgendaItem[];
    hide_hosts?: boolean;
    primary_color?: string | null;
    secondary_color?: string | null;
    gold_text?: boolean;
    map_url?: string | null;
    /** A music-library song's ID, or 'none' for no music. */
    song?: number | 'none' | null;
    map_place?: MapPlace | null;
    /** The map link as a QR code: `size` modules a side, row by row. */
    map_qr?: { size: number; bits: string } | null;
    language?: InvitationLang;
    /** Which languages guests see; one language hides the switcher. */
    languages?: InvitationLanguages;
    event_time?: string | null;
    show_countdown?: boolean;
    gift?: { usd?: GiftAccount; khr?: GiftAccount };
    gallery_paths?: string[];
    opening?:
        | 'doors'
        | 'envelope'
        | 'curtain'
        | 'fade'
        | 'seal'
        | 'card'
        | 'fold'
        | 'glow';
    effect?: 'none' | 'petals' | 'sparkles' | 'hearts';
};

export const INVITATION_MEDIA = [
    'cover',
    'background',
    'frame',
    'music',
    'map',
    'khqr_usd',
    'khqr_khr',
] as const;

export const MAX_GALLERY = 16;

export type InvitationMediaKey = (typeof INVITATION_MEDIA)[number];

export type InvitationMedia = Record<InvitationMediaKey, string | null> & {
    gallery: string[];
    /** The music library's song, played when no music was uploaded. */
    song?: string | null;
};

/** A song in the site's music library. */
export type Song = {
    id: number;
    title: string;
    artist: string | null;
    url: string;
    is_default: boolean;
    /** The templates this is the theme song of. */
    templates: string[] | null;
};

export type Invitation = {
    id: number;
    public_id: string;
    template: string;
    settings: InvitationSettings | null;
    is_active: boolean;
    media: InvitationMedia;
};
