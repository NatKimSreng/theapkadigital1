export type Package = {
    id: number;
    name: string;
    name_km: string | null;
    description: string | null;
    description_km: string | null;
    price: number;
    guest_limit: number | null;
    event_limit: number | null;
    premium_templates: boolean;
    remove_branding: boolean;
    is_default: boolean;
    is_featured: boolean;
    is_active: boolean;
    sort_order: number;
    orders_count?: number;
    events_count?: number;
};

export type OrderStatus = 'pending' | 'approved' | 'rejected';

export type PaymentMethod = 'aba' | 'khqr' | 'bank' | 'cash';

export type Order = {
    id: number;
    user_id: number;
    event_id: number;
    package_id: number;
    amount: number;
    status: OrderStatus;
    payment_method: PaymentMethod;
    reference: string | null;
    receipt_path: string | null;
    note: string | null;
    admin_note: string | null;
    reviewed_at: string | null;
    created_at: string;
    user?: { id: number; name: string; email: string };
    event?: { id: number; name: string } | null;
    package?: Pick<Package, 'id' | 'name'> & { name_km?: string | null };
    reviewer?: { id: number; name: string } | null;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
