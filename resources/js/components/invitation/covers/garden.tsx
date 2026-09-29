import type { ReactNode } from 'react';
import { Rise } from '../animations';
import { DaysToGo } from '../parts';
import { SCRIPT_FONT, TITLE_FONT } from '../resolve';
import type { CoverProps } from './index';
import { GOLD_TEXT, GoldGradient, ScrollButton, useIds } from './shared';

/**
 * Blush Garden: a painted-style cover with a pink sky, white marble
 * columns under an arch, roses and hanging wisteria, a gold monogram
 * crest and a gold name plaque. All artwork is drawn here in SVG.
 */

/** A marble column with capital and base, filling its box. */
function Column({ side }: { side: 'left' | 'right' }) {
    const ids = useIds('shaft', 'cap');

    return (
        <svg
            viewBox="0 0 60 640"
            preserveAspectRatio="none"
            aria-hidden
            className="h-full w-full"
            style={{ transform: side === 'right' ? 'scaleX(-1)' : undefined }}
        >
            <defs>
                <linearGradient id={ids.shaft} x1="0" x2="1">
                    <stop offset="0" stopColor="#d9d3dc" />
                    <stop offset="0.3" stopColor="#ffffff" />
                    <stop offset="0.65" stopColor="#f3eff4" />
                    <stop offset="1" stopColor="#c9c1cc" />
                </linearGradient>
                <linearGradient id={ids.cap} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#ddd6e0" />
                </linearGradient>
            </defs>
            <rect
                x="12"
                y="60"
                width="36"
                height="520"
                fill={`url(#${ids.shaft})`}
            />
            {[20, 30, 40].map((x) => (
                <line
                    key={x}
                    x1={x}
                    x2={x}
                    y1="64"
                    y2="576"
                    stroke="#cfc7d3"
                    strokeOpacity="0.55"
                />
            ))}
            <rect
                x="4"
                y="44"
                width="52"
                height="18"
                rx="3"
                fill={`url(#${ids.cap})`}
                stroke="#d5cdd8"
            />
            <rect
                x="0"
                y="34"
                width="60"
                height="12"
                rx="2"
                fill="#fbf9fb"
                stroke="#d5cdd8"
            />
            <circle cx="8" cy="54" r="6" fill="#fff" stroke="#d5cdd8" />
            <circle cx="52" cy="54" r="6" fill="#fff" stroke="#d5cdd8" />
            <rect
                x="6"
                y="578"
                width="48"
                height="14"
                rx="3"
                fill={`url(#${ids.cap})`}
                stroke="#d5cdd8"
            />
            <rect
                x="0"
                y="592"
                width="60"
                height="48"
                fill="#f7f4f8"
                stroke="#d5cdd8"
            />
        </svg>
    );
}

/** One layered rose/peony head. */
function Bloom({
    x,
    y,
    r,
    tone,
}: {
    x: number;
    y: number;
    r: number;
    tone: 'blush' | 'white' | 'rose';
}) {
    const palette = {
        blush: ['#f4b6c2', '#f8cbd4', '#fbdde3', '#e993a6'],
        white: ['#f3e9ec', '#fbf6f7', '#ffffff', '#e2d3d8'],
        rose: ['#e58ea3', '#efaab9', '#f6c4cf', '#cf6d86'],
    }[tone];

    return (
        <g transform={`translate(${x} ${y})`}>
            {[0, 72, 144, 216, 288].map((angle) => (
                <ellipse
                    key={angle}
                    cx="0"
                    cy={-r * 0.45}
                    rx={r * 0.62}
                    ry={r * 0.58}
                    fill={palette[0]}
                    transform={`rotate(${angle})`}
                />
            ))}
            {[36, 108, 180, 252, 324].map((angle) => (
                <ellipse
                    key={angle}
                    cx="0"
                    cy={-r * 0.28}
                    rx={r * 0.45}
                    ry={r * 0.4}
                    fill={palette[1]}
                    transform={`rotate(${angle})`}
                />
            ))}
            <circle r={r * 0.34} fill={palette[2]} />
            <path
                d={`M${-r * 0.18} 0a${r * 0.18} ${r * 0.18} 0 1 1 ${r * 0.36} 0`}
                fill="none"
                stroke={palette[3]}
                strokeWidth={Math.max(0.8, r * 0.06)}
                strokeLinecap="round"
            />
        </g>
    );
}

