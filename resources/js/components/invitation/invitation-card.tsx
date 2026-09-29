import { useEffect, useState } from 'react';
import type {
    InvitationLang,
    InvitationMedia,
    InvitationSettings,
} from '@/types';
import type { Motion } from './animations';
import { FallingLayer, OPENING_DURATION, OpeningOverlay } from './animations';
import { PaperLayout } from './paper-layout';
import type { InvitationEvent, ResolvedInvitation } from './resolve';
import { resolveInvitation } from './resolve';
import type { RsvpConfig } from './rsvp';
import type { TemplateDefinition } from './templates';

type Props = {
    template: TemplateDefinition;
    settings: InvitationSettings;
    media: InvitationMedia;
    event: InvitationEvent;
    lang: InvitationLang;
    guestName?: string | null;
    compact?: boolean;
    gate?: boolean;
    rsvp?: RsvpConfig;
};

export type LayoutProps = {
    data: ResolvedInvitation;
    media: InvitationMedia;
    guestName: string;
    compact: boolean;
    autoStartMusic: boolean;
    motion: Motion;
    rsvp?: RsvpConfig;
};

type Phase = 'closed' | 'opening' | 'open';

export function InvitationCard({
    template,
    settings,
    media,
    event,
    lang,
    guestName,
    compact = false,
    gate = false,
    rsvp,
}: Props) {
    const [phase, setPhase] = useState<Phase>(gate ? 'closed' : 'open');
    const data = resolveInvitation(template, settings, event, lang);
    const name = guestName || data.guestName;

    useEffect(() => {
        if (phase !== 'opening') {
            return;
        }

        const timer = window.setTimeout(
            () => setPhase('open'),
            OPENING_DURATION,
        );

        return () => window.clearTimeout(timer);
    }, [phase]);

    const motion: Motion = compact
        ? 'static'
        : phase === 'closed'
          ? 'waiting'
          : 'play';

    return (
        <div
            className="relative"
            style={
                phase === 'open'
                    ? undefined
                    : { height: 'max(640px, 100svh)', overflow: 'hidden' }
            }
        >
            {!compact && <FallingLayer effect={data.effect} />}
            <PaperLayout
                data={data}
                media={media}
                guestName={name}
                compact={compact}
                autoStartMusic={gate && phase !== 'closed'}
                motion={motion}
                rsvp={rsvp}
            />
            {phase !== 'open' && (
                <OpeningOverlay
                    style={data.opening}
                    data={data}
                    media={media}
                    guestName={name}
                    opening={phase === 'opening'}
                    paper
                    onOpen={() => setPhase('opening')}
                />
            )}
        </div>
    );
}
