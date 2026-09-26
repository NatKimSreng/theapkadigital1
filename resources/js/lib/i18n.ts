import { useCallback, useSyncExternalStore } from 'react';

const en = {
    'nav.events': 'Events',
    'nav.settings': 'Settings',
    'nav.logout': 'Log out',
    'lang.current': 'English',
    'lang.switch': 'Language',

    'help.button': 'Help',
    'help.title': 'Need help?',
    'help.body':
        'Create an event, then use the tabs to manage your guest list, record gifts, track expenses and tick off your preparation checklist. The dashboard adds everything up for you.',
    'help.contact': 'Contact us on Telegram',

    'tab.dashboard': 'Dashboard',
    'tab.guests': 'Guest list',
    'tab.expenses': 'Expenses',
    'tab.gifts': 'Gifts',
    'tab.tasks': 'Checklist',

    'dashboard.title': 'Dashboard',
    'event.edit': 'Edit event',
    'stat.guests_invited': 'Guests invited',
    'stat.confirmed': 'Confirmed attending',
    'stat.gifts_total': 'Total gifts',
    'stat.in_riel': 'in riel',
    'stat.rate': 'Exchange rate',
    'stat.expenses': 'Expenses',
    'stat.estimated': 'Estimated',
    'stat.actual': 'Actual',
    'stat.balance': 'Profit / Loss',
    'stat.balance_hint': 'Gifts minus actual expenses',
    'stat.people': ':count people',

    'chart.guests': 'Guest attendance',
    'chart.finance': 'Finance overview',
    'chart.expenses': 'Expenses by category',
    'chart.empty': 'No data yet',
    'finance.gifts': 'Gifts',
    'finance.estimated': 'Estimated expense',
    'finance.actual': 'Actual expense',
    'finance.balance': 'Profit / Loss',

    'status.pending': 'Pending',
    'status.confirmed': 'Confirmed',
    'status.declined': 'Declined',
    'side.groom': 'Groom side',
    'side.bride': 'Bride side',
    'side.both': 'Both sides',

    'method.cash': 'Cash',
    'method.aba': 'ABA',
    'method.acleda': 'ACLEDA',
    'method.wing': 'Wing',
    'method.other': 'Other',

    'category.venue': 'Venue',
    'category.food': 'Food & drinks',
    'category.decoration': 'Decoration',
    'category.attire': 'Attire & makeup',
    'category.photo': 'Photo & video',
    'category.music': 'Music & MC',
    'category.invitation': 'Invitations',
    'category.transport': 'Transport',
    'category.ceremony': 'Ceremony',
    'category.other': 'Other',

    'type.wedding': 'Wedding',
    'type.engagement': 'Engagement',
    'type.birthday': 'Birthday',
    'type.housewarming': 'Housewarming',
    'type.ceremony': 'Ceremony',
    'type.other': 'Other',

    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.search': 'Search…',
    'common.all': 'All',
    'common.total': 'Total',
    'common.no_records': 'No records yet',
    'common.note': 'Note',
    'common.confirm_delete': 'Are you sure you want to delete this?',
    'common.confirm_delete_hint': 'This cannot be undone.',

    'events.title': 'My events',
    'events.subtitle': 'Plan every celebration in one place',
    'events.new': 'New event',
    'events.empty':
        'You have no events yet. Create your first one to start planning.',
    'events.guests_count': ':count guests',
    'events.open': 'Open',

    'event.name': 'Event name',
    'event.type': 'Event type',
    'event.groom': 'Groom',
    'event.bride': 'Bride',
    'event.date': 'Date',
    'event.venue': 'Venue',
    'event.rate': 'Exchange rate (1 USD = ? KHR)',
    'event.budget': 'Budget (USD)',
    'event.description': 'Description',
    'event.delete': 'Delete event',
    'event.days_left': ':count days to go',
    'event.today': 'Today!',
    'event.passed': 'Event has passed',

    'guest.name': 'Name',
    'guest.phone': 'Phone',
    'guest.side': 'Side',
    'guest.group': 'Group',
    'guest.status': 'Status',
    'guest.party': 'People',
    'guest.gift': 'Gift',
    'guest.add': 'Add guest',
    'guest.edit': 'Edit guest',

    'gift.giver': 'Giver',
    'gift.guest': 'Linked guest',
    'gift.none': 'None',
    'gift.usd': 'Amount (USD)',
    'gift.khr': 'Amount (KHR)',
    'gift.method': 'Method',
    'gift.add': 'Add gift',
    'gift.edit': 'Edit gift',
    'gift.total_usd': 'Received in USD',
    'gift.total_khr': 'Received in KHR',
    'gift.total_all': 'Total (converted to USD)',

    'expense.title': 'Item',
    'expense.category': 'Category',
    'expense.vendor': 'Vendor',
    'expense.estimated': 'Estimated',
    'expense.actual': 'Actual',
    'expense.paid': 'Paid',
    'expense.unpaid': 'Unpaid',
    'expense.add': 'Add expense',
    'expense.edit': 'Edit expense',
    'expense.remaining': 'Remaining budget',
    'expense.budget': 'Budget',

    'task.title': 'Task',
    'task.due': 'Due date',
    'task.add': 'Add task',
    'task.progress': ':done of :total done',
    'task.placeholder': 'e.g. Book the venue',

    'toast.saved': 'Saved',
    'toast.deleted': 'Deleted',
    'toast.event_created': 'Event created',

    'welcome.tagline': 'Wedding & event planner',
    'welcome.title': 'Plan your big day, stress-free',
    'welcome.subtitle':
        'Guest lists, cash gifts in dollars and riel, budgets and checklists — everything for your Khmer wedding or celebration in one simple dashboard.',
    'welcome.start': 'Get started free',
    'welcome.login': 'Log in',
    'welcome.register': 'Register',
    'welcome.dashboard': 'Go to dashboard',
    'welcome.f1': 'Guest list & RSVPs',
    'welcome.f1d':
        'Track who is invited, who confirmed and how many people are coming.',
    'welcome.f2': 'Gifts in USD & KHR',
    'welcome.f2d':
        'Record every envelope with your own exchange rate. Totals update instantly.',
    'welcome.f3': 'Budget & expenses',
    'welcome.f3d':
        'Compare estimated and actual costs and see your profit or loss.',
    'welcome.f4': 'Preparation checklist',
    'welcome.f4d': 'Never forget a task with due dates and progress tracking.',
};

