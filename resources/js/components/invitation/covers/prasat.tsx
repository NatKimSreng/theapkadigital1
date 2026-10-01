import { Pop, Rise } from '../animations';
import { photoFocus } from '../heroes';
import { Ornament } from '../ornaments';
import { DaysToGo } from '../parts';
import { SCRIPT_FONT, SERIF_FONT, TITLE_FONT } from '../resolve';
import type { CoverProps } from './index';
import { DEEP_GOLD_TEXT, ScrollButton, useIds } from './shared';
import { SpaceGold, Tower } from './temple';

/**
 * Golden Prasat: sandstone and gold. The couple's photo stands in the
 * doorway of a Khmer temple gate under three lotus-bud towers, with a lotus
 * pond along the foot.
 */

const DOOR = 'M74 392V264C74 232 110 222 150 202C190 222 226 232 226 264V392Z';

/** A chovea: the pediment's end curling up like a naga's head. */
const CHOVEA = 'M0 0C-6-2-10-10-6-18C-3-23 4-22 4-16C4-12-1-11-2-14';

function TempleGate({
    src,
    monogram,
    primary,
    secondary,
    ornament,
}: {
    src: string | null;
    monogram: string;
    primary: string;
    secondary: string;
    ornament: 'frame' | 'rings' | 'balloons' | 'house' | 'hearts';
}) {
    const ids = useIds('gold', 'stone', 'halo', 'clip');
    const gold = `url(#${ids.gold})`;
    const stone = `url(#${ids.stone})`;

    const lattice = (x: number) => (
        <g>
            <rect
                x={x}
                y="252"
                width="42"
                height="78"
                fill="rgba(70,35,10,0.32)"
                stroke={gold}
                strokeWidth="1.4"
            />
            {Array.from({ length: 5 }, (_, i) => (
                <rect
                    key={i}
                    x={x + 3.5 + i * 7.8}
                    y="254"
                    width="4.6"
                    height="74"
                    rx="2.3"
                    fill="#efd9ae"
                    stroke={gold}
                    strokeWidth="0.6"
                />
            ))}
        </g>
    );

    return (
        <svg viewBox="0 0 300 400" className="w-[17.5rem] max-w-full">
            <defs>
                <SpaceGold id={ids.gold} height={400} />
                <linearGradient id={ids.stone} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f6e6c4" />
                    <stop offset="1" stopColor="#e0c08a" />
                </linearGradient>
                <radialGradient id={ids.halo}>
                    <stop offset="0" stopColor="#fff7df" stopOpacity="0.95" />
                    <stop offset="0.6" stopColor="#ffe9b3" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#ffe9b3" stopOpacity="0" />
                </radialGradient>
                <clipPath id={ids.clip}>
                    <path d={DOOR} />
                </clipPath>
            </defs>

            <circle cx="150" cy="96" r="120" fill={`url(#${ids.halo})`} />

            <Tower
                cx={40}
                base={190}
                w={46}
                h={92}
                fill={stone}
                stroke={gold}
            />
            <Tower
                cx={260}
                base={190}
                w={46}
                h={92}
                fill={stone}
                stroke={gold}
            />
            <Tower
                cx={150}
                base={168}
                w={84}
                h={156}
                fill={stone}
                stroke={gold}
            />

            {/* pediment over the gate, with the couple's initials */}
            <path
                d="M58 192L150 124L242 192Z"
                fill={stone}
                stroke={gold}
                strokeWidth="2.2"
                strokeLinejoin="round"
            />
            <path
                d="M82 188L150 138L218 188"
                fill="none"
                stroke={gold}
                strokeWidth="1"
            />
            <path
                d={CHOVEA}
                fill="none"
                stroke={gold}
                strokeWidth="2.2"
                strokeLinecap="round"
                transform="translate(58 192)"
            />
            <path
                d={CHOVEA}
                fill="none"
                stroke={gold}
                strokeWidth="2.2"
                strokeLinecap="round"
                transform="translate(242 192) scale(-1 1)"
            />
            <text
                x="150"
                y="180"
                textAnchor="middle"
                fontFamily="'Cormorant Garamond', serif"
                fontWeight="700"
                fontSize="17"
                fill={gold}
            >
                {monogram}
            </text>

            <rect
                x="6"
                y="190"
                width="288"
                height="10"
                fill={stone}
                stroke={gold}
                strokeWidth="1.4"
            />
            <rect
                x="12"
                y="200"
                width="276"
                height="192"
                fill={stone}
                stroke={gold}
                strokeWidth="1.4"
            />
            <path d="M12 216H288" stroke={gold} strokeWidth="1" />
            {lattice(22)}
            {lattice(236)}

            {src ? (
                <foreignObject
                    x="74"
                    y="200"
                    width="152"
                    height="192"
                    clipPath={`url(#${ids.clip})`}
                >
                    <img
                        src={src}
                        alt=""
                        className="size-full object-cover"
                        style={photoFocus(src)}
                    />
                </foreignObject>
            ) : (
                <>
                    <path d={DOOR} fill="rgba(90,50,20,0.22)" />
                    <foreignObject x="100" y="250" width="100" height="100">
                        <Ornament
                            type={ornament}
                            primary={primary}
                            secondary={secondary}
                            className="size-full"
                        />
                    </foreignObject>
                </>
            )}
            <path d={DOOR} fill="none" stroke={gold} strokeWidth="5" />
            <path
                d="M84 392V267C84 241 114 231 150 214C186 231 216 241 216 267V392"
                fill="none"
                stroke={gold}
                strokeWidth="1.2"
            />
            <rect x="0" y="390" width="300" height="10" fill={gold} />
        </svg>
    );
}

