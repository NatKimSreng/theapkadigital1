import { CalendarDays, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type {
    InvitationLang,
    InvitationMedia,
    InvitationSettings,
} from '@/types';
import type { Motion } from './animations';
import {
    FallingLayer,
    OPENING_DURATION,
    OpeningOverlay,
    Reveal,
    Rise,
} from './animations';
import { Ornament } from './ornaments';
import { PaperLayout } from './paper-layout';
import {
    AgendaList,
    Countdown,
    DetailRow,
    Gallery,
    GiftSection,
    MapButton,
    MusicButton,
    ParentsBlock,
    ScrollHint,
    TextPanel,
} from './parts';
import type { InvitationEvent, ResolvedInvitation } from './resolve';
import {
    BODY_FONT,
    TITLE_FONT,
    backgroundStyle,
    headlineStyle,
    resolveInvitation,
} from './resolve';
import type { TemplateDefinition } from './templates';
import { cn } from '@/lib/utils';

type Props = {
    template: TemplateDefinition;
    settings: InvitationSettings;
    media: InvitationMedia;
    event: InvitationEvent;
    lang: InvitationLang;
    guestName?: string | null;
    compact?: boolean;
    gate?: boolean;
};

export type LayoutProps = {
    data: ResolvedInvitation;
    media: InvitationMedia;
    guestName: string;
    compact: boolean;
    autoStartMusic: boolean;
    motion: Motion;
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
}: Props) {
    const [phase, setPhase] = useState<Phase>(gate ? 'closed' : 'open');
    const data = resolveInvitation(template, settings, event, lang);
    const name = guestName || data.guestName;
    const Layout = template.layout === 'paper' ? PaperLayout : ClassicLayout;

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
            <Layout
                data={data}
                media={media}
                guestName={name}
                compact={compact}
                autoStartMusic={gate && phase !== 'closed'}
                motion={motion}
            />
            {phase !== 'open' && (
                <OpeningOverlay
                    style={data.opening}
                    data={data}
                    media={media}
                    guestName={name}
                    opening={phase === 'opening'}
                    paper={template.layout === 'paper'}
                    onOpen={() => setPhase('opening')}
                />
            )}
        </div>
    );
}