export type TranslationKey = keyof typeof en;

const km: Record<TranslationKey, string> = {
    'nav.events': 'កម្មវិធី',
    'nav.settings': 'ការកំណត់',
    'nav.logout': 'ចាកចេញ',
    'lang.current': 'ភាសាខ្មែរ',
    'lang.switch': 'ភាសា',

    'help.button': 'ជំនួយ',
    'help.title': 'ត្រូវការជំនួយ?',
    'help.body':
        'បង្កើតកម្មវិធីមួយ រួចប្រើផ្ទាំងខាងលើដើម្បីគ្រប់គ្រងបញ្ជីភ្ញៀវ កត់ត្រាចំណងដៃ តាមដានការចំណាយ និងបញ្ជីការងាររៀបចំ។ ផ្ទាំងព័ត៌មាននឹងគណនាសរុបជូនអ្នកដោយស្វ័យប្រវត្តិ។',
    'help.contact': 'ទាក់ទងយើងតាម Telegram',

    'tab.dashboard': 'ផ្ទាំងព័ត៌មាន',
    'tab.guests': 'បញ្ជីភ្ញៀវ',
    'tab.expenses': 'ចំណាយ',
    'tab.gifts': 'ចំណងដៃ',
    'tab.tasks': 'ការរៀបចំ',

    'dashboard.title': 'ផ្ទាំងគ្រប់គ្រង',
    'event.edit': 'កែប្រែព័ត៌មានកម្មវិធី',
    'stat.guests_invited': 'ភ្ញៀវដែលបានអញ្ជើញ',
    'stat.confirmed': 'ចំនួនបញ្ជាក់ថានឹងចូលរួម',
    'stat.gifts_total': 'ចំណងដៃសរុប',
    'stat.in_riel': 'ជាប្រាក់រៀល',
    'stat.rate': 'អត្រាប្តូរប្រាក់',
    'stat.expenses': 'ការចំណាយ',
    'stat.estimated': 'ប៉ាន់ស្មាន',
    'stat.actual': 'ពិតប្រាកដ',
    'stat.balance': 'ចំនេញ/ខាត',
    'stat.balance_hint': 'ចំណងដៃ ដក ចំណាយពិត',
    'stat.people': ':count នាក់',

    'chart.guests': 'ក្រាបទិន្នន័យអ្នកចូលរួម',
    'chart.finance': 'ក្រាបទិន្នន័យហិរញ្ញវត្ថុ',
    'chart.expenses': 'ក្រាបទិន្នន័យចំណាយ',
    'chart.empty': 'មិនទាន់មានទិន្នន័យ',
    'finance.gifts': 'ចំណងដៃ',
    'finance.estimated': 'ចំណាយប៉ាន់ស្មាន',
    'finance.actual': 'ចំណាយពិត',
    'finance.balance': 'ចំនេញ/ខាត',

    'status.pending': 'មិនទាន់ឆ្លើយតប',
    'status.confirmed': 'បានបញ្ជាក់',
    'status.declined': 'បដិសេធ',
    'side.groom': 'ខាងកូនប្រុស',
    'side.bride': 'ខាងកូនស្រី',
    'side.both': 'ទាំងពីរខាង',

    'method.cash': 'សាច់ប្រាក់',
    'method.aba': 'ABA',
    'method.acleda': 'ACLEDA',
    'method.wing': 'Wing',
    'method.other': 'ផ្សេងៗ',

    'category.venue': 'ទីកន្លែង',
    'category.food': 'ម្ហូបអាហារ និងភេសជ្ជៈ',
    'category.decoration': 'ការតុបតែងលម្អ',
    'category.attire': 'សម្លៀកបំពាក់ និងការតុបតែងខ្លួន',
    'category.photo': 'ថតរូប និងវីដេអូ',
    'category.music': 'តន្ត្រី និង MC',
    'category.invitation': 'សំបុត្រអញ្ជើញ',
    'category.transport': 'ការធ្វើដំណើរ',
    'category.ceremony': 'ពិធីប្រពៃណី',
    'category.other': 'ផ្សេងៗ',

    'type.wedding': 'មង្គលការ',
    'type.engagement': 'ភ្ជាប់ពាក្យ',
    'type.birthday': 'ខួបកំណើត',
    'type.housewarming': 'ឡើងផ្ទះថ្មី',
    'type.ceremony': 'ពិធីបុណ្យ',
    'type.other': 'ផ្សេងៗ',

    'common.add': 'បន្ថែម',
    'common.edit': 'កែប្រែ',
    'common.delete': 'លុប',
    'common.save': 'រក្សាទុក',
    'common.cancel': 'បោះបង់',
    'common.search': 'ស្វែងរក…',
    'common.all': 'ទាំងអស់',
    'common.total': 'សរុប',
    'common.no_records': 'មិនទាន់មានទិន្នន័យ',
    'common.note': 'កំណត់ចំណាំ',
    'common.confirm_delete': 'តើអ្នកប្រាកដថាចង់លុបមែនទេ?',
    'common.confirm_delete_hint': 'សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។',

    'events.title': 'កម្មវិធីរបស់ខ្ញុំ',
    'events.subtitle': 'រៀបចំរាល់ពិធីរបស់អ្នកនៅកន្លែងតែមួយ',
    'events.new': 'បង្កើតកម្មវិធីថ្មី',
    'events.empty': 'អ្នកមិនទាន់មានកម្មវិធីនៅឡើយទេ។ បង្កើតកម្មវិធីដំបូងដើម្បីចាប់ផ្តើម។',
    'events.guests_count': 'ភ្ញៀវ :count នាក់',
    'events.open': 'បើក',

    'event.name': 'ឈ្មោះកម្មវិធី',
    'event.type': 'ប្រភេទកម្មវិធី',
    'event.groom': 'កូនប្រុស',
    'event.bride': 'កូនស្រី',
    'event.date': 'កាលបរិច្ឆេទ',
    'event.venue': 'ទីកន្លែង',
    'event.rate': 'អត្រាប្តូរប្រាក់ (1 USD = ? KHR)',
    'event.budget': 'ថវិកា (USD)',
    'event.description': 'ការពិពណ៌នា',
    'event.delete': 'លុបកម្មវិធី',
    'event.days_left': 'នៅសល់ :count ថ្ងៃទៀត',
    'event.today': 'ថ្ងៃនេះ!',
    'event.passed': 'កម្មវិធីបានកន្លងផុតហើយ',

    'guest.name': 'ឈ្មោះ',
    'guest.phone': 'លេខទូរស័ព្ទ',
    'guest.side': 'ខាង',
    'guest.group': 'ក្រុម',
    'guest.status': 'ស្ថានភាព',
    'guest.party': 'ចំនួនមនុស្ស',
    'guest.gift': 'ចំណងដៃ',
    'guest.add': 'បន្ថែមភ្ញៀវ',
    'guest.edit': 'កែប្រែភ្ញៀវ',

    'gift.giver': 'ឈ្មោះអ្នកចងដៃ',
    'gift.guest': 'ភ្ជាប់ជាមួយភ្ញៀវ',
    'gift.none': 'គ្មាន',
    'gift.usd': 'ចំនួនទឹកប្រាក់ (USD)',
    'gift.khr': 'ចំនួនទឹកប្រាក់ (KHR)',
    'gift.method': 'វិធីទូទាត់',
    'gift.add': 'បន្ថែមចំណងដៃ',
    'gift.edit': 'កែប្រែចំណងដៃ',
    'gift.total_usd': 'ទទួលបានជាដុល្លារ',
    'gift.total_khr': 'ទទួលបានជាប្រាក់រៀល',
    'gift.total_all': 'សរុប (បម្លែងជាដុល្លារ)',

    'expense.title': 'មុខចំណាយ',
    'expense.category': 'ប្រភេទ',
    'expense.vendor': 'អ្នកផ្គត់ផ្គង់',
    'expense.estimated': 'ប៉ាន់ស្មាន',
    'expense.actual': 'ពិតប្រាកដ',
    'expense.paid': 'បានបង់',
    'expense.unpaid': 'មិនទាន់បង់',
    'expense.add': 'បន្ថែមចំណាយ',
    'expense.edit': 'កែប្រែចំណាយ',
    'expense.remaining': 'ថវិកានៅសល់',
    'expense.budget': 'ថវិកា',

    'task.title': 'ការងារ',
    'task.due': 'ថ្ងៃកំណត់',
    'task.add': 'បន្ថែមការងារ',
    'task.progress': 'បានបញ្ចប់ :done ក្នុងចំណោម :total',
    'task.placeholder': 'ឧ. កក់ទីកន្លែងរៀបការ',

    'toast.saved': 'បានរក្សាទុក',
    'toast.deleted': 'បានលុប',
    'toast.event_created': 'បានបង្កើតកម្មវិធី',

    'welcome.tagline': 'កម្មវិធីរៀបចំមង្គលការ និងពិធីផ្សេងៗ',
    'welcome.title': 'រៀបចំថ្ងៃពិសេសរបស់អ្នក ដោយគ្មានភាពតានតឹង',
    'welcome.subtitle':
        'បញ្ជីភ្ញៀវ ចំណងដៃជាដុល្លារ និងរៀល ថវិកា និងបញ្ជីការងារ — អ្វីៗទាំងអស់សម្រាប់មង្គលការ ឬពិធីរបស់អ្នក នៅក្នុងផ្ទាំងគ្រប់គ្រងតែមួយ។',
    'welcome.start': 'ចាប់ផ្តើមដោយឥតគិតថ្លៃ',
    'welcome.login': 'ចូលគណនី',
    'welcome.register': 'ចុះឈ្មោះ',
    'welcome.dashboard': 'ទៅកាន់ផ្ទាំងគ្រប់គ្រង',
    'welcome.f1': 'បញ្ជីភ្ញៀវ និងការឆ្លើយតប',
    'welcome.f1d': 'តាមដានអ្នកដែលបានអញ្ជើញ អ្នកបញ្ជាក់ចូលរួម និងចំនួនមនុស្សសរុប។',
    'welcome.f2': 'ចំណងដៃជា USD និង KHR',
    'welcome.f2d': 'កត់ត្រាស្រោមសំបុត្រនីមួយៗ ជាមួយអត្រាប្តូរប្រាក់ផ្ទាល់ខ្លួន។',
    'welcome.f3': 'ថវិកា និងការចំណាយ',
    'welcome.f3d': 'ប្រៀបធៀបការចំណាយប៉ាន់ស្មាន និងពិតប្រាកដ ហើយមើលចំនេញ ឬខាត។',
    'welcome.f4': 'បញ្ជីការងាររៀបចំ',
    'welcome.f4d': 'កុំភ្លេចការងារណាមួយ ជាមួយថ្ងៃកំណត់ និងការតាមដានវឌ្ឍនភាព។',
};