/** Lotus flowers and buds rising from a still pond. */
function LotusPond() {
    const ids = useIds('gold');
    const gold = `url(#${ids.gold})`;

    return (
        <svg viewBox="0 0 360 60" aria-hidden className="w-full">
            <defs>
                <SpaceGold id={ids.gold} height={60} />
            </defs>
            <g opacity="0.75">
                {Array.from({ length: 9 }, (_, i) => {
                    const x = 30 + i * 37.5;

                    return i % 2 === 0 ? (
                        <g key={i} transform={`translate(${x} 48)`}>
                            <path
                                d="M0 0c-7-6-7-16 0-24c7 8 7 18 0 24z"
                                fill={gold}
                            />
                            <path
                                d="M0 0c-10-2-16-9-17-18c8 1 14 8 17 18z"
                                fill={gold}
                            />
                            <path
                                d="M0 0c10-2 16-9 17-18c-8 1-14 8-17 18z"
                                fill={gold}
                            />
                        </g>
                    ) : (
                        <path
                            key={i}
                            d="M0 0c-5-6-5-13 0-18c5 5 5 12 0 18z"
                            fill={gold}
                            transform={`translate(${x} 48)`}
                        />
                    );
                })}
            </g>
            <path
                d="M10 50H350M40 55H320"
                stroke={gold}
                strokeWidth="1.2"
                opacity="0.6"
            />
        </svg>
    );
}

export function PrasatCover({
    data,
    media,
    guestName,
    motion,
    onScrollDown,
}: CoverProps) {
    const english = data.lang === 'en';
    const heading = {
        ...DEEP_GOLD_TEXT,
        fontFamily: english ? SERIF_FONT : TITLE_FONT,
    };
    const names = {
        ...DEEP_GOLD_TEXT,
        fontFamily: english ? SCRIPT_FONT : TITLE_FONT,
    };
    const nameClass = english
        ? 'text-[38px] leading-tight break-words'
        : 'text-[20px] leading-[1.9] break-words';

    return (
        <section className="relative flex min-h-[720px] flex-col items-center overflow-hidden px-7 pt-8 pb-28 text-center">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-3 rounded-t-[40px] rounded-b-sm border-2 border-[#b8862b]/60"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-[18px] rounded-t-[34px] rounded-b-sm border border-[#b8862b]/35"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-3"
            >
                <LotusPond />
            </div>

            <Rise motion={motion} step={0}>
                <h1
                    className={
                        english
                            ? 'text-[14px] font-semibold tracking-[0.3em] uppercase'
                            : 'text-[18px] leading-[1.9]'
                    }
                    style={heading}
                >
                    {data.title}
                </h1>
            </Rise>

            <Rise
                motion={motion}
                step={1}
                className="mt-3 flex w-full justify-center drop-shadow-xl"
            >
                <TempleGate
                    src={media.cover}
                    monogram={data.monogram}
                    primary={data.primary}
                    secondary={data.secondary}
                    ornament={data.theme.ornament}
                />
            </Rise>

            {!data.hideHosts && data.hostLeft && (
                <div className="mt-4 w-full">
                    <Pop motion={motion} step={2}>
                        <p className={nameClass} style={names}>
                            {data.hostLeft}
                        </p>
                    </Pop>
                    {data.hostRight && (
                        <>
                            <Pop motion={motion} step={3}>
                                <p
                                    className="text-sm"
                                    style={{ color: data.secondary }}
                                >
                                    {data.joiner}
                                </p>
                            </Pop>
                            <Pop motion={motion} step={4}>
                                <p className={nameClass} style={names}>
                                    {data.hostRight}
                                </p>
                            </Pop>
                        </>
                    )}
                </div>
            )}

            <Rise motion={motion} step={5} className="mt-4">
                <p className="text-[15px] leading-[1.8]" style={heading}>
                    {data.inviteLine}
                </p>
            </Rise>

            <Rise
                motion={motion}
                step={6}
                className="mt-2 flex w-full items-center gap-2"
            >
                <span
                    aria-hidden
                    className="h-px flex-1 bg-gradient-to-r from-transparent to-[#b8862b]"
                />
                <div className="min-w-0 rounded-full border-2 border-[#b8862b] bg-white/55 px-5 py-1.5 shadow-inner">
                    <p
                        className="truncate text-[16px] leading-[1.9]"
                        style={heading}
                    >
                        {guestName}
                    </p>
                </div>
                <span
                    aria-hidden
                    className="h-px flex-1 bg-gradient-to-l from-transparent to-[#b8862b]"
                />
            </Rise>

            {data.dateText && (
                <Rise motion={motion} step={7}>
                    <p
                        className="mt-4 text-[14px] font-semibold"
                        style={{ color: data.secondary }}
                    >
                        {data.dateText}
                    </p>
                </Rise>
            )}

            <Rise motion={motion} step={7}>
                <DaysToGo data={data} className="mt-2" />
            </Rise>

            {onScrollDown && (
                <ScrollButton
                    label={data.copy.scrollDown}
                    onClick={onScrollDown}
                    ring="#b8862b"
                    fill="rgba(255,250,240,0.85)"
                    icon="#9a6b1f"
                    textStyle={DEEP_GOLD_TEXT}
                />
            )}
        </section>
    );
}
