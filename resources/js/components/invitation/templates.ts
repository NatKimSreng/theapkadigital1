import type { TranslationKey } from '@/lib/i18n';
import type { InvitationLang } from '@/types';

export type TemplateCategory =
    | 'wedding'
    | 'engagement'
    | 'birthday'
    | 'housewarming'
    | 'anniversary';

export type Ornament = 'frame' | 'rings' | 'balloons' | 'house' | 'hearts';

export type TemplateDefinition = {
    key: string;
    category: TemplateCategory;
    name: TranslationKey;
    free: boolean;
    layout?: 'classic' | 'paper';
    theme?: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
        panel: string;
        ornament: Ornament;
        opening: 'doors' | 'envelope' | 'curtain' | 'fade';
        effect: 'none' | 'petals' | 'sparkles' | 'hearts';
    };
};

// Watercolour-paper grain: embossed noise from an SVG lighting filter over soft white.
const PAPER_BACKGROUND = `url("data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch"/><feDiffuseLighting lighting-color="#ffffff" surfaceScale="1.6"><feDistantLight azimuth="45" elevation="60"/></feDiffuseLighting></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.55"/></svg>',
)}"), linear-gradient(180deg, #fbfbfa 0%, #f3f2f0 100%)`;

// Keys of designed templates must match Invitation::TEMPLATES on the server,
// and those marked free: false must match Invitation::PREMIUM_TEMPLATES.
export const TEMPLATES: TemplateDefinition[] = [
    {
        key: 'paper-frame',
        category: 'wedding',
        name: 'template.paper-frame',
        free: true,
        layout: 'paper',
        theme: {
            primary: '#7e6749',
            secondary: '#b09371',
            background: PAPER_BACKGROUND,
            text: '#8a755a',
            panel: 'rgba(255, 255, 255, 0.55)',
            ornament: 'rings',
            opening: 'doors',
            effect: 'petals',
        },
    },
    {
        key: 'royal-wedding',
        category: 'wedding',
        name: 'template.royal-wedding',
        free: false,
        theme: {
            primary: '#f5d78e',
            secondary: '#fff4d6',
            background:
                'radial-gradient(circle at 50% 18%, #8b1a2b 0%, #5a0f1c 55%, #3b0913 100%)',
            text: '#fbe9d0',
            panel: 'rgba(0, 0, 0, 0.22)',
            ornament: 'frame',
            opening: 'doors',
            effect: 'sparkles',
        },
    },
    {
        key: 'golden-engagement',
        category: 'engagement',
        name: 'template.golden-engagement',
        free: true,
        theme: {
            primary: '#f9af59',
            secondary: '#b08e4f',
            background:
                'radial-gradient(circle at 70% 30%, #ffffff 0%, #f7f1e6 45%, #ece0cb 100%)',
            text: '#6b5536',
            panel: 'rgba(255, 255, 255, 0.6)',
            ornament: 'rings',
            opening: 'envelope',
            effect: 'sparkles',
        },
    },
    {
        key: 'blossom-birthday',
        category: 'birthday',
        name: 'template.blossom-birthday',
        free: true,
        theme: {
            primary: '#e0567a',
            secondary: '#f4a261',
            background:
                'linear-gradient(180deg, #fff0f5 0%, #ffe4ec 55%, #fff7e6 100%)',
            text: '#7a3b4f',
            panel: 'rgba(255, 255, 255, 0.65)',
            ornament: 'balloons',
            opening: 'curtain',
            effect: 'hearts',
        },
    },
    {
        key: 'modern-housewarming',
        category: 'housewarming',
        name: 'template.modern-housewarming',
        free: true,
        theme: {
            primary: '#e9c46a',
            secondary: '#f4f1de',
            background: 'linear-gradient(180deg, #1d3557 0%, #264653 100%)',
            text: '#e8eef4',
            panel: 'rgba(255, 255, 255, 0.08)',
            ornament: 'house',
            opening: 'doors',
            effect: 'sparkles',
        },
    },
    {
        key: 'classic-anniversary',
        category: 'anniversary',
        name: 'template.classic-anniversary',
        free: false,
        theme: {
            primary: '#c9a227',
            secondary: '#7b2d3b',
            background: 'linear-gradient(180deg, #fdf6ec 0%, #f5e6d3 100%)',
            text: '#5b3a29',
            panel: 'rgba(255, 255, 255, 0.55)',
            ornament: 'hearts',
            opening: 'envelope',
            effect: 'hearts',
        },
    },
    {
        key: 'premium-folding',
        category: 'wedding',
        name: 'template.premium-folding',
        free: false,
    },
    {
        key: 'premium-multilingual',
        category: 'wedding',
        name: 'template.premium-multilingual',
        free: false,
    },
];

