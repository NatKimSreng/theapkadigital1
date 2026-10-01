import type { ReactNode } from 'react';
import { photoFocus } from '../heroes';
import { Flame, useIds } from './shared';
import { SpaceGold, Tower } from './temple';

/**
 * Gold-foil Khmer architecture for Naga Gold, drawn after real temples:
 * Angkor Wat's facade, a Banteay Srei doorway, and the seven-headed nagas
 * of the Angkor causeway.
 */

const f = (n: number) => Number(n.toFixed(1));

/** A chovea: a pediment's end curling up like a naga's head. */
const CHOVEA = 'M0 0C-6-2-10-10-6-18C-3-23 4-22 4-16C4-12-1-11-2-14';

/** A row of balustered windows along a gallery wall. */
function Windows({
    x1,
    x2,
    y,
    h,
    skip,
    stroke,
}: {
    x1: number;
    x2: number;
    y: number;
    h: number;
    skip: [number, number];
    stroke: string;
}) {
    const count = Math.floor((x2 - x1) / 12);

    return (
        <g stroke={stroke} strokeWidth="0.6" fill="rgba(0,0,0,0.25)">
            {Array.from({ length: count }, (_, i) => x1 + 3 + i * 12)
                .filter((x) => x + 6 < skip[0] || x > skip[1])
                .map((x) => (
                    <g key={x}>
                        <rect x={x} y={y} width="6" height={h} />
                        <path d={`M${x + 2} ${y}v${h}M${x + 4} ${y}v${h}`} />
                    </g>
                ))}
        </g>
    );
}

function Palm({ x, top, stroke }: { x: number; top: number; stroke: string }) {
    const fronds = [-165, -140, -115, -90, -65, -40, -15].map((deg) => {
        const a = (deg * Math.PI) / 180;
        const dx = Math.cos(a) * 15;
        const dy = Math.sin(a) * 15;

        return `M${x} ${top}q${f(dx / 2)} ${f(dy / 2 - 4)} ${f(dx)} ${f(dy + 3)}`;
    });

    return (
        <g stroke={stroke} fill="none" strokeLinecap="round">
            <path
                d={`M${x} 172C${x - 1} 150 ${x + 1} 125 ${x} ${top}`}
                strokeWidth="1.8"
            />
            <path d={fronds.join('')} strokeWidth="1.3" />
        </g>
    );
}

/**
 * Angkor Wat from the causeway: five lotus-bud towers over three stepped
 * galleries, the central gate, and sugar palms either side.
 */
export function AngkorFacade({
    className,
    fill = 'rgba(0,0,0,0.18)',
}: {
    className?: string;
    fill?: string;
}) {
    const ids = useIds('gold');
    const gold = `url(#${ids.gold})`;
    const level = (
        roof: string,
        wall: [number, number, number, number],
        windows: { y: number; h: number },
    ) => (
        <g>
            <path
                d={roof}
                fill={fill}
                stroke={gold}
                strokeWidth="1.2"
                strokeLinejoin="round"
            />
            <rect
                x={wall[0]}
                y={wall[1]}
                width={wall[2]}
                height={wall[3]}
                fill={fill}
                stroke={gold}
                strokeWidth="1.2"
            />
            <Windows
                x1={wall[0]}
                x2={wall[0] + wall[2]}
                y={windows.y}
                h={windows.h}
                skip={[140, 180]}
                stroke={gold}
            />
        </g>
    );

    return (
        <svg viewBox="0 0 320 182" aria-hidden className={className}>
            <defs>
                <SpaceGold id={ids.gold} height={182} />
            </defs>
            <Palm x={16} top={86} stroke={gold} />
            <Palm x={34} top={108} stroke={gold} />
            <Palm x={304} top={86} stroke={gold} />
            <Palm x={286} top={108} stroke={gold} />

            <Tower cx={82} base={122} w={26} h={56} fill={fill} stroke={gold} />
            <Tower
                cx={238}
                base={122}
                w={26}
                h={56}
                fill={fill}
                stroke={gold}
            />
            <Tower
                cx={118}
                base={100}
                w={30}
                h={66}
                fill={fill}
                stroke={gold}
            />
            <Tower
                cx={202}
                base={100}
                w={30}
                h={66}
                fill={fill}
                stroke={gold}
            />
            <Tower cx={160} base={96} w={42} h={92} fill={fill} stroke={gold} />

            {level('M72 96H248L242 89H78Z', [78, 96, 164, 22], {
                y: 101,
                h: 13,
            })}
            <path
                d="M154 96h12l4 22h-20z"
                fill="rgba(0,0,0,0.3)"
                stroke={gold}
                strokeWidth="0.8"
            />
            <path
                d="M153 101h14M152 106h16M151 111h18"
                stroke={gold}
                strokeWidth="0.6"
            />
            {level('M38 124H282L276 117H44Z', [44, 124, 232, 22], {
                y: 129,
                h: 13,
            })}
            <path
                d="M150 124h20l4 22h-28z"
                fill="rgba(0,0,0,0.3)"
                stroke={gold}
                strokeWidth="0.8"
            />
            <path
                d="M149 130h22M148 135h24M147 140h26"
                stroke={gold}
                strokeWidth="0.6"
            />
            {level('M8 152H312L306 145H14Z', [14, 152, 292, 20], {
                y: 156,
                h: 12,
            })}

            {/* the central gate */}
            <path
                d="M138 136L160 120L182 136Z"
                fill={fill}
                stroke={gold}
                strokeWidth="1.2"
            />
            <rect
                x="142"
                y="136"
                width="36"
                height="36"
                fill={fill}
                stroke={gold}
                strokeWidth="1.2"
            />
            <rect
                x="154"
                y="148"
                width="12"
                height="24"
                fill="rgba(0,0,0,0.4)"
                stroke={gold}
                strokeWidth="0.8"
            />
            <Flame x={160} y={120} angle={0} size={0.4} fill={gold} />

            <path d="M0 172H320" stroke={gold} strokeWidth="1.6" />
            <path
                d="M40 177H280M90 181H230"
                stroke={gold}
                strokeWidth="0.8"
                opacity="0.5"
            />
        </svg>
    );
}