function ClassicLayout({
    data,
    media,
    guestName,
    compact,
    autoStartMusic,
    motion,
}: LayoutProps) {
    const details = useRef<HTMLDivElement>(null);
    const { theme, copy, primary, secondary } = data;
    const photos = media.gallery;
    const titleStyle = {
        ...headlineStyle(data, primary),
        fontFamily: TITLE_FONT,
    };

    const heading = (text: string) => (
        <h2 className="text-[19px] leading-[1.9]" style={titleStyle}>
            {text}
        </h2>
    );

    return (
        <div
            className="relative w-full overflow-hidden"
            style={{
                ...backgroundStyle(data, media),
                color: theme.text,
                fontFamily: BODY_FONT,
            }}
        >
            {media.music && !compact && (
                <MusicButton src={media.music} autoStart={autoStartMusic} />
            )}

            <section className="relative flex min-h-[640px] flex-col items-center px-6 pt-12 pb-8 text-center">
                {theme.ornament === 'frame' && (
                    <div
                        className="pointer-events-none absolute inset-3 rounded-sm border-2"
                        style={{ borderColor: `${primary}88` }}
                    />
                )}

                <Rise motion={motion} step={0}>
                    <h1
                        className="text-[28px] leading-[1.7]"
                        style={titleStyle}
                    >
                        {data.title}
                    </h1>
                </Rise>

                {!data.hideHosts && data.hostLeft && (
                    <Rise
                        motion={motion}
                        step={1}
                        className="mt-5 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2"
                    >
                        <p
                            className="text-[17px] leading-[1.8] break-words"
                            style={{
                                ...titleStyle,
                                gridColumn: data.hostRight
                                    ? undefined
                                    : '1 / -1',
                            }}
                        >
                            {data.hostLeft}
                        </p>
                        {data.hostRight && (
                            <>
                                <span
                                    className="text-sm"
                                    style={{ color: secondary }}
                                >
                                    {data.joiner}
                                </span>
                                <p
                                    className="text-[17px] leading-[1.8] break-words"
                                    style={titleStyle}
                                >
                                    {data.hostRight}
                                </p>
                            </>
                        )}
                    </Rise>
                )}

                <Rise
                    motion={motion}
                    step={2}
                    className="my-6 flex flex-1 items-center justify-center"
                >
                    {media.cover ? (
                        <img
                            src={media.cover}
                            alt=""
                            className="max-h-64 w-full rounded-2xl object-cover shadow-lg"
                        />
                    ) : (
                        <Ornament
                            type={theme.ornament}
                            primary={primary}
                            secondary={secondary}
                            className={cn(
                                'h-48 w-48',
                                motion !== 'static' && 'inv-float',
                            )}
                        />
                    )}
                </Rise>

                <Rise motion={motion} step={3}>
                    <p className="text-[17px] leading-[1.8]" style={titleStyle}>
                        {data.inviteLine}
                    </p>
                </Rise>

                <Rise motion={motion} step={4} className="mt-3 w-full">
                    <div
                        className="rounded-full border-2 px-5 py-2.5 shadow-md"
                        style={{
                            borderColor: primary,
                            background: theme.panel,
                        }}
                    >
                        <p
                            className="truncate text-[17px] leading-[1.9]"
                            style={titleStyle}
                        >
                            {guestName}
                        </p>
                    </div>
                </Rise>

                {data.dateText && (
                    <Rise motion={motion} step={5}>
                        <p
                            className="mt-4 text-[15px] font-semibold"
                            style={headlineStyle(data, secondary)}
                        >
                            {data.dateText}
                        </p>
                    </Rise>
                )}

                {!compact && (
                    <ScrollHint
                        label={copy.scrollDown}
                        showEnglish={data.lang === 'km'}
                        onClick={() =>
                            details.current?.scrollIntoView({
                                behavior: 'smooth',
                            })
                        }
                    />
                )}
            </section>

            {!compact && (
                <div
                    ref={details}
                    className="relative space-y-10 px-6 pt-4 pb-14 text-center"
                >
                    <Section motion={motion}>
                        {heading(data.messageTitle)}
                        <ParentsBlock data={data} />
                        <TextPanel background={theme.panel}>
                            {data.message}
                        </TextPanel>
                        {data.dateText && (
                            <DetailRow
                                icon={<CalendarDays className="size-5" />}
                                color={primary}
                                panel={theme.panel}
                                text={
                                    data.eventTime
                                        ? `${data.dateText} · ${data.timeText}`
                                        : data.dateText
                                }
                            />
                        )}
                        {data.venueText && (
                            <DetailRow
                                icon={<MapPin className="size-5" />}
                                color={primary}
                                panel={theme.panel}
                                text={data.venueText}
                            />
                        )}
                    </Section>

                    {data.showCountdown && (
                        <Section motion={motion}>
                            {heading(copy.countdown)}
                            <Countdown data={data} />
                        </Section>
                    )}

                    {data.agenda.length > 0 && (
                        <Section motion={motion}>
                            {heading(copy.agenda)}
                            <AgendaList data={data} />
                        </Section>
                    )}

                    {(media.map || data.mapHref) && (
                        <Section motion={motion}>
                            {heading(copy.location)}
                            {media.map && (
                                <img
                                    src={media.map}
                                    alt={copy.location}
                                    className="w-full rounded-2xl shadow-sm"
                                />
                            )}
                            {data.mapHref && <MapButton data={data} />}
                        </Section>
                    )}

                    {photos.length > 0 && (
                        <Section motion={motion}>
                            {heading(copy.gallery)}
                            <Gallery photos={photos} />
                        </Section>
                    )}

                    {(media.khqr_usd ||
                        media.khqr_khr ||
                        data.gift.usd?.number ||
                        data.gift.khr?.number) && (
                        <Section motion={motion}>
                            {heading(copy.gift)}
                            <GiftSection data={data} media={media} />
                        </Section>
                    )}

                    <Section motion={motion}>
                        {heading(data.thanksTitle)}
                        <TextPanel background={theme.panel}>
                            {data.thanks}
                        </TextPanel>
                        <div className="flex justify-center pt-2">
                            <Ornament
                                type={theme.ornament}
                                primary={primary}
                                secondary={secondary}
                                className="h-16 w-16 opacity-80"
                            />
                        </div>
                    </Section>
                </div>
            )}
        </div>
    );
}

function Section({
    motion,
    children,
}: {
    motion: Motion;
    children: ReactNode;
}) {
    return (
        <Reveal motion={motion}>
            <section className="space-y-4">{children}</section>
        </Reveal>
    );
}
