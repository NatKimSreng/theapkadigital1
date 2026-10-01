import { CalendarDays, CalendarPlus, MapPin } from 'lucide-react';
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
    OpeningOverlay,
    openingDuration,
    Reveal,
    Rise,
} from './animations';
import { COVERS } from './covers';
import { HeroPhoto, photoFocus } from './heroes';
import { SectionMotif } from './motifs';
import { Ornament } from './ornaments';
import { PaperLayout } from './paper-layout';
import {
    AgendaList,
    Countdown,
    DaysToGo,
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
import type { RsvpConfig } from './rsvp';
import { RsvpForm } from './rsvp';
import {
    BODY_FONT,
    SCRIPT_FONT,
    TITLE_FONT,
    backgroundStyle,
    calendarUrl,
    headlineStyle,
    resolveInvitation,
} from './resolve';
import type { TemplateDefinition } from './templates';
import { textureLayer } from './textures';
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
    const Layout = template.layout === 'paper' ? PaperLayout : ClassicLayout;

    useEffect(() => {
        if (phase !== 'opening') {
            return;
        }

        const timer = window.setTimeout(
            () => setPhase('open'),
            openingDuration(data.opening),
        );

        return () => window.clearTimeout(timer);
    }, [phase, data.opening]);

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
                rsvp={rsvp}
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
    rsvp,
}: LayoutProps) {
    const details = useRef<HTMLDivElement>(null);
    const { theme, copy, primary, secondary } = data;
    const photos = media.gallery;
    const calendar = calendarUrl(data);
    const titleStyle = {
        ...headlineStyle(data, primary),
        fontFamily: TITLE_FONT,
    };

    const motif = theme.motif && (
        <SectionMotif
            motif={theme.motif}
            primary={primary}
            secondary={secondary}
        />
    );

    // English names read best in script, as on Paper Frame.
    const nameStyle =
        data.lang === 'en'
            ? { ...headlineStyle(data, primary), fontFamily: SCRIPT_FONT }
            : titleStyle;
    const nameClass =
        data.lang === 'en'
            ? 'text-[30px] leading-tight break-words'
            : 'text-[17px] leading-[1.8] break-words';

    const hero = theme.hero ?? 'framed';
    const CustomCover = COVERS[hero];
    const cinematic = hero === 'cinematic';
    const fullbleed = hero === 'fullbleed' || cinematic;
    const split = hero === 'split';

    const titleBlock = (
        <Rise motion={motion} step={0}>
            <h1 className="text-[28px] leading-[1.7]" style={titleStyle}>
                {data.title}
            </h1>
            {motif && <div className="mt-1">{motif}</div>}
        </Rise>
    );

    const hosts = !data.hideHosts && data.hostLeft && (
        <Rise
            motion={motion}
            step={1}
            className="mt-5 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2"
        >
            <p
                className={nameClass}
                style={{
                    ...nameStyle,
                    gridColumn: data.hostRight ? undefined : '1 / -1',
                }}
            >
                {data.hostLeft}
            </p>
            {data.hostRight && (
                <>
                    <span className="text-sm" style={{ color: secondary }}>
                        {data.joiner}
                    </span>
                    <p className={nameClass} style={nameStyle}>
                        {data.hostRight}
                    </p>
                </>
            )}
        </Rise>
    );

    const heading = (text: string) => (
        <div className="space-y-1.5">
            {motif}
            <h2 className="text-[19px] leading-[1.9]" style={titleStyle}>
                {text}
            </h2>
        </div>
    );

    const background = backgroundStyle(data, media);
    const textured =
        theme.texture && !media.background
            ? {
                  background: `${textureLayer(theme.texture, secondary)}, ${theme.background}`,
              }
            : background;

    return (
        <div
            className="relative w-full overflow-hidden"
            style={{
                ...textured,
                color: theme.text,
                fontFamily: BODY_FONT,
            }}
        >
            {media.music && !compact && (
                <MusicButton src={media.music} autoStart={autoStartMusic} />
            )}

            {CustomCover ? (
                <CustomCover
                    data={data}
                    media={media}
                    guestName={guestName}
                    motion={motion}
                    onScrollDown={
                        compact
                            ? undefined
                            : () =>
                                  details.current?.scrollIntoView({
                                      behavior: 'smooth',
                                  })
                    }
                />
            ) : (
                <section
                    className={cn(
                        'relative flex flex-col items-center px-6 pb-8 text-center',
                        fullbleed
                            ? cn(
                                  'pt-10',
                                  compact ? 'min-h-[480px]' : 'min-h-[720px]',
                              )
                            : 'min-h-[640px] pt-12',
                    )}
                >
                    {fullbleed && media.cover && (
                        <>
                            <img
                                src={media.cover}
                                alt=""
                                className="absolute inset-0 size-full object-cover"
                                style={photoFocus(media.cover)}
                            />
                            <div
                                aria-hidden
                                className="absolute inset-0"
                                style={{
                                    background: cinematic
                                        ? 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 38%, rgba(10,8,6,0.75) 66%, #0d0b08 100%)'
                                        : (theme.overlay ??
                                          'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.1) 48%, rgba(0,0,0,0.72) 78%, rgba(0,0,0,0.88) 100%)'),
                                }}
                            />
                            {cinematic && (
                                <div
                                    aria-hidden
                                    className="absolute inset-x-0 top-0 h-12 bg-black"
                                />
                            )}
                        </>
                    )}

                    {split && media.cover && (
                        <div className="-mx-6 -mt-12 mb-6 self-stretch">
                            <img
                                src={media.cover}
                                alt=""
                                className="h-80 w-full object-cover"
                                style={{
                                    ...photoFocus(media.cover),
                                    maskImage:
                                        'linear-gradient(180deg, black 62%, transparent 100%)',
                                    WebkitMaskImage:
                                        'linear-gradient(180deg, black 62%, transparent 100%)',
                                }}
                            />
                        </div>
                    )}

                    {theme.ornament === 'frame' && (
                        <div
                            className="pointer-events-none absolute inset-3 z-10 rounded-sm border-2"
                            style={{ borderColor: `${primary}88` }}
                        />
                    )}

                    <div className="relative z-10 flex w-full flex-1 flex-col items-center">
                        {!(cinematic && media.cover) && titleBlock}

                        {fullbleed && media.cover ? (
                            <>
                                <div className="flex-1" />
                                {cinematic && titleBlock}
                            </>
                        ) : (
                            <>
                                {hosts}
                                {!split && (
                                    <Rise
                                        motion={motion}
                                        step={2}
                                        className="my-6 flex flex-1 items-center justify-center"
                                    >
                                        <HeroPhoto
                                            style={hero}
                                            src={media.cover}
                                            data={data}
                                            motion={motion}
                                        />
                                    </Rise>
                                )}
                            </>
                        )}

                        {fullbleed && media.cover && hosts}

                        <Rise
                            motion={motion}
                            step={3}
                            className={split ? 'mt-5' : ''}
                        >
                            <p
                                className="text-[17px] leading-[1.8]"
                                style={titleStyle}
                            >
                                {data.inviteLine}
                            </p>
                        </Rise>

                        <Rise motion={motion} step={4} className="mt-3 w-full">
                            <div
                                className="rounded-full border-2 px-5 py-2.5 shadow-md backdrop-blur-sm"
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

                        <Rise motion={motion} step={6}>
                            <DaysToGo data={data} className="mt-3" />
                        </Rise>

                        {!compact && (
                            <ScrollHint
                                label={copy.scrollDown}
                                showEnglish={
                                    data.lang === 'km' && data.bilingual
                                }
                                onClick={() =>
                                    details.current?.scrollIntoView({
                                        behavior: 'smooth',
                                    })
                                }
                            />
                        )}
                    </div>
                </section>
            )}

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
                            {calendar && (
                                <a
                                    href={calendar}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] font-semibold shadow-sm"
                                    style={{
                                        borderColor: primary,
                                        color: primary,
                                        background: theme.panel,
                                    }}
                                >
                                    <CalendarPlus className="size-4" />
                                    {copy.reminder}
                                </a>
                            )}
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
                        {heading(copy.rsvpTitle)}
                        <RsvpForm data={data} rsvp={rsvp} />
                    </Section>

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
