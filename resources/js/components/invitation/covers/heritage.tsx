import { photoFocus } from '../heroes';
import { Pop, Rise } from '../animations';
import { SectionMotif } from '../motifs';
import { DaysToGo } from '../parts';
import { SCRIPT_FONT, SERIF_FONT, TITLE_FONT } from '../resolve';
import type { CoverProps } from './index';
import { KbachCorner } from './kbach';
import { DEEP_GOLD_TEXT, Flame, ScrollButton, useIds } from './shared';
import { SpaceGold } from './temple';

/**
 * Khmer Heritage: the formal invitation page itself. Ivory stock in a gold
 * frame with a light running round it; both families' parents at the top,
 * the formal invitation, the couple's names either side of a Kbach
 * fleuron, the lunar and solar dates, the time and the venue.
 */

/** A gold double frame with Kbach corners and a light running round it. */
function LivingFrame() {
    const ids = useIds('gold');

    return (
        <div aria-hidden className="pointer-events-none absolute inset-3">
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 size-full overflow-visible"
            >
                <defs>
                    <SpaceGold id={ids.gold} height={100} />
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    fill="none"
                    stroke={`url(#${ids.gold})`}
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                />
                <rect
                    x="1.6"
                    y="1.1"
                    width="96.8"
                    height="97.8"
                    fill="none"
                    stroke="#b8862b"
                    strokeOpacity="0.45"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                />
                <rect
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    pathLength="100"
                    fill="none"
                    stroke="#fff3c4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="10 40"
                    vectorEffect="non-scaling-stroke"
                    className="inv-trace"
                    style={{
                        filter: 'drop-shadow(0 0 3px #f3c867) drop-shadow(0 0 8px #e0a83a)',
                    }}
                />
            </svg>
            <KbachCorner className="absolute -top-2 -left-2 w-20" />
            <KbachCorner className="absolute -top-2 -right-2 w-20 -scale-x-100" />
            <KbachCorner className="absolute -bottom-2 -left-2 w-20 -scale-y-100" />
            <KbachCorner className="absolute -right-2 -bottom-2 w-20 -scale-100" />
        </div>
    );
}

/** Three Kbach flames on a lotus base, set between the couple's names. */
function Fleuron() {
    const ids = useIds('gold');
    const gold = `url(#${ids.gold})`;

    return (
        <svg viewBox="0 0 60 64" aria-hidden className="w-12">
            <defs>
                <SpaceGold id={ids.gold} height={64} />
            </defs>
            <g transform="translate(30 44)">
                <Flame x={0} y={0} angle={-40} size={0.85} fill={gold} />
                <Flame x={0} y={0} angle={40} size={0.85} fill={gold} />
                <Flame x={0} y={2} angle={0} size={1.1} fill={gold} />
            </g>
            <path
                d="M30 62c-6-4-8-10-6-16c4 2 6 7 6 16zm0 0c6-4 8-10 6-16c-4 2-6 7-6 16zM14 60h32"
                fill={gold}
                stroke={gold}
                strokeWidth="1"
            />
        </svg>
    );
}