export function findTemplate(key: string): TemplateDefinition | undefined {
    return TEMPLATES.find((template) => template.key === key);
}

type Copy = {
    titles: Record<TemplateCategory, string>;
    messages: Record<TemplateCategory, string>;
    joiner: string;
    inviteLine: string;
    guestName: string;
    messageTitle: string;
    thanksTitle: string;
    thanks: string;
    agenda: string;
    location: string;
    openMap: string;
    gallery: string;
    gift: string;
    giftUsd: string;
    giftKhr: string;
    giftHint: string;
    accountName: string;
    accountNumber: string;
    sendGift: string;
    scrollDown: string;
    dear: string;
    openInvitation: string;
    weddingOf: string;
    saveDate: string;
    reminder: string;
    heldOn: string;
    from: string;
    groomParents: string;
    brideParents: string;
    groomLabel: string;
    brideLabel: string;
    countdown: string;
    today: string;
    units: { day: string; hour: string; minute: string; second: string };
};

export const COPY: Record<InvitationLang, Copy> = {
    km: {
        titles: {
            wedding: 'សិរីមង្គលអាពាហ៍ពិពាហ៍',
            engagement: 'ពិធីភ្ជាប់ពាក្យ',
            birthday: 'ពិធីខួបកំណើត',
            housewarming: 'ពិធីឡើងផ្ទះថ្មី',
            anniversary: 'ខួបអាពាហ៍ពិពាហ៍',
        },
        messages: {
            wedding:
                'សូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា អញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធិពរជ័យ សិរីសួស្តី ក្នុងពិធីអាពាហ៍ពិពាហ៍ កូនប្រុស កូនស្រី របស់យើងខ្ញុំ។',
            engagement:
                'សូមគោរពអញ្ជើញ លោក លោកស្រី អ្នកនាងកញ្ញា អញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយស ក្នុងពិធីភ្ជាប់ពាក្យ កូនប្រុស កូនស្រី របស់យើងខ្ញុំ។',
            birthday:
                'សូមគោរពអញ្ជើញ លោក លោកស្រី អ្នកនាងកញ្ញា ចូលរួមអបអរសាទរ ក្នុងពិធីខួបកំណើត ដើម្បីចែករំលែកក្តីរីករាយជាមួយគ្នា។',
            housewarming:
                'សូមគោរពអញ្ជើញ លោក លោកស្រី អ្នកនាងកញ្ញា ចូលរួមជាភ្ញៀវកិត្តិយស ក្នុងពិធីឡើងផ្ទះថ្មី ដើម្បីប្រសិទ្ធិពរជ័យ សិរីសួស្តី។',
            anniversary:
                'សូមគោរពអញ្ជើញ លោក លោកស្រី អ្នកនាងកញ្ញា ចូលរួមអបអរសាទរ ខួបអាពាហ៍ពិពាហ៍ របស់យើងខ្ញុំ។',
        },
        joiner: 'និង',
        inviteLine: 'សូមគោរពអញ្ជើញ',
        guestName: 'ភ្ញៀវកិត្តិយស',
        messageTitle: 'យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ',
        thanksTitle: 'សូមអរគុណ និងសូមអភ័យទោស',
        thanks: 'យើងខ្ញុំទាំងអស់គ្នា សូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅ ចំពោះវត្តមានដ៏ខ្ពង់ខ្ពស់របស់ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា។ សូមអភ័យទោស ប្រសិនបើមានការខ្វះខាតដោយអចេតនា។',
        agenda: 'របៀបវារៈកម្មវិធី',
        location: 'ទីតាំង',
        openMap: 'បើកផែនទី',
        gallery: 'វិចិត្រសាល',
        gift: 'ចំណងដៃឌីជីថល',
        giftUsd: 'ដុល្លារ ($)',
        giftKhr: 'រៀល (៛)',
        giftHint: 'ភ្ញៀវកិត្តិយសអាចចងចំណងដៃ ដោយគ្រាន់តែចុចប៊ូតុង ឬស្កែន QR code ខាងក្រោម',
        accountName: 'ម្ចាស់គណនី',
        accountNumber: 'លេខគណនី',
        sendGift: 'ចុចដើម្បីផ្ញើចំណងដៃ',
        scrollDown: 'សូមអូសចុះក្រោម',
        dear: 'សូមគោរពអញ្ជើញ',
        openInvitation: 'បើកលិខិត',
        weddingOf: 'សិរីមង្គលអាពាហ៍ពិពាហ៍',
        saveDate: 'ដែលនឹងប្រព្រឹត្តទៅនៅ',
        reminder: 'កត់ទុកក្នុងប្រតិទិន',
        heldOn: 'ដែលនឹងប្រព្រឹត្តទៅ',
        from: 'ចាប់ពីម៉ោង',
        groomParents: 'មាតាបិតាខាងកូនប្រុស',
        brideParents: 'មាតាបិតាខាងកូនស្រី',
        groomLabel: 'កូនប្រុសនាម',
        brideLabel: 'កូនស្រីនាម',
        countdown: 'ពេលវេលានៅសល់រហូតដល់ថ្ងៃកម្មវិធី',
        today: 'ថ្ងៃនេះគឺជាថ្ងៃពិសេសរបស់យើងខ្ញុំ',
        units: { day: 'ថ្ងៃ', hour: 'ម៉ោង', minute: 'នាទី', second: 'វិនាទី' },
    },
    en: {
        titles: {
            wedding: 'Wedding Ceremony',
            engagement: 'Engagement Ceremony',
            birthday: 'Birthday Celebration',
            housewarming: 'Housewarming Ceremony',
            anniversary: 'Wedding Anniversary',
        },
        messages: {
            wedding:
                'Together with our families, we request the honour of your presence at the wedding ceremony of our son and daughter.',
            engagement:
                'Together with our families, we request the honour of your presence at the engagement ceremony of our son and daughter.',
            birthday:
                'Please join us to celebrate this birthday and share the joy together.',
            housewarming:
                'Please join us as our honoured guest to bless our new home.',
            anniversary: 'Please join us to celebrate our wedding anniversary.',
        },
        joiner: '&',
        inviteLine: 'You are cordially invited',
        guestName: 'Honoured guest',
        messageTitle: 'With great honour, we invite you',
        thanksTitle: 'Thank you',
        thanks: 'We are deeply grateful for your presence and blessings. Please forgive any unintended shortcomings.',
        agenda: 'Programme',
        location: 'Location',
        openMap: 'Open map',
        gallery: 'Gallery',
        gift: 'Digital envelope',
        giftUsd: 'Dollar ($)',
        giftKhr: 'Riel (៛)',
        giftHint:
            'You can tap the button below or scan the QR code to send your gift.',
        accountName: 'Account name',
        accountNumber: 'Account number',
        sendGift: 'Tap to send',
        scrollDown: 'Scroll down',
        dear: 'Dear',
        openInvitation: 'Open invitation',
        weddingOf: 'The wedding of',
        saveDate: 'Save the date',
        reminder: 'Set a reminder',
        heldOn: 'Which will be held on',
        from: 'from',
        groomParents: 'Parents of the groom',
        brideParents: 'Parents of the bride',
        groomLabel: 'The groom',
        brideLabel: 'The bride',
        countdown: 'Countdown to the big day',
        today: 'Today is our special day',
        units: {
            day: 'Days',
            hour: 'Hours',
            minute: 'Minutes',
            second: 'Seconds',
        },
    },
};

export const SINGLE_HOST: TemplateCategory[] = ['birthday', 'housewarming'];
