import { Rise } from '../animations';
import { photoFocus } from '../heroes';
import { Ornament } from '../ornaments';
import { DaysToGo } from '../parts';
import { SERIF_FONT, TITLE_FONT } from '../resolve';
import type { CoverProps } from './index';
import { Flame, GOLD_TEXT, GoldGradient, ScrollButton, useIds } from './shared';

/**
 * Kbach Royal: traditional Khmer. Crimson velvet, gold Kbach flame scrolls,
 * a tiered temple roof with chovea horns, a temple-doorway photo frame and
 * Angkor Wat over lotus buds.
 */

/** A Kbach corner: a curling stem with flame leaves, for the top-left corner. */
export function KbachCorner({ className }: { className?: string }) {
    const ids = useIds('gold');
    const gold = `url(#${ids.gold})`;

    return (
        <svg viewBox="0 0 120 120" aria-hidden className={className}>
            <defs>
                <GoldGradient id={ids.gold} />
            </defs>
            <g
                fill="none"
                stroke={gold}
                strokeWidth="2.6"
                strokeLinecap="round"
            >
                <path d="M10 116V44C10 24 24 10 44 10H116" />
                <path d="M44 10C30 22 30 42 44 46C54 49 60 38 52 32C46 28 40 34 44 38" />
            </g>
            <Flame x={10} y={78} angle={-20} fill={gold} />
            <Flame x={10} y={104} angle={-20} size={0.8} fill={gold} />
            <Flame x={78} y={10} angle={110} fill={gold} />
            <Flame x={104} y={10} angle={110} size={0.8} fill={gold} />
            <Flame x={30} y={30} angle={-45} size={1.25} fill={gold} />
            <Flame x={58} y={40} angle={60} size={0.9} fill={gold} />
            <Flame x={40} y={58} angle={-150} size={0.9} fill={gold} />
            <circle cx="10" cy="116" r="3" fill={gold} />
            <circle cx="116" cy="10" r="3" fill={gold} />
        </svg>
    );
}

/** A tiered Khmer temple roof with chovea horns and a lotus spire. */
function TempleRoof() {
    const ids = useIds('gold', 'roof');
    const gold = `url(#${ids.gold})`;

    // A chovea: the roof end curling up and out like a naga's head.
    const chovea = (x: number, y: number, flip: boolean, scale = 1) => (
        <path
            d="M0 0C-6-2-10-10-6-18C-3-23 4-22 4-16C4-12-1-11-2-14"
            fill="none"
            stroke={gold}
            strokeWidth="2.4"
            strokeLinecap="round"
            transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
        />
    );

    return (
        <svg viewBox="0 0 240 132" aria-hidden className="w-[74%]">
            <defs>
                <GoldGradient id={ids.gold} />
                <linearGradient id={ids.roof} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#5a0a15" />
                    <stop offset="1" stopColor="#3a050d" />
                </linearGradient>
            </defs>
            {/* spire */}
            <path
                d="M120 2c4 6 4 12 0 16c-4-4-4-10 0-16zM112 30h16l-3-12h-10zM108 42h24l-4-12h-16z"
                fill={gold}
            />
            {/* upper gable */}
            <path
                d="M62 78L120 38L178 78Z"
                fill={`url(#${ids.roof})`}
                stroke={gold}
                strokeWidth="2.4"
                strokeLinejoin="round"
            />
            <path
                d="M80 74L120 48L160 74"
                fill="none"
                stroke={gold}
                strokeWidth="1.1"
            />
            {chovea(62, 78, false, 0.8)}
            {chovea(178, 78, true, 0.8)}
            {/* lower gable */}
            <path
                d="M20 122L120 58L220 122Z"
                fill={`url(#${ids.roof})`}
                stroke={gold}
                strokeWidth="2.6"
                strokeLinejoin="round"
            />
            <path
                d="M44 118L120 70L196 118"
                fill="none"
                stroke={gold}
                strokeWidth="1.2"
            />
            {chovea(20, 122, false)}
            {chovea(220, 122, true)}
            {/* pediment fleuron */}
            <g transform="translate(120 104)">
                <Flame x={0} y={0} angle={-30} size={0.7} fill={gold} />
                <Flame x={0} y={0} angle={30} size={0.7} fill={gold} />
                <Flame x={0} y={2} angle={0} size={0.85} fill={gold} />
            </g>
            <path d="M14 126H226" stroke={gold} strokeWidth="2" />
        </svg>
    );
}

/** The couple's photo inside a temple doorway with a pointed arch. */
function DoorwayPhoto({
    src,
    primary,
    secondary,
    ornament,
}: {
    src: string | null;
    primary: string;
    secondary: string;
    ornament: 'frame' | 'rings' | 'balloons' | 'house' | 'hearts';
}) {
    const ids = useIds('gold', 'clip');
    const door = 'M12 256V112C12 66 58 44 100 8C142 44 188 66 188 112V256Z';

    return (
        <svg viewBox="0 0 200 264" className="w-52 drop-shadow-xl">
            <defs>
                <GoldGradient id={ids.gold} />
                <clipPath id={ids.clip}>
                    <path d={door} />
                </clipPath>
            </defs>
            {src ? (
                <foreignObject
                    x="0"
                    y="0"
                    width="200"
                    height="264"
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
                    <path d={door} fill="rgba(0,0,0,0.25)" />
                    <foreignObject x="40" y="90" width="120" height="120">
                        <Ornament
                            type={ornament}
                            primary={primary}
                            secondary={secondary}
                            className="size-full"
                        />
                    </foreignObject>
                </>
            )}
            <path
                d={door}
                fill="none"
                stroke={`url(#${ids.gold})`}
                strokeWidth="6"
            />
            <path
                d="M22 250V114C22 72 64 52 100 20C136 52 178 72 178 114V250"
                fill="none"
                stroke={`url(#${ids.gold})`}
                strokeWidth="1.4"
            />
            <g transform="translate(100 8)">
                <Flame
                    x={0}
                    y={0}
                    angle={0}
                    size={0.9}
                    fill={`url(#${ids.gold})`}
                />
            </g>
        </svg>
    );
}