export function HeritageCover({
    data,
    media,
    guestName,
    motion,
    onScrollDown,
}: CoverProps) {
    const english = data.lang === 'en';
    const red = data.primary;
    const title = { color: red, fontFamily: TITLE_FONT };
    const names = {
        ...DEEP_GOLD_TEXT,
        fontFamily: english ? SCRIPT_FONT : TITLE_FONT,
    };
    const nameClass = english
        ? 'text-[28px] leading-tight break-words'
        : 'text-[16px] leading-[1.9] break-words';
    const parents = (label: string, people: string) =>
        people && (
            <div className="min-w-0">
                <p
                    className={
                        english
                            ? 'text-[10px] tracking-[0.18em] uppercase'
                            : 'text-[12px]'
                    }
                    style={{ color: data.secondary }}
                >
                    {label}
                </p>
                <p className="text-[14px] leading-7 font-semibold whitespace-pre-line">
                    {people}
                </p>
            </div>
        );

    return (
        <section className="relative flex min-h-[760px] flex-col items-center overflow-hidden px-9 pt-12 pb-28 text-center">
            <LivingFrame />

            <Rise motion={motion} step={0} className="w-full">
                <SectionMotif
                    motif="kbach"
                    primary={data.secondary}
                    secondary={data.secondary}
                />
            </Rise>

            {(data.groomParents || data.brideParents) && (
                <Rise
                    motion={motion}
                    step={0}
                    className="mt-3 grid w-full grid-cols-2 gap-3"
                >
                    {parents(data.copy.groomParents, data.groomParents)}
                    {parents(data.copy.brideParents, data.brideParents)}
                </Rise>
            )}

            <Rise motion={motion} step={1} className="mt-5">
                <h1
                    className={
                        english
                            ? 'text-[19px] font-semibold'
                            : 'text-[19px] leading-[1.9]'
                    }
                    style={
                        english ? { color: red, fontFamily: SERIF_FONT } : title
                    }
                >
                    {data.messageTitle}
                </h1>
            </Rise>

            {media.cover && (
                <Rise motion={motion} step={1} className="mt-3">
                    <div
                        className="overflow-hidden rounded-t-full border-[3px] p-1 shadow-lg"
                        style={{ borderColor: data.secondary }}
                    >
                        <img
                            src={media.cover}
                            alt=""
                            className="aspect-[3/4] w-36 rounded-t-full object-cover"
                            style={photoFocus(media.cover)}
                        />
                    </div>
                </Rise>
            )}

            <Rise motion={motion} step={2} className="mt-4">
                <p className="text-[14px] leading-8">{data.message}</p>
            </Rise>

            <Rise
                motion={motion}
                step={2}
                className="mt-3 flex w-full items-center gap-2"
            >
                <span
                    aria-hidden
                    className="h-px flex-1"
                    style={{ background: data.secondary }}
                />
                <p
                    className="max-w-[80%] truncate rounded-sm border px-4 py-1 text-[15px] leading-[1.9]"
                    style={{ ...title, borderColor: data.secondary }}
                >
                    {guestName}
                </p>
                <span
                    aria-hidden
                    className="h-px flex-1"
                    style={{ background: data.secondary }}
                />
            </Rise>

            {!data.hideHosts && data.hostLeft && (
                <div className="mt-5 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <Pop motion={motion} step={3}>
                        <p className="text-[12px]" style={{ color: red }}>
                            {data.copy.groomLabel}
                        </p>
                        <p className={nameClass} style={names}>
                            {data.hostLeft}
                        </p>
                    </Pop>
                    <Pop motion={motion} step={4}>
                        <Fleuron />
                    </Pop>
                    {data.hostRight ? (
                        <Pop motion={motion} step={5}>
                            <p className="text-[12px]" style={{ color: red }}>
                                {data.copy.brideLabel}
                            </p>
                            <p className={nameClass} style={names}>
                                {data.hostRight}
                            </p>
                        </Pop>
                    ) : (
                        <span />
                    )}
                </div>
            )}

            {data.dateText && (
                <Rise motion={motion} step={6} className="mt-5 space-y-0.5">
                    <p
                        className="text-[13px]"
                        style={{ color: data.secondary }}
                    >
                        {data.copy.heldOn}
                    </p>
                    {data.lunarDate && (
                        <p className="text-[14px] leading-7 font-semibold">
                            {data.lunarDate}
                        </p>
                    )}
                    <p className="text-[14px] leading-7 font-semibold">
                        {data.lunarDate && `${data.copy.lunarMatches} `}
                        {data.dateText}
                    </p>
                    {data.eventTime && (
                        <p className="text-[14px] leading-7">
                            {data.copy.from} {data.timeText}
                        </p>
                    )}
                </Rise>
            )}

            {data.venueText && (
                <Rise motion={motion} step={7} className="mt-2">
                    <p
                        className="text-[14px] leading-7 font-semibold"
                        style={{ color: red }}
                    >
                        {data.venueText}
                    </p>
                    {data.address && (
                        <p className="text-[13px] leading-6 opacity-80">
                            {data.address}
                        </p>
                    )}
                </Rise>
            )}

            <Rise motion={motion} step={8} className="mt-4">
                <p className="text-[14px] font-semibold" style={{ color: red }}>
                    {data.copy.closing}
                </p>
                <DaysToGo data={data} className="mt-3" />
            </Rise>

            {onScrollDown && (
                <ScrollButton
                    label={data.copy.scrollDown}
                    onClick={onScrollDown}
                    ring={data.secondary}
                    fill="rgba(255,255,255,0.85)"
                    icon={red}
                    textStyle={{ color: red }}
                />
            )}
        </section>
    );
}