/**
 * A Banteay Srei doorway: a flame-edged pediment ending in naga curls, a
 * carved lintel, ringed colonnettes, and the couple's photo (or initials)
 * in the door.
 */
export function KhmerDoorway({
    src,
    letters,
    className,
    fill = 'rgba(0,0,0,0.2)',
}: {
    src?: string | null;
    letters: string;
    className?: string;
    fill?: string;
}) {
    const ids = useIds('gold', 'clip');
    const gold = `url(#${ids.gold})`;
    const door = { x: 42, y: 100, w: 136, h: 182 };
    // Flames along the pediment's naga edge, pointing outward.
    const edge = Array.from({ length: 9 }, (_, i) => {
        const t = (i + 1) / 10;
        const side = t < 0.5 ? -1 : 1;
        const u = side < 0 ? t * 2 : (1 - t) * 2;

        return {
            x: f(110 + side * 96 * (1 - u)),
            y: f(74 - 68 * Math.pow(u, 0.9)),
            angle: f(side * (60 - u * 50)),
        };
    });
    const colonnette = (x: number): ReactNode => (
        <g>
            <path d={`M${x - 3} 106h28l-3-8h-22z`} fill={gold} />
            <rect
                x={x}
                y={106}
                width={22}
                height={168}
                fill={fill}
                stroke={gold}
                strokeWidth="1.2"
            />
            {[118, 156, 196, 236].map((y) => (
                <g key={y} fill={gold}>
                    <rect x={x - 2} y={y} width={26} height={2.6} />
                    <rect x={x - 1} y={y + 4.5} width={24} height={2} />
                    <rect x={x - 2} y={y + 8.5} width={26} height={2.6} />
                </g>
            ))}
            <path
                d={`M${x + 11} 132v20M${x + 11} 170v22M${x + 11} 210v22M${x + 11} 250v20`}
                stroke={gold}
                strokeWidth="0.8"
            />
            <path d={`M${x - 3} 274h28l3 8h-34z`} fill={gold} />
        </g>
    );

    return (
        <svg viewBox="0 0 220 300" aria-hidden={!src} className={className}>
            <defs>
                <SpaceGold id={ids.gold} height={300} />
                <clipPath id={ids.clip}>
                    <rect
                        x={door.x}
                        y={door.y}
                        width={door.w}
                        height={door.h}
                    />
                </clipPath>
            </defs>

            {/* pediment */}
            {edge.map(({ x, y, angle }) => (
                <Flame
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    angle={angle}
                    size={0.42}
                    fill={gold}
                />
            ))}
            <path
                d="M14 76C42 72 72 44 110 6C148 44 178 72 206 76"
                fill="none"
                stroke={gold}
                strokeWidth="3"
                strokeLinecap="round"
            />
            <path
                d="M30 76C56 72 82 48 110 20C138 48 164 72 190 76Z"
                fill={fill}
                stroke={gold}
                strokeWidth="1.2"
            />
            <g transform="translate(110 70)">
                <Flame x={0} y={0} angle={-34} size={0.75} fill={gold} />
                <Flame x={0} y={0} angle={34} size={0.75} fill={gold} />
                <Flame x={0} y={2} angle={0} size={1} fill={gold} />
            </g>
            <path
                d={CHOVEA}
                fill="none"
                stroke={gold}
                strokeWidth="2.4"
                strokeLinecap="round"
                transform="translate(14 76)"
            />
            <path
                d={CHOVEA}
                fill="none"
                stroke={gold}
                strokeWidth="2.4"
                strokeLinecap="round"
                transform="translate(206 76) scale(-1 1)"
            />

            {/* carved lintel with a garland */}
            <rect
                x="16"
                y="76"
                width="188"
                height="24"
                fill={fill}
                stroke={gold}
                strokeWidth="1.4"
            />
            <path
                d="M26 86q8 8 16 0t16 0 16 0 16 0M130 86q8 8 16 0t16 0 16 0 16 0"
                fill="none"
                stroke={gold}
                strokeWidth="1.2"
            />
            {[34, 50, 66, 82, 138, 154, 170, 186].map((x) => (
                <circle key={x} cx={x} cy={93} r={1.4} fill={gold} />
            ))}
            <circle
                cx="110"
                cy="88"
                r="9"
                fill="none"
                stroke={gold}
                strokeWidth="1.4"
            />
            <circle cx="110" cy="88" r="4" fill={gold} />

            {colonnette(18)}
            {colonnette(180)}

            {/* the door */}
            {src ? (
                <foreignObject
                    x={door.x}
                    y={door.y}
                    width={door.w}
                    height={door.h}
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
                    <rect
                        x={door.x}
                        y={door.y}
                        width={door.w}
                        height={door.h}
                        fill="rgba(0,0,0,0.3)"
                    />
                    <text
                        x="110"
                        y="206"
                        textAnchor="middle"
                        fontFamily="'Cormorant Garamond', serif"
                        fontWeight="700"
                        fontSize={letters.length > 1 ? 46 : 58}
                        fill={gold}
                    >
                        {letters}
                    </text>
                </>
            )}
            <rect
                x={door.x}
                y={door.y}
                width={door.w}
                height={door.h}
                fill="none"
                stroke={gold}
                strokeWidth="3"
            />

            {/* threshold */}
            <rect
                x="6"
                y="282"
                width="208"
                height="8"
                fill={fill}
                stroke={gold}
                strokeWidth="1.2"
            />
            <rect x="0" y="290" width="220" height="10" fill={gold} />
        </svg>
    );
}

