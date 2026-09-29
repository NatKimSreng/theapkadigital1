import { Rise } from '../animations';
import { photoFocus } from '../heroes';
import { Ornament } from '../ornaments';
import { DaysToGo } from '../parts';
import { SCRIPT_FONT, SERIF_FONT, TITLE_FONT } from '../resolve';
import type { CoverProps } from './index';
import {
    GOLD_TEXT,
    GoldGradient,
    ScrollButton,
    WaxSeal,
    useIds,
} from './shared';

/**
 * Emerald Velvet: emerald velvet with a sheen, the couple's photo in an
 * arch-shaped die-cut, a translucent vellum band with their names and a
 * gold wax seal.
 */

/** A gold olive sprig curving from the top corner. */
function Sprig({ className }: { className?: string }) {
    const ids = useIds('gold');
    const gold = `url(#${ids.gold})`;

    return (
        <svg viewBox="0 0 140 90" aria-hidden className={className}>
            <defs>
                <GoldGradient id={ids.gold} />
            </defs>
            <path
                d="M4 6C40 10 80 26 132 80"
                fill="none"
                stroke={gold}
                strokeWidth="1.6"
            />
            {[
                [26, 9, 20],
                [46, 15, 30],
                [66, 25, 40],
                [86, 38, 48],
                [104, 52, 55],
                [120, 68, 60],
            ].map(([x, y, angle]) => (
                <g key={x} transform={`translate(${x} ${y}) rotate(${angle})`}>
                    <ellipse
                        cx="0"
                        cy="-7"
                        rx="3.2"
                        ry="8"
                        fill={gold}
                        opacity="0.9"
                    />
                    <ellipse
                        cx="0"
                        cy="7"
                        rx="3.2"
                        ry="8"
                        fill={gold}
                        opacity="0.75"
                    />
                </g>
            ))}
        </svg>
    );
}

export function VelvetCover({
    data,
    media,
    guestName,
    motion,
    onScrollDown,
}: CoverProps) {
    const english = data.lang === 'en';
    const nameFont = english ? SCRIPT_FONT : TITLE_FONT;

    return (
        <section className="relative flex min-h-[720px] flex-col items-center overflow-hidden px-8 pt-16 pb-12 text-center">
            <Sprig className="pointer-events-none absolute top-0 left-0 w-28" />
            <Sprig className="pointer-events-none absolute top-0 right-0 w-28 -scale-x-100" />

            <Rise motion={motion} step={0}>
                <p
                    className="text-[11px] font-semibold tracking-[0.4em] uppercase"
                    style={GOLD_TEXT}
                >
                    {english ? 'The wedding of' : '✦'}
                </p>
                <h1
                    className={
                        english
                            ? 'mt-1 text-[20px] tracking-[0.25em] uppercase'
                            : 'mt-1 text-[20px] leading-[1.8]'
                    }
                    style={{
                        ...GOLD_TEXT,
                        fontFamily: english ? SERIF_FONT : TITLE_FONT,
                    }}
                >
                    {data.title}
                </h1>
            </Rise>

            <Rise motion={motion} step={1} className="relative mt-5 w-full">
                {/* the arch die-cut: an outer gold line, then the photo window */}
                <div className="relative mx-auto w-60">
                    <div
                        aria-hidden
                        className="absolute -inset-2.5 rounded-t-full border border-[#d9b45a]/60"
                    />
                    <div className="relative h-80 overflow-hidden rounded-t-full border-2 border-[#d9b45a] shadow-[inset_0_8px_24px_rgba(0,0,0,0.45)]">
                        {media.cover ? (
                            <img
                                src={media.cover}
                                alt=""
                                className="size-full object-cover"
                                style={photoFocus(media.cover)}
                            />
                        ) : (
                            <div className="flex size-full items-center justify-center bg-black/20">
                                <Ornament
                                    type={data.theme.ornament}
                                    primary={data.primary}
                                    secondary={data.secondary}
                                    className="size-32"
                                />
                            </div>
                        )}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.35)]"
                        />
                    </div>
                </div>

                {/* the vellum band across the lower arch */}
                {!data.hideHosts && data.hostLeft && (
                    <div className="relative z-10 mx-auto -mt-20 w-[92%] border-y border-[#f1dfa6]/70 bg-[#fbf6ea]/35 px-4 pt-3 pb-8 shadow-lg backdrop-blur-md">
                        <p
                            className={
                                english
                                    ? 'text-[30px] leading-tight'
                                    : 'text-[16px] leading-[1.9]'
                            }
                            style={{ color: '#0b3b2e', fontFamily: nameFont }}
                        >
                            {data.hostLeft}
                        </p>
                        {data.hostRight && (
                            <>
                                <p
                                    className={`text-xs ${english ? 'tracking-[0.3em]' : ''}`}
                                    style={{ color: '#0b3b2e' }}
                                >
                                    {data.joiner}
                                </p>
                                <p
                                    className={
                                        english
                                            ? 'text-[30px] leading-tight'
                                            : 'text-[16px] leading-[1.9]'
                                    }
                                    style={{
                                        color: '#0b3b2e',
                                        fontFamily: nameFont,
                                    }}
                                >
                                    {data.hostRight}
                                </p>
                            </>
                        )}
                    </div>
                )}
                <div className="relative z-20 -mt-8 flex justify-center">
                    <WaxSeal
                        color={data.theme.seal ?? '#c9a24a'}
                        letters={data.monogram}
                        className="size-16"
                    />
                </div>
            </Rise>

            <Rise motion={motion} step={3} className="mt-4">
                <p
                    className={`text-[13px] ${english ? 'tracking-wide' : ''}`}
                    style={{ color: '#cfe0d6' }}
                >
                    {data.inviteLine}
                </p>
                <p
                    className="mt-1 max-w-72 truncate text-[22px]"
                    style={{
                        ...GOLD_TEXT,
                        fontFamily: english ? SCRIPT_FONT : TITLE_FONT,
                        fontSize: english ? 28 : 17,
                    }}
                >
                    {guestName}
                </p>
            </Rise>

            {data.dateText && (
                <Rise
                    motion={motion}
                    step={4}
                    className="mt-3 flex items-center gap-3"
                >
                    <span aria-hidden className="h-px w-8 bg-[#d9b45a]/70" />
                    <p
                        className={`text-[13px] font-semibold ${english ? 'tracking-[0.15em] uppercase' : ''}`}
                        style={{
                            color: '#f1dfa6',
                            fontFamily: english ? SERIF_FONT : undefined,
                        }}
                    >
                        {data.dateText}
                    </p>
                    <span aria-hidden className="h-px w-8 bg-[#d9b45a]/70" />
                </Rise>
            )}

            <Rise motion={motion} step={5}>
                <DaysToGo data={data} className="mt-3" />
            </Rise>

            {onScrollDown && (
                <ScrollButton
                    label={data.copy.scrollDown}
                    onClick={onScrollDown}
                    ring="#d9b45a"
                    fill="rgba(6,42,32,0.6)"
                    icon="#e8cc85"
                />
            )}
        </section>
    );
}