/** Angkor Wat's five towers over a row of lotus buds. */
function AngkorBand() {
    const ids = useIds('gold');
    const gold = `url(#${ids.gold})`;

    return (
        <svg viewBox="0 0 360 90" aria-hidden className="w-full">
            <defs>
                <GoldGradient id={ids.gold} />
            </defs>
            <g
                fill="none"
                stroke={gold}
                strokeWidth="1.4"
                strokeLinejoin="round"
                opacity="0.55"
            >
                <path d="M96 62h168" />
                <path d="M108 62v-16l6-10 6 10v16M140 62v-24l8-16 8 16v24M172 62V26l8-22 8 22v36M204 62v-24l8-16 8 16v24M240 62v-16l6-10 6 10v16" />
                <path d="M120 62v-8h120v8" />
            </g>
            {Array.from({ length: 13 }, (_, i) => (
                <path
                    key={i}
                    d="M0 0c-5-6-5-13 0-18c5 5 5 12 0 18z"
                    fill={gold}
                    opacity={0.75}
                    transform={`translate(${36 + i * 24} 84)`}
                />
            ))}
            <path
                d="M20 86H340"
                stroke={gold}
                strokeWidth="1.2"
                opacity="0.6"
            />
        </svg>
    );
}

export function KbachCover({
    data,
    media,
    guestName,
    motion,
    onScrollDown,
}: CoverProps) {
    const english = data.lang === 'en';
    const nameStyle = {
        ...GOLD_TEXT,
        fontFamily: english ? SERIF_FONT : TITLE_FONT,
    };

    return (
        <section className="relative flex min-h-[720px] flex-col items-center overflow-hidden px-8 pt-8 pb-28 text-center">
            {/* double gold border with Kbach corners */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-3 rounded-sm border-2 border-[#d4a445]/70"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-[18px] rounded-sm border border-[#d4a445]/40"
            />
            <KbachCorner className="pointer-events-none absolute top-1 left-1 w-24" />
            <KbachCorner className="pointer-events-none absolute top-1 right-1 w-24 -scale-x-100" />
            <KbachCorner className="pointer-events-none absolute bottom-1 left-1 w-24 -scale-y-100" />
            <KbachCorner className="pointer-events-none absolute right-1 bottom-1 w-24 -scale-100" />

            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-3"
            >
                <AngkorBand />
            </div>

            <Rise
                motion={motion}
                step={0}
                className="flex w-full justify-center"
            >
                <TempleRoof />
            </Rise>

            <Rise motion={motion} step={1}>
                <h1
                    className={
                        english
                            ? 'mt-3 text-[22px] font-semibold tracking-[0.2em] uppercase'
                            : 'mt-3 text-[22px] leading-[1.8]'
                    }
                    style={nameStyle}
                >
                    {data.title}
                </h1>
            </Rise>

            <Rise motion={motion} step={2} className="mt-3">
                <DoorwayPhoto
                    src={media.cover}
                    primary={data.primary}
                    secondary={data.secondary}
                    ornament={data.theme.ornament}
                />
            </Rise>

            {!data.hideHosts && data.hostLeft && (
                <Rise motion={motion} step={3} className="mt-4 w-full">
                    <p
                        className={
                            english
                                ? 'text-[20px] font-semibold tracking-wide'
                                : 'text-[17px] leading-[1.9]'
                        }
                        style={nameStyle}
                    >
                        {data.hostLeft}
                        {data.hostRight && (
                            <>
                                <span
                                    className="mx-2 text-sm"
                                    style={{ color: data.secondary }}
                                >
                                    {data.joiner}
                                </span>
                                {data.hostRight}
                            </>
                        )}
                    </p>
                </Rise>
            )}

            <Rise motion={motion} step={4} className="mt-4">
                <p className="text-[15px] leading-[1.8]" style={nameStyle}>
                    {data.inviteLine}
                </p>
            </Rise>

            <Rise
                motion={motion}
                step={5}
                className="mt-2 flex w-full items-center gap-2"
            >
                <span
                    aria-hidden
                    className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d4a445]"
                />
                <div className="min-w-0 rounded-full border-2 border-[#d4a445] bg-black/20 px-5 py-2 shadow-inner">
                    <p
                        className="truncate text-[16px] leading-[1.9]"
                        style={nameStyle}
                    >
                        {guestName}
                    </p>
                </div>
                <span
                    aria-hidden
                    className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d4a445]"
                />
            </Rise>

            {data.dateText && (
                <Rise motion={motion} step={6}>
                    <p
                        className="mt-4 text-[14px] font-semibold"
                        style={{ color: data.secondary }}
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
                    fill="rgba(60,5,15,0.55)"
                    icon="#e9c46a"
                />
            )}
        </section>
    );
}
