import type { InvitationMedia, InvitationSettings } from '@/types';
import type { InvitationEvent } from './resolve';
import { emptyMedia } from './resolve';
import type { TemplateCategory, TemplateDefinition } from './templates';

/**
 * Sample content that fills template previews (catalog, home page, demo
 * pages) so every section of a design is visible before the couple adds
 * their own details.
 */
export const DEMO_PHOTOS = [
    '/images/demo/couple-1.webp',
    '/images/demo/couple-2.webp',
    '/images/demo/couple-3.webp',
    '/images/demo/couple-4.webp',
];

type Hosts = {
    km: { left: string; right: string };
    en: { left: string; right: string };
};

const HOSTS: Record<TemplateCategory, Hosts> = {
    wedding: {
        km: { left: 'សុខ វិសាល', right: 'ចាន់ ស្រីនិច' },
        en: { left: 'Sok Visal', right: 'Chan Sreynich' },
    },
    engagement: {
        km: { left: 'ហេង រតនា', right: 'លី សុភា' },
        en: { left: 'Heng Rathana', right: 'Ly Sophea' },
    },
    birthday: {
        km: { left: 'កញ្ញា ស្រីពេជ្រ', right: '' },
        en: { left: 'Sreypich', right: '' },
    },
    housewarming: {
        km: { left: 'គ្រួសារ លោក សុខ ចន្ទ្រា', right: '' },
        en: { left: 'The Sok Chantrea family', right: '' },
    },
    anniversary: {
        km: { left: 'សុខ វិសាល', right: 'ចាន់ ស្រីនិច' },
        en: { left: 'Sok Visal', right: 'Chan Sreynich' },
    },
};

function demoDate(): string {
    // Always about seven weeks ahead, so the countdown shows every unit.
    const date = new Date();
    date.setDate(date.getDate() + 49);

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
}

export function demoEvent(template: TemplateDefinition): InvitationEvent {
    const hosts = HOSTS[template.category];

    return {
        name: hosts.km.left,
        groom_name: hosts.km.left,
        bride_name: hosts.km.right || null,
        event_date: demoDate(),
        venue: 'សណ្ឋាគារ សុខា សៀមរាប, ខេត្តសៀមរាប',
    };
}

export function demoSettings(template: TemplateDefinition): InvitationSettings {
    const hosts = HOSTS[template.category];
    const couple = hosts.km.right !== '';

    return {
        languages: 'both',
        language: 'km',
        event_time: '17:00',
        show_countdown: true,
        texts: {
            km: {
                host_left: hosts.km.left,
                host_right: hosts.km.right,
                venue_text: 'សណ្ឋាគារ សុខា សៀមរាប, ខេត្តសៀមរាប',
                ...(couple
                    ? {
                          groom_parents: 'លោក សុខ ចន្ទ្រា\nលោកស្រី ម៉ៅ សុភាព',
                          bride_parents: 'លោក ចាន់ វណ្ណា\nលោកស្រី លឹម ស្រីមុំ',
                      }
                    : {}),
            },
            en: {
                host_left: hosts.en.left,
                host_right: hosts.en.right,
                venue_text: 'Sokha Siem Reap Resort, Siem Reap',
                ...(couple
                    ? {
                          groom_parents: 'Mr. Sok Chantrea\nMrs. Mao Sopheap',
                          bride_parents: 'Mr. Chan Vanna\nMrs. Lim Sreymom',
                      }
                    : {}),
            },
        },
        agenda: couple
            ? [
                  { time: '07:00', km: 'ពិធីហែជំនូន', en: 'Dowry procession' },
                  {
                      time: '09:00',
                      km: 'ពិធីកាត់សក់',
                      en: 'Hair-cutting ceremony',
                  },
                  { time: '11:00', km: 'ពិធីសំពះផ្ទឹម', en: 'Blessing ceremony' },
                  { time: '17:00', km: 'ពិធីជប់លៀង', en: 'Reception dinner' },
              ]
            : [
                  { time: '17:00', km: 'ទទួលភ្ញៀវ', en: 'Welcome guests' },
                  { time: '18:00', km: 'កម្មវិធីអបអរសាទរ', en: 'Celebration' },
                  { time: '19:00', km: 'អាហារពេលល្ងាច', en: 'Dinner' },
              ],
        gift: {
            usd: { name: 'SOK VISAL', number: '000 123 456' },
            khr: { name: 'CHAN SREYNICH', number: '000 654 321' },
        },
    };
}

export function demoMedia(template: TemplateDefinition): InvitationMedia {
    const lead = template.demoPhoto ?? 0;

    return {
        ...emptyMedia(),
        cover: DEMO_PHOTOS[lead],
        // Start the gallery after the cover photo so it doesn't repeat first.
        gallery: [
            ...DEMO_PHOTOS.slice(lead + 1),
            ...DEMO_PHOTOS.slice(0, lead + 1),
        ],
    };
}

/**
 * Crop anchors for the sample photos, so the couple stays in frame.
 */
export const DEMO_FOCUS: Record<string, string> = {
    '/images/demo/couple-1.webp': '72% center',
    '/images/demo/couple-2.webp': '50% center',
    '/images/demo/couple-3.webp': '50% center',
    '/images/demo/couple-4.webp': '42% center',
};