function Leaf({
    x,
    y,
    angle,
    size = 1,
}: {
    x: number;
    y: number;
    angle: number;
    size?: number;
}) {
    return (
        <path
            d="M0 0c6-8 18-10 26-4c-8 8-20 10-26 4z"
            fill="#8fae7e"
            fillOpacity="0.9"
            transform={`translate(${x} ${y}) rotate(${angle}) scale(${size})`}
        />
    );
}

/** A lush cluster of roses and peonies tucked into leaves. */
function Cluster({
    x,
    y,
    scale = 1,
    flip = false,
}: {
    x: number;
    y: number;
    scale?: number;
    flip?: boolean;
}) {
    return (
        <g
            transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
        >
            <Leaf x={-40} y={10} angle={-20} size={1.6} />
            <Leaf x={10} y={-34} angle={-70} size={1.5} />
            <Leaf x={30} y={22} angle={30} size={1.4} />
            <Leaf x={-20} y={34} angle={100} size={1.2} />
            <Bloom x={-6} y={0} r={30} tone="blush" />
            <Bloom x={30} y={-18} r={20} tone="white" />
            <Bloom x={-34} y={26} r={19} tone="white" />
            <Bloom x={22} y={26} r={16} tone="rose" />
            <Bloom x={-30} y={-22} r={13} tone="blush" />
            <Bloom x={48} y={8} r={11} tone="blush" />
        </g>
    );
}

/** A hanging wisteria strand. */
function Wisteria({ x, y, length }: { x: number; y: number; length: number }) {
    const count = Math.round(length / 7);

    return (
        <g>
            {Array.from({ length: count }, (_, i) => {
                const t = i / count;
                const spread = (1 - t) * 8;
                // Each strand drapes and sways a little as it falls.
                const cx = x + Math.sin(t * Math.PI * 1.4 + x) * 5 * t;

                return (
                    <g key={i}>
                        <ellipse
                            cx={cx - spread / 2}
                            cy={y + i * 7}
                            rx={3.4 - t * 1.6}
                            ry={2.6}
                            fill={t < 0.5 ? '#c79ad6' : '#e3b9e6'}
                            fillOpacity="0.9"
                        />
                        <ellipse
                            cx={cx + spread / 2}
                            cy={y + i * 7 + 3}
                            rx={3.2 - t * 1.5}
                            ry={2.4}
                            fill={t < 0.5 ? '#b784c9' : '#d7aee0'}
                            fillOpacity="0.9"
                        />
                    </g>
                );
            })}
        </g>
    );
}

/** The marble arch across the top, with roses and wisteria along it. */
function Arch() {
    const ids = useIds('marble');

    return (
        <svg
            viewBox="0 0 360 230"
            aria-hidden
            className="w-full"
            preserveAspectRatio="xMidYMin meet"
        >
            <defs>
                <linearGradient id={ids.marble} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#e3dce6" />
                </linearGradient>
            </defs>
            <path
                d="M0 118C18 44 96 10 180 10s162 34 180 108v-30C340 26 262 -6 180 -6S20 26 0 88z"
                fill={`url(#${ids.marble})`}
                stroke="#d6cfd9"
            />
            <path
                d="M8 112C28 48 102 20 180 20s152 28 172 92"
                fill="none"
                stroke="#e9e3eb"
                strokeWidth="2"
            />

            {[70, 118, 158, 202, 242, 290].map((x, i) => (
                <Wisteria
                    key={x}
                    x={x}
                    y={i % 2 ? 26 : 34}
                    length={[70, 96, 58, 88, 64, 92][i]}
                />
            ))}

            <Bloom x={120} y={14} r={10} tone="blush" />
            <Bloom x={180} y={6} r={12} tone="white" />
            <Bloom x={240} y={14} r={10} tone="blush" />
            <Cluster x={34} y={52} scale={1.05} />
            <Cluster x={326} y={52} scale={1.05} flip />
        </svg>
    );
}

