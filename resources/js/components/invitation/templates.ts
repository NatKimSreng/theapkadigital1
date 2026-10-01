import type { TranslationKey } from '@/lib/i18n';
import type { InvitationLang } from '@/types';
import type { Motif } from './motifs';
import type { Texture } from './textures';

export type TemplateCategory =
    | 'wedding'
    | 'engagement'
    | 'birthday'
    | 'housewarming'
    | 'anniversary';

export type Ornament = 'frame' | 'rings' | 'balloons' | 'house' | 'hearts';

/**
 * How the cover shows the couple's photo; each design uses its own.
 */
export type HeroStyle =
    | 'garden'
    | 'kbach'
    | 'velvet'
    | 'editorial'
    | 'prasat'
    | 'foil'
    | 'fullbleed'
    | 'cinematic'
    | 'split'
    | 'arch'
    | 'polaroid'
    | 'circle'
    | 'framed';

export type TemplateDefinition = {
    key: string;
    category: TemplateCategory;
    name: TranslationKey;
    free: boolean;
    layout?: 'classic' | 'paper';
    /** Which sample photo leads this design's previews. */
    demoPhoto?: number;
    theme?: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
        panel: string;
        ornament: Ornament;
        hero?: HeroStyle;
        /** Tint over a full-screen cover photo, top to bottom. */
        overlay?: string;
        /** The design's own background texture and section ornament. */
        texture?: Texture;
        motif?: Motif;
        /** Gold-foil headings unless the couple turns them off. */
        gold?: boolean;
        /** Wax seal colour (seal opening and seal-bearing covers). */
        seal?: string;
        /** Envelope paper colour for the seal opening. */
        envelope?: string;
        opening:
            | 'doors'
            | 'envelope'
            | 'curtain'
            | 'fade'
            | 'seal'
            | 'card'
            | 'fold';
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
        demoPhoto: 0,
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
        demoPhoto: 3,
        theme: {
            primary: '#f5d78e',
            secondary: '#fff4d6',
            background:
                'radial-gradient(circle at 50% 18%, #8b1a2b 0%, #5a0f1c 55%, #3b0913 100%)',
            text: '#fbe9d0',
            panel: 'rgba(0, 0, 0, 0.22)',
            ornament: 'frame',
            hero: 'fullbleed',
            texture: 'damask',
            motif: 'diamond',
            overlay:
                'linear-gradient(180deg, rgba(90,15,28,0.8) 0%, rgba(90,15,28,0.2) 30%, rgba(59,9,19,0.15) 48%, rgba(59,9,19,0.82) 78%, #3b0913 100%)',
            opening: 'doors',
            effect: 'sparkles',
        },
    },
    {
        key: 'golden-engagement',
        category: 'engagement',
        name: 'template.golden-engagement',
        free: true,
        demoPhoto: 1,
        theme: {
            primary: '#f9af59',
            secondary: '#b08e4f',
            background:
                'radial-gradient(circle at 70% 30%, #ffffff 0%, #f7f1e6 45%, #ece0cb 100%)',
            text: '#6b5536',
            panel: 'rgba(255, 255, 255, 0.6)',
            ornament: 'rings',
            hero: 'arch',
            texture: 'shimmer',
            motif: 'rings',
            opening: 'envelope',
            effect: 'sparkles',
        },
    },
    {
        key: 'blossom-birthday',
        category: 'birthday',
        name: 'template.blossom-birthday',
        free: true,
        demoPhoto: 2,
        theme: {
            primary: '#e0567a',
            secondary: '#f4a261',
            background:
                'linear-gradient(180deg, #fff0f5 0%, #ffe4ec 55%, #fff7e6 100%)',
            text: '#7a3b4f',
            panel: 'rgba(255, 255, 255, 0.65)',
            ornament: 'balloons',
            hero: 'polaroid',
            texture: 'confetti',
            motif: 'bunting',
            opening: 'curtain',
            effect: 'hearts',
        },
    },
    {
        key: 'modern-housewarming',
        category: 'housewarming',
        name: 'template.modern-housewarming',
        free: true,
        demoPhoto: 2,
        theme: {
            primary: '#e9c46a',
            secondary: '#f4f1de',
            background: 'linear-gradient(180deg, #1d3557 0%, #264653 100%)',
            text: '#e8eef4',
            panel: 'rgba(255, 255, 255, 0.08)',
            ornament: 'house',
            hero: 'framed',
            texture: 'grid',
            motif: 'roof',
            opening: 'doors',
            effect: 'sparkles',
        },
    },
    {
        key: 'classic-anniversary',
        category: 'anniversary',
        name: 'template.classic-anniversary',
        free: false,
        demoPhoto: 1,
        theme: {
            primary: '#c9a227',
            secondary: '#7b2d3b',
            background: 'linear-gradient(180deg, #fdf6ec 0%, #f5e6d3 100%)',
            text: '#5b3a29',
            panel: 'rgba(255, 255, 255, 0.55)',
            ornament: 'hearts',
            hero: 'circle',
            texture: 'linen',
            motif: 'vine',
            opening: 'envelope',
            effect: 'hearts',
        },
    },
    {
        key: 'blush-garden',
        category: 'wedding',
        name: 'template.blush-garden',
        free: false,
        demoPhoto: 1,
        theme: {
            primary: '#b8862b',
            secondary: '#d98ca0',
            background:
                'linear-gradient(180deg, #fdeef0 0%, #fbe6e8 50%, #fdf3ee 100%)',
            text: '#7a5a3a',
            panel: 'rgba(255, 255, 255, 0.72)',
            ornament: 'hearts',
            hero: 'garden',
            texture: 'watercolor',
            motif: 'bloom',
            gold: true,
            opening: 'fade',
            effect: 'petals',
        },
    },
    {
        key: 'kbach-royal',
        category: 'wedding',
        name: 'template.kbach-royal',
        free: true,
        demoPhoto: 1,
        theme: {
            primary: '#e9c46a',
            secondary: '#f6dfa0',
            background:
                'radial-gradient(ellipse at 50% 28%, #a3192d 0%, #6e0f1d 52%, #3d0710 100%)',
            text: '#fbe9d0',
            panel: 'rgba(0, 0, 0, 0.24)',
            ornament: 'frame',
            hero: 'kbach',
            texture: 'velvet',
            motif: 'kbach',
            gold: true,
            seal: '#caa04a',
            envelope: '#7c1323',
            opening: 'seal',
            effect: 'sparkles',
        },
    },
    {
        key: 'emerald-velvet',
        category: 'wedding',
        name: 'template.emerald-velvet',
        free: false,
        demoPhoto: 3,
        theme: {
            primary: '#d9b45a',
            secondary: '#f1dfa6',
            background:
                'radial-gradient(ellipse at 50% 25%, #127056 0%, #0b4536 50%, #062a20 100%)',
            text: '#eef3ee',
            panel: 'rgba(255, 255, 255, 0.07)',
            ornament: 'rings',
            hero: 'velvet',
            texture: 'velvet',
            motif: 'sprig',
            gold: true,
            seal: '#c9a24a',
            envelope: '#0d4a38',
            opening: 'seal',
            effect: 'sparkles',
        },
    },
    {
        key: 'mocha-editorial',
        category: 'wedding',
        name: 'template.mocha-editorial',
        free: false,
        demoPhoto: 0,
        theme: {
            primary: '#7d5541',
            secondary: '#b5613f',
            background: 'linear-gradient(180deg, #f8f3ec 0%, #f2eadf 100%)',
            text: '#4a3a30',
            panel: 'rgba(255, 255, 255, 0.6)',
            ornament: 'rings',
            hero: 'editorial',
            texture: 'linen',
            motif: 'rule',
            seal: '#b5573a',
            envelope: '#e8dac6',
            opening: 'seal',
            effect: 'none',
        },
    },
    {
        key: 'golden-prasat',
        category: 'wedding',
        name: 'template.golden-prasat',
        free: false,
        demoPhoto: 1,
        theme: {
            primary: '#9a6b1f',
            secondary: '#b5562e',
            background:
                'radial-gradient(ellipse at 50% 18%, #fff6e2 0%, #f4e4c2 45%, #e8cf9f 100%)',
            text: '#4e3420',
            panel: 'rgba(255, 250, 240, 0.7)',
            ornament: 'frame',
            hero: 'prasat',
            texture: 'linen',
            motif: 'spires',
            gold: true,
            seal: '#c9a24a',
            envelope: '#7a2e1c',
            opening: 'card',
            effect: 'petals',
        },
    },
    {
        key: 'naga-gold',
        category: 'wedding',
        name: 'template.naga-gold',
        free: false,
        demoPhoto: 3,
        theme: {
            primary: '#d9b25c',
            secondary: '#f0d999',
            background:
                'radial-gradient(ellipse at 50% 28%, #5c4337 0%, #45312a 55%, #33241e 100%)',
            text: '#f3e6cf',
            panel: 'rgba(0, 0, 0, 0.2)',
            ornament: 'frame',
            hero: 'foil',
            texture: 'damask',
            motif: 'kbach',
            gold: true,
            seal: '#c9a24a',
            envelope: '#4a3429',
            opening: 'fold',
            effect: 'sparkles',
        },
    },
    {
        key: 'angkor-cinematic',
        category: 'wedding',
        name: 'template.angkor-cinematic',
        free: false,
        demoPhoto: 0,
        theme: {
            primary: '#e8c77a',
            secondary: '#f6e7c1',
            background: 'linear-gradient(180deg, #14110d 0%, #1f1a14 100%)',
            text: '#f3ead8',
            panel: 'rgba(255, 255, 255, 0.07)',
            ornament: 'frame',
            hero: 'cinematic',
            texture: 'grain',
            motif: 'spires',
            opening: 'curtain',
            effect: 'sparkles',
        },
    },
    {
        key: 'lotus-garden',
        category: 'wedding',
        name: 'template.lotus-garden',
        free: false,
        demoPhoto: 1,
        theme: {
            primary: '#b5557a',
            secondary: '#6f8f72',
            background:
                'linear-gradient(180deg, #fbf6f1 0%, #f6eee6 60%, #efe6dc 100%)',
            text: '#4d3a36',
            panel: 'rgba(255, 255, 255, 0.72)',
            ornament: 'hearts',
            hero: 'split',
            texture: 'watercolor',
            motif: 'lotus',
            opening: 'envelope',
            effect: 'petals',
        },
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
    tapSeal: string;
    tapCard: string;
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
    todayShort: string;
    tomorrowOrSoon: string;
    daysToGo: string;
    passed: string;
    units: { day: string; hour: string; minute: string; second: string };
    rsvpTitle: string;
    rsvpQuestion: string;
    attending: string;
    declining: string;
    yourName: string;
    wishes: string;
    send: string;
    rsvpThanks: string;
    rsvpChange: string;
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
        tapSeal: 'ចុចលើត្រាដើម្បីបើកលិខិត',
        tapCard: 'ចុចដើម្បីបើកកាត',
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
        todayShort: 'ថ្ងៃនេះហើយ!',
        tomorrowOrSoon: 'ជិតដល់ហើយ!',
        daysToGo: 'នៅសល់ :count ថ្ងៃទៀត',
        passed: 'កម្មវិធីបានប្រព្រឹត្តទៅដោយជោគជ័យ។ សូមអរគុណចំពោះការចូលរួម និងពរជ័យ!',
        rsvpTitle: 'សារជូនពរ',
        rsvpQuestion: 'បញ្ជាក់ពីវត្តមានអ្នក',
        attending: 'ចូលរួម',
        declining: 'បដិសេធ',
        yourName: 'ឈ្មោះរបស់អ្នក',
        wishes: 'សារជូនពរ',
        send: 'ផ្ញើសារ',
        rsvpThanks: 'សូមអរគុណសម្រាប់ការឆ្លើយតប និងពាក្យជូនពររបស់អ្នក!',
        rsvpChange: 'កែប្រែចម្លើយ',
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
        tapSeal: 'Tap the seal to open',
        tapCard: 'Tap to open the card',
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
        todayShort: 'Today is the day!',
        tomorrowOrSoon: 'Almost here!',
        daysToGo: ':count days to go',
        passed: 'The celebration has taken place. Thank you for your love and blessings!',
        rsvpTitle: 'RSVP & Wishes',
        rsvpQuestion: 'Will you be joining us?',
        attending: 'Attending',
        declining: "Can't make it",
        yourName: 'Your name',
        wishes: 'Your wishes for us',
        send: 'Send',
        rsvpThanks: 'Thank you for your reply and your kind wishes!',
        rsvpChange: 'Change my reply',
        units: {
            day: 'Days',
            hour: 'Hours',
            minute: 'Minutes',
            second: 'Seconds',
        },
    },
};

export const SINGLE_HOST: TemplateCategory[] = ['birthday', 'housewarming'];