export type Locale = 'km' | 'en';

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { km, en };
const STORAGE_KEY = 'locale';
const listeners = new Set<() => void>();

function readStoredLocale(): Locale {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        return stored === 'en' ? 'en' : 'km';
    } catch {
        return 'km';
    }
}

let currentLocale: Locale =
    typeof window === 'undefined' ? 'km' : readStoredLocale();

export function getLocale(): Locale {
    return currentLocale;
}

export function setLocale(locale: Locale): void {
    currentLocale = locale;

    try {
        localStorage.setItem(STORAGE_KEY, locale);
    } catch {
        // Storage may be unavailable (private mode); the choice still applies for this visit.
    }

    document.documentElement.lang = locale;
    listeners.forEach((listener) => listener());
}

export function initializeLocale(): void {
    document.documentElement.lang = currentLocale;
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

export function translate(
    key: string,
    replacements: Record<string, string | number> = {},
    locale: Locale = currentLocale,
): string {
    const dictionary = dictionaries[locale];
    let line: string =
        dictionary[key as TranslationKey] ?? en[key as TranslationKey] ?? key;

    for (const [name, value] of Object.entries(replacements)) {
        line = line.replaceAll(`:${name}`, String(value));
    }

    return line;
}

export function useLocale(): Locale {
    return useSyncExternalStore(subscribe, getLocale, () => 'km');
}

export function useTranslation() {
    const locale = useLocale();

    const t = useCallback(
        (key: TranslationKey, replacements?: Record<string, string | number>) =>
            translate(key, replacements, locale),
        [locale],
    );

    return { t, locale, setLocale };
}