/**
 * A seven-headed naga as on the Angkor causeway: hooded heads fanned
 * under a crowning halo, rising from a scaled neck at (x, y).
 */
function NagaFan({
    x,
    y,
    scale,
    stroke,
}: {
    x: number;
    y: number;
    scale: number;
    stroke: string;
}) {
    const heads = [
        { angle: -75, size: 0.8 },
        { angle: 75, size: 0.8 },
        { angle: -50, size: 0.92 },
        { angle: 50, size: 0.92 },
        { angle: -25, size: 1.02 },
        { angle: 25, size: 1.02 },
        { angle: 0, size: 1.12 },
    ];

    return (
        <g transform={`translate(${x} ${y}) scale(${scale})`}>
            <path
                d="M-50-4A51 51 0 0 1 50-4"
                fill="none"
                stroke={stroke}
                strokeWidth="2.2"
            />
            <path
                d="M-56 0A56 56 0 0 1 56 0"
                fill="none"
                stroke={stroke}
                strokeWidth="0.8"
            />
            {heads.map(({ angle, size }) => (
                <g key={angle} transform={`rotate(${angle}) scale(${size})`}>
                    <path
                        d="M0-8C-2-12-7-20-7-29C-7-36-4-41 0-43C4-41 7-36 7-29C7-20 2-12 0-8Z"
                        fill={stroke}
                        stroke="#3a2614"
                        strokeOpacity="0.7"
                        strokeWidth="0.8"
                    />
                    <path d="M0-6V-14" stroke={stroke} strokeWidth="2.4" />
                    <path
                        d="M0-14V-32"
                        stroke="#3a2614"
                        strokeOpacity="0.45"
                        strokeWidth="0.7"
                    />
                    <circle cx="-2.6" cy="-35" r="1.1" fill="#3a2614" />
                    <circle cx="2.6" cy="-35" r="1.1" fill="#3a2614" />
                </g>
            ))}
            <path
                d="M-11 0C-13 12-13 22-11 34H11C13 22 13 12 11 0Z"
                fill={stroke}
            />
            <path
                d="M-11 9L0 14 11 9M-12 19L0 24 12 19M-11 29L0 34 11 29"
                fill="none"
                stroke="#3a2614"
                strokeOpacity="0.5"
                strokeWidth="0.8"
            />
        </g>
    );
}