/** Clouds, a distant gazebo and a balustrade: the garden behind the arch. */
function Scenery() {
    return (
        <>
            <div aria-hidden className="absolute inset-0 overflow-hidden">
                {[
                    'left-[-10%] top-[20%] h-28 w-64',
                    'right-[-15%] top-[34%] h-24 w-72',
                    'left-[10%] top-[52%] h-20 w-56',
                    'right-[5%] top-[62%] h-24 w-60',
                ].map((position) => (
                    <div
                        key={position}
                        className={`absolute rounded-full bg-white/60 blur-2xl ${position}`}
                    />
                ))}
            </div>
            <svg
                viewBox="0 0 360 170"
                aria-hidden
                className="absolute inset-x-0 bottom-0 w-full opacity-70"
            >
                {/* distant gazebo */}
                <g
                    fill="#fff"
                    fillOpacity="0.7"
                    stroke="#e5c3cd"
                    strokeWidth="1.2"
                >
                    <path d="M130 70l50-34 50 34z" />
                    <rect x="140" y="70" width="80" height="6" />
                    {[146, 164, 182, 200, 214].map((x) => (
                        <rect key={x} x={x} y="76" width="4" height="46" />
                    ))}
                    <rect x="134" y="120" width="92" height="6" />
                </g>
                <Bloom x={120} y={120} r={12} tone="blush" />
                <Bloom x={240} y={122} r={12} tone="blush" />
                {/* balustrade */}
                <g fill="#ffffff" stroke="#ddd3dd">
                    <rect x="0" y="128" width="360" height="8" />
                    {Array.from({ length: 19 }, (_, i) => (
                        <path
                            key={i}
                            d={`M${10 + i * 19} 136c-4 6 4 10 0 16c-4 6 4 8 0 12h6c-4-4 4-6 0-12c-4-6 4-10 0-16z`}
                        />
                    ))}
                    <rect x="0" y="162" width="360" height="8" />
                </g>
            </svg>
        </>
    );
}

/** Gold crest with the couple's initials. */
export function MonogramCrest({ letters }: { letters: string }) {
    const ids = useIds('gold', 'cream');

    return (
        <svg
            viewBox="0 0 120 140"
            aria-hidden
            className="h-32 w-28 drop-shadow-md"
        >
            <defs>
                <GoldGradient id={ids.gold} />
                <radialGradient id={ids.cream} cx="0.5" cy="0.4" r="0.7">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#f6ede2" />
                </radialGradient>
            </defs>
            {/* scrolls */}
            <g
                fill="none"
                stroke={`url(#${ids.gold})`}
                strokeWidth="2.4"
                strokeLinecap="round"
            >
                <path d="M16 30c-12-4-14-18-2-20c8 0 8 10 2 10" />
                <path d="M104 30c12-4 14-18 2-20c-8 0-8 10-2 10" />
                <path d="M22 118c-14 6-18 18-6 20c8 0 8-10 2-10" />
                <path d="M98 118c14 6 18 18 6 20c-8 0-8-10-2-10" />
            </g>
            <path
                d="M60 8c16 8 30 10 44 8c2 40 0 70-10 88c-8 14-20 24-34 30c-14-6-26-16-34-30C16 86 14 56 16 16c14 2 28 0 44-8z"
                fill={`url(#${ids.cream})`}
                stroke={`url(#${ids.gold})`}
                strokeWidth="4"
            />
            <path
                d="M60 17c13 6 24 8 36 7c1 34-1 59-9 74c-7 12-16 20-27 25c-11-5-20-13-27-25c-8-15-10-40-9-74c12 1 23-1 36-7z"
                fill="none"
                stroke={`url(#${ids.gold})`}
                strokeWidth="1.2"
                strokeOpacity="0.8"
            />
            <path d="M52 8l8-8 8 8-8 5z" fill={`url(#${ids.gold})`} />
            <text
                x="60"
                y="84"
                textAnchor="middle"
                fontFamily={SCRIPT_FONT}
                fontSize={letters.length > 1 ? 44 : 60}
                fill={`url(#${ids.gold})`}
            >
                {letters}
            </text>
        </svg>
    );
}

