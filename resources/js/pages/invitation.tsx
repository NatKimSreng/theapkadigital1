import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { InvitationCard } from '@/components/invitation/invitation-card';
import type { InvitationEvent } from '@/components/invitation/resolve';
import { resolveInvitation } from '@/components/invitation/resolve';
import type { RsvpConfig } from '@/components/invitation/rsvp';
import { findTemplate } from '@/components/invitation/templates';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import type {
    InvitationLang,
    InvitationMedia,
    InvitationSettings,
} from '@/types';

type Props = {
    event: InvitationEvent;
    invitation: {
        template: string;
        settings: InvitationSettings | null;
        media: InvitationMedia;
    };
    guestName: string | null;
    lang: InvitationLang | null;
    branding: boolean;
    rsvp: RsvpConfig;
};

export default function PublicInvitation({
    event,
    invitation,
    guestName,
    lang: requestedLang,
    branding,
    rsvp,
}: Props) {
    const settings = invitation.settings ?? {};
    const [lang, setLang] = useState<InvitationLang>(
        requestedLang ?? settings.language ?? 'km',
    );
    const template = findTemplate(invitation.template);

    if (!template?.theme) {
        return null;
    }

    const { title } = resolveInvitation(template, settings, event, lang);

    return (
        <>
            <Head title={title} />
            <div
                className={cn(
                    'min-h-svh',
                    template.layout === 'paper'
                        ? 'bg-stone-200'
                        : 'bg-neutral-900',
                )}
            >
                <main className="relative mx-auto min-h-svh max-w-[480px] shadow-2xl">
                    <div className="absolute top-3 left-3 z-20 flex overflow-hidden rounded-full bg-black/40 text-xs text-white backdrop-blur-sm">
                        {(['km', 'en'] as const).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setLang(option)}
                                className={cn(
                                    'px-3 py-1.5',
                                    lang === option && 'bg-white/25 font-bold',
                                )}
                            >
                                {option === 'km' ? 'ខ្មែរ' : 'EN'}
                            </button>
                        ))}
                    </div>
                    <InvitationCard
                        template={template}
                        settings={settings}
                        media={invitation.media}
                        event={event}
                        lang={lang}
                        guestName={guestName}
                        gate
                        rsvp={rsvp}
                    />
                    {branding && (
                        <a
                            href={home.url()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-black/85 py-2.5 text-center text-xs tracking-wide text-white/80 hover:text-white"
                        >
                            {lang === 'km'
                                ? 'បង្កើតដោយ Theapka'
                                : 'Made with Theapka'}
                        </a>
                    )}
                </main>
            </div>
        </>
    );
}