/** A seven-headed naga on a scaled post, for the card's side flaps. */
export function NagaPillar({ className }: { className?: string }) {
    const ids = useIds('gold');
    const gold = `url(#${ids.gold})`;

    return (
        <svg viewBox="0 0 80 320" aria-hidden className={className}>
            <defs>
                <SpaceGold id={ids.gold} height={320} />
            </defs>
            <rect
                x="31"
                y="92"
                width="18"
                height="198"
                fill="rgba(0,0,0,0.2)"
                stroke={gold}
                strokeWidth="1.4"
            />
            <path
                d={Array.from(
                    { length: 21 },
                    (_, i) =>
                        `M31 ${100 + i * 9}L40 ${105 + i * 9}L49 ${100 + i * 9}`,
                ).join('')}
                fill="none"
                stroke={gold}
                strokeWidth="0.9"
            />
            {[140, 240].map((y) => (
                <rect key={y} x="28" y={y} width="24" height="4" fill={gold} />
            ))}
            <NagaFan x={40} y={66} scale={0.66} stroke={gold} />
            <path
                d="M26 290H54V298H26ZM20 298H60V306H20ZM14 306H66V316H14Z"
                fill={gold}
            />
        </svg>
    );
}

/**
 * The causeway balustrade: a naga's scaled body carried on short posts,
 * a seven-headed naga rearing at each end.
 */
export function NagaBalustrade({ className }: { className?: string }) {
    const ids = useIds('gold');
    const gold = `url(#${ids.gold})`;

    return (
        <svg viewBox="0 0 360 100" aria-hidden className={className}>
            <defs>
                <SpaceGold id={ids.gold} height={100} />
            </defs>
            {Array.from({ length: 8 }, (_, i) => 68 + i * 32).map((x) => (
                <rect
                    key={x}
                    x={x}
                    y={80}
                    width={8}
                    height={12}
                    fill={gold}
                    opacity="0.85"
                />
            ))}
            <rect x="34" y="70" width="292" height="11" rx="5.5" fill={gold} />
            <path
                d={Array.from(
                    { length: 36 },
                    (_, i) => `M${50 + i * 7.6} 72q3 4 0 7`,
                ).join('')}
                fill="none"
                stroke="#3a2614"
                strokeOpacity="0.45"
                strokeWidth="0.8"
            />
            <NagaFan x={38} y={46} scale={0.66} stroke={gold} />
            <NagaFan x={322} y={46} scale={0.66} stroke={gold} />
            <path d="M0 93H360" stroke={gold} strokeWidth="1.4" />
        </svg>
    );
}

/** The round gold seal at the foot of the card, with a lotus spire. */
export function FoilSeal({ className }: { className?: string }) {
    const ids = useIds('gold');
    const gold = `url(#${ids.gold})`;

    return (
        <svg viewBox="0 0 60 72" aria-hidden className={className}>
            <defs>
                <SpaceGold id={ids.gold} height={72} />
            </defs>
            <circle
                cx="30"
                cy="42"
                r="26"
                fill="none"
                stroke={gold}
                strokeWidth="2.4"
            />
            <circle
                cx="30"
                cy="42"
                r="21"
                fill="none"
                stroke={gold}
                strokeWidth="0.8"
            />
            <path
                d="M30 22c3 4 3 8 0 11c-3-3-3-7 0-11zM25 36h10l-1.5-3h-7zM22 42h16l-2-6H24zM19 50h22l-2-8H21zM16 56h28v3H16z"
                fill={gold}
            />
            <Flame x={30} y={16} angle={0} size={0.5} fill={gold} />
        </svg>
    );
}