/** The gold cartouche that holds the guest's name. */
function NamePlaque({ children }: { children: ReactNode }) {
    const ids = useIds('gold');

    return (
        <div className="relative w-full max-w-[19rem]">
            <svg
                viewBox="0 0 300 70"
                aria-hidden
                className="w-full drop-shadow-md"
            >
                <defs>
                    <GoldGradient id={ids.gold} />
                </defs>
                <path
                    d="M30 6h240l14 12c6 5 10 10 14 17c-4 7-8 12-14 17l-14 12H30L16 52C10 47 6 42 2 35c4-7 8-12 14-17z"
                    fill="#fffdfb"
                    stroke={`url(#${ids.gold})`}
                    strokeWidth="4"
                />
                <path
                    d="M34 13h232l10 9c4 4 7 8 10 13c-3 5-6 9-10 13l-10 9H34l-10-9c-4-4-7-8-10-13c3-5 6-9 10-13z"
                    fill="none"
                    stroke={`url(#${ids.gold})`}
                    strokeWidth="1.2"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center px-10">
                {children}
            </div>
        </div>
    );
}

export function GardenCover({
    data,
    guestName,
    motion,
    onScrollDown,
}: CoverProps) {
    const english = data.lang === 'en';

    return (
        <section
            className="relative flex min-h-[700px] flex-col items-center overflow-hidden text-center"
            style={{
                background:
                    'linear-gradient(180deg, #f9c9d2 0%, #f7bfc9 30%, #fbd9dc 58%, #fdeee8 100%)',
            }}
        >
            <Scenery />

            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[15%]">
                <Column side="left" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[15%]">
                <Column side="right" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
                <Arch />
            </div>
            <svg
                viewBox="0 0 360 120"
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 z-20 w-full"
            >
                <Cluster x={30} y={96} scale={0.8} />
                <Cluster x={330} y={96} scale={0.8} flip />
            </svg>

            <div className="relative z-30 flex w-full flex-1 flex-col items-center px-[17%] pt-[34%] pb-10">
                <Rise motion={motion} step={0}>
                    <p
                        className="text-[44px] leading-none"
                        style={{ ...GOLD_TEXT, fontFamily: SCRIPT_FONT }}
                    >
                        Wedding Day
                    </p>
                    {!english && (
                        <p
                            className="mt-2 text-[15px] leading-[1.8]"
                            style={{ ...GOLD_TEXT, fontFamily: TITLE_FONT }}
                        >
                            {data.title}
                        </p>
                    )}
                </Rise>

                <Rise motion={motion} step={1} className="mt-3">
                    <MonogramCrest letters={data.monogram} />
                </Rise>

                {!data.hideHosts && data.hostLeft && (
                    <Rise motion={motion} step={2} className="mt-2">
                        <p
                            className={
                                english
                                    ? 'text-[26px] leading-tight'
                                    : 'text-[15px] leading-[1.9]'
                            }
                            style={{
                                ...GOLD_TEXT,
                                fontFamily: english ? SCRIPT_FONT : TITLE_FONT,
                            }}
                        >
                            {data.hostLeft}
                            {data.hostRight && (
                                <>
                                    <span
                                        className="mx-2 text-sm"
                                        style={{ color: '#b98a3a' }}
                                    >
                                        {data.joiner}
                                    </span>
                                    {data.hostRight}
                                </>
                            )}
                        </p>
                    </Rise>
                )}

                <Rise motion={motion} step={3} className="mt-auto pt-4">
                    <p
                        className="text-[30px] leading-tight"
                        style={{ ...GOLD_TEXT, fontFamily: SCRIPT_FONT }}
                    >
                        Wedding Invitation
                    </p>
                </Rise>

                <Rise
                    motion={motion}
                    step={4}
                    className="mt-2 flex w-full justify-center"
                >
                    <NamePlaque>
                        <p
                            className="truncate text-[16px] leading-[1.9]"
                            style={{
                                ...GOLD_TEXT,
                                fontFamily: english ? SCRIPT_FONT : TITLE_FONT,
                                fontSize: english ? 22 : 15,
                            }}
                        >
                            {guestName}
                        </p>
                    </NamePlaque>
                </Rise>

                {data.dateText && (
                    <Rise motion={motion} step={5}>
                        <p
                            className="mt-3 text-[14px] font-semibold"
                            style={{ color: '#9c7433' }}
                        >
                            {data.dateText}
                        </p>
                    </Rise>
                )}

                <Rise motion={motion} step={6}>
                    <DaysToGo data={data} className="mt-2" />
                </Rise>

                {onScrollDown && (
                    <ScrollButton
                        label={data.copy.scrollDown}
                        onClick={onScrollDown}
                    />
                )}
            </div>
        </section>
    );
}
