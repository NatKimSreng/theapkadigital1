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
    gifts_sum_amount_usd?: string | null;
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
