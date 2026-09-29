import { CalendarPlus, ChevronsDown, MapPin } from 'lucide-react';
import { useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Motion } from './animations';
import { Reveal, Rise } from './animations';
import { BaroqueCorners, OrnateOvalFrame } from './baroque';
import type { LayoutProps } from './invitation-card';
import { HeroPhoto, photoFocus } from './heroes';
import { Ornament } from './ornaments';
import {
    Countdown,
    DaysToGo,
    Gallery,
    GiftSection,
    MusicButton,
    ParentsBlock,
} from './parts';
import type { ResolvedInvitation } from './resolve';
import { RsvpForm } from './rsvp';
import { cn } from '@/lib/utils';
import {
    BODY_FONT,
    SCRIPT_FONT,
    SERIF_FONT,
    TITLE_FONT,
    backgroundStyle,
    calendarUrl,
    headlineStyle,
} from './resolve';

/**
 * The invitation layout every template shares: baroque corner scrolls on
 * every section, script names, a save-the-date block and elegant cards.
 * Each template brings its own colours and way of showing the couple's
 * photo (gilded oval, arch, full-screen, poster and so on).
 */
export function PaperLayout({
    data,
    media,
    compact,
    autoStartMusic,
    motion,
    rsvp,
}: LayoutProps) {
    const details = useRef<HTMLDivElement>(null);
    const { copy, primary, secondary } = data;
    const panel = data.theme.panel;
    const hero = data.theme.hero ?? 'oval';
    const cinematic = hero === 'cinematic';
    const photoBackground =
        (hero === 'fullbleed' || cinematic) && media.cover !== null;
    const split = hero === 'split' && media.cover !== null;
    const english = data.lang === 'en';
    const calendar = calendarUrl(data);
    const hasGift =
        media.khqr_usd ||
        media.khqr_khr ||
        data.gift.usd?.number ||
        data.gift.khr?.number;

    const nameStyle: CSSProperties = {
        ...headlineStyle(data, primary),
        fontFamily: english ? SCRIPT_FONT : TITLE_FONT,
    };
    const nameClass = english
        ? 'text-[38px] leading-tight'
        : 'text-[20px] leading-[1.9]';

    return (
        <div
            className="relative w-full overflow-hidden"
            style={{
                ...backgroundStyle(data, media),
                color: data.theme.text,
                fontFamily: english ? SERIF_FONT : BODY_FONT,
            }}
        >
            {media.music && !compact && (
                <MusicButton src={media.music} autoStart={autoStartMusic} />
            )}

            <section
                className={cn(
                    'relative flex flex-col items-center px-12 pb-20 text-center',
                    photoBackground
                        ? cn(
                              'pt-20',
                              compact ? 'min-h-[560px]' : 'min-h-[760px]',
                          )
                        : split
                          ? 'min-h-[680px]'
                          : 'min-h-[680px] pt-24',
                )}
            >
                {photoBackground && media.cover && (
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
                                    ? 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 34%, rgba(10,8,6,0.72) 62%, #0d0b08 100%)'
                                    : (data.theme.overlay ??
                                      'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.12) 32%, rgba(0,0,0,0.12) 48%, rgba(0,0,0,0.75) 80%, rgba(0,0,0,0.9) 100%)'),
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

                <div className="pointer-events-none absolute inset-0 z-10">
                    {media.frame ? (
                        <img
                            src={media.frame}
                            alt=""
                            className="size-full object-fill"
                        />
                    ) : (
                        <BaroqueCorners color={secondary} size="w-44" />
                    )}
                </div>

                <div className="relative z-10 flex w-full flex-1 flex-col items-center">
                    {split && media.cover && (
                        <div className="-mx-12 mb-8 self-stretch">
                            <img
                                src={media.cover}
                                alt=""
                                className="h-80 w-full object-cover"
                                style={{
                                    ...photoFocus(media.cover),
                                    maskImage:
                                        'linear-gradient(180deg, black 60%, transparent 100%)',
                                    WebkitMaskImage:
                                        'linear-gradient(180deg, black 60%, transparent 100%)',
                                }}
                            />
                        </div>
                    )}

                    {!cinematic && (
                        <Rise motion={motion} step={0}>
                            <Heading data={data}>{data.title}</Heading>
                        </Rise>
                    )}

                    {photoBackground ? (
                        <div className="min-h-40 flex-1" />
                    ) : (
                        !split && (
                            <Rise motion={motion} step={1}>
                                {hero === 'oval' ? (
                                    <OrnateOvalFrame
                                        src={media.cover}
                                        color={secondary}
                                        className={`my-5 w-56 ${motion === 'static' ? '' : 'inv-float'}`}
                                        placeholder={
                                            <div
                                                className="flex size-full items-center justify-center"
                                                style={{ background: panel }}
                                            >
                                                <Ornament
                                                    type={data.theme.ornament}
                                                    primary={primary}
                                                    secondary={secondary}
                                                    className="size-24"
                                                />
                                            </div>
                                        }
                                    />
                                ) : (
                                    <div className="my-6 flex justify-center">
                                        <HeroPhoto
                                            style={hero}
                                            src={media.cover}
                                            data={data}
                                            motion={motion}
                                        />
                                    </div>
                                )}
                            </Rise>
                        )
                    )}

                    {cinematic && (
                        <Rise motion={motion} step={1}>
                            <Heading data={data}>{data.title}</Heading>
                        </Rise>
                    )}

                    {!data.hideHosts && data.hostLeft && (
                        <Rise motion={motion} step={2}>
                            <p className={nameClass} style={nameStyle}>
                                {data.hostLeft}
                            </p>
                            {data.hostRight && (
                                <>
                                    <p
                                        className="my-0.5 text-sm"
                                        style={{ color: secondary }}
                                    >
                                        {data.joiner}
                                    </p>
                                    <p className={nameClass} style={nameStyle}>
                                        {data.hostRight}
                                    </p>
                                </>
                            )}
                        </Rise>
                    )}

                    {data.dateParts && (
                        <Rise
                            motion={motion}
                            step={3}
                            className="mt-5 w-full max-w-72"
                        >
                            <p
                                className={`mb-2 text-xs ${english ? 'tracking-[0.2em] uppercase' : ''}`}
                                style={{ color: secondary }}
                            >
                                {copy.saveDate}
                            </p>
                            <div
                                className="grid grid-cols-3 items-center border-y py-2"
                                style={{ borderColor: `${secondary}88` }}
                            >
                                <span className="text-[13px]">
                                    {data.dateParts.weekday}
                                </span>
                                <span
                                    className="border-x text-[38px] leading-none font-semibold"
                                    style={{
                                        borderColor: `${secondary}88`,
                                        color: primary,
                                    }}
                                >
                                    {data.dateParts.day}
                                </span>
                                <span className="text-[13px] leading-5">
                                    {data.dateParts.month}
                                    <br />
                                    {data.dateParts.year}
                                </span>
                            </div>
                        </Rise>
                    )}

                    <Rise motion={motion} step={4}>
                        <DaysToGo data={data} className="mt-4" />
                    </Rise>

                    {calendar && !compact && (
                        <Rise motion={motion} step={4}>
                            <PillLink
                                href={calendar}
                                color={primary}
                                panel={panel}
                            >
                                <CalendarPlus className="size-4" />
                                {copy.reminder}
                            </PillLink>
                        </Rise>
                    )}

                    {!compact && (
                        <button
                            type="button"
                            onClick={() =>
                                details.current?.scrollIntoView({
                                    behavior: 'smooth',
                                })
                            }
                            className="mt-8 flex flex-col items-center text-xs"
                            style={{ color: secondary }}
                        >
                            {copy.scrollDown}
                            <ChevronsDown className="size-5 animate-bounce" />
                        </button>
                    )}
                </div>
            </section>

            {!compact && (
                <div ref={details}>
                    <Section motion={motion} data={data} top={false}>
                        <Heading data={data}>{data.messageTitle}</Heading>
                        <ParentsBlock data={data} />
                        <p className="text-[14px] leading-7 whitespace-pre-line">
                            {data.message}
                        </p>

                        {!data.hideHosts && data.hostLeft && (
                            <div className="grid grid-cols-2 gap-3">
                                <Named
                                    data={data}
                                    label={copy.groomLabel}
                                    name={data.hostLeft}
                                />
                                {data.hostRight && (
                                    <Named
                                        data={data}
                                        label={copy.brideLabel}
                                        name={data.hostRight}
                                    />
                                )}
                            </div>
                        )}

                        {data.dateText && (
                            <div className="space-y-1">
                                <p
                                    className="text-[13px]"
                                    style={{ color: secondary }}
                                >
                                    {copy.heldOn}
                                </p>
                                <p
                                    className="text-[16px] font-semibold"
                                    style={{ color: primary }}
                                >
                                    {data.dateText}
                                </p>
                                {data.eventTime && (
                                    <p className="text-[13px]">
                                        {copy.from} {data.timeText}
                                    </p>
                                )}
                            </div>
                        )}
                        {data.venueText && (
                            <p className="text-[14px] leading-7">
                                {data.venueText}
                            </p>
                        )}
                        {media.map && (
                            <img
                                src={media.map}
                                alt={copy.location}
                                className="mx-auto w-full max-w-72 rounded-lg"
                            />
                        )}
                        {data.mapHref && (
                            <PillLink
                                href={data.mapHref}
                                color={primary}
                                panel={panel}
                            >
                                {copy.openMap}
                                <MapPin className="size-4" />
                            </PillLink>
                        )}
                    </Section>

                    {data.agenda.length > 0 && (
                        <Section motion={motion} data={data}>
                            <Heading data={data}>{copy.agenda}</Heading>
                            <ol className="space-y-5">
                                {data.agenda.map((item, index) =>
                                    item.time ? (
                                        <li key={index} className="space-y-0.5">
                                            <p
                                                className="text-[14px] font-bold"
                                                style={{ color: primary }}
                                            >
                                                {item.time}
                                            </p>
                                            <p className="text-[13px] leading-6">
                                                {item.title}
                                            </p>
                                        </li>
                                    ) : (
                                        <li
                                            key={index}
                                            className="rounded-full border py-1.5 text-[14px] font-semibold"
                                            style={{
                                                borderColor: `${secondary}88`,
                                                color: primary,
                                                background: panel,
                                            }}
                                        >
                                            {item.title}
                                        </li>
                                    ),
                                )}
                            </ol>
                        </Section>
                    )}

                    {media.gallery.length > 0 && (
                        <Section motion={motion} data={data} padded={false}>
                            <Heading data={data}>{copy.gallery}</Heading>
                            <div className="px-6">
                                <Gallery photos={media.gallery} />
                            </div>
                        </Section>
                    )}

                    {data.showCountdown && (
                        <Section motion={motion} data={data}>
                            <Card data={data} className="px-3">
                                <Heading data={data}>{copy.countdown}</Heading>
                                <Countdown data={data} />
                                {data.dateText && (
                                    <p
                                        className="text-[14px] font-semibold"
                                        style={{ color: primary }}
                                    >
                                        {data.dateText}
                                    </p>
                                )}
                            </Card>
                        </Section>
                    )}

                    {hasGift && (
                        <Section motion={motion} data={data}>
                            <Card data={data}>
                                <Heading data={data}>{copy.gift}</Heading>
                                <GiftSection data={data} media={media} />
                            </Card>
                        </Section>
                    )}

                    <Section motion={motion} data={data}>
                        <Heading data={data}>{copy.rsvpTitle}</Heading>
                        <RsvpForm data={data} rsvp={rsvp} />
                    </Section>

                    <Section motion={motion} data={data} bottom>
                        <Heading data={data}>{data.thanksTitle}</Heading>
                        <p className="text-[14px] leading-7 whitespace-pre-line">
                            {data.thanks}
                        </p>
                        <div className="flex justify-center pt-2">
                            <Ornament
                                type={data.theme.ornament}
                                primary={primary}
                                secondary={secondary}
                                className="size-14 opacity-70"
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
    data,
    padded = true,
    top = true,
    bottom = false,
    children,
}: {
    motion: Motion;
    data: ResolvedInvitation;
    padded?: boolean;
    top?: boolean;
    bottom?: boolean;
    children: ReactNode;
}) {
    return (
        <section
            className={`relative space-y-5 text-center ${top ? 'pt-32' : 'pt-10'} ${bottom ? 'pb-32' : 'pb-10'} ${padded ? 'px-10' : ''}`}
        >
            <BaroqueCorners
                color={data.secondary}
                size="w-32"
                top={top}
                bottom={bottom}
            />
            <Reveal motion={motion}>
                <div className="space-y-5">{children}</div>
            </Reveal>
        </section>
    );
}

function Card({
    data,
    className = 'px-5',
    children,
}: {
    data: ResolvedInvitation;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={`relative space-y-4 rounded-2xl border py-8 shadow-sm ${className}`}
            style={{
                borderColor: `${data.secondary}99`,
                background: data.theme.panel,
            }}
        >
            {children}
        </div>
    );
}

function Named({
    data,
    label,
    name,
}: {
    data: ResolvedInvitation;
    label: string;
    name: string;
}) {
    return (
        <div className="space-y-1">
            <p className="text-[12px]" style={{ color: data.secondary }}>
                {label}
            </p>
            <p
                className={
                    data.lang === 'en'
                        ? 'text-[26px] leading-tight'
                        : 'text-[15px] leading-[1.9]'
                }
                style={{
                    ...headlineStyle(data, data.primary),
                    fontFamily: data.lang === 'en' ? SCRIPT_FONT : TITLE_FONT,
                }}
            >
                {name}
            </p>
        </div>
    );
}

function Heading({
    data,
    children,
}: {
    data: ResolvedInvitation;
    children: ReactNode;
}) {
    const english = data.lang === 'en';

    return (
        <h2
            className={
                english
                    ? 'text-[19px] font-semibold tracking-[0.18em] uppercase'
                    : 'text-[19px] leading-[1.9]'
            }
            style={{
                ...headlineStyle(data, data.primary),
                fontFamily: english ? SERIF_FONT : TITLE_FONT,
            }}
        >
            {children}
        </h2>
    );
}

function PillLink({
    href,
    color,
    panel,
    children,
}: {
    href: string;
    color: string;
    panel: string;
    children: ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] font-semibold backdrop-blur-sm"
            style={{ borderColor: color, color, background: panel }}
        >
            {children}
        </a>
    );
}
