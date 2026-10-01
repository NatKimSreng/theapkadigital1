import { Pop, Rise } from '../animations';
import { photoFocus } from '../heroes';
import { SectionMotif } from '../motifs';
import { DaysToGo } from '../parts';
import { SCRIPT_FONT, SERIF_FONT, TITLE_FONT } from '../resolve';
import type { CoverProps } from './index';
import { KbachCorner } from './kbach';
import { AngkorFacade, FoilSeal, NagaBalustrade } from './naga';
import { Flame, GOLD_TEXT, ScrollButton, useIds } from './shared';
import { SpaceGold } from './temple';

/**
 * Naga Gold: a traditional Khmer card in chocolate stock and gold foil.
 * Carved Khmer columns run down both sides, Angkor Wat rises over the
 * title, the couple's photo sits in an ornate gold frame, the guest's name
 * in a foil bar, and the causeway's naga balustrade runs along the foot.
 */

// A carved Kbach leaf repeated down a column's shaft.
const SHAFT = `url("data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 24 30"><path d="M12 2C7 7 6 13 12 18C18 13 17 7 12 2Z" fill="#d9ad52"/><path d="M12 19c-5 0-8 4-8 9M12 19c5 0 8 4 8 9" fill="none" stroke="#d9ad52" stroke-width="1.3"/><circle cx="12" cy="24" r="1.6" fill="#d9ad52"/></svg>',
)}")`;

/** A carved column: Kbach-crowned capital, leaf-carved shaft, stepped base. */
function KhmerColumn({ className }: { className?: string }) {
    const ids = useIds('cap', 'base');

    return (
        <div aria-hidden className={`flex flex-col items-center ${className}`}>
            <svg viewBox="0 0 40 84" className="w-full shrink-0">
                <defs>
                    <SpaceGold id={ids.cap} height={84} />
                </defs>
                <g transform="translate(20 22)">
                    <Flame
                        x={0}
                        y={0}
                        angle={-38}
                        size={0.6}
                        fill={`url(#${ids.cap})`}
                    />
                    <Flame
                        x={0}
                        y={0}
                        angle={38}
                        size={0.6}
                        fill={`url(#${ids.cap})`}
                    />
                    <Flame
                        x={0}
                        y={1}
                        angle={0}
                        size={0.72}
                        fill={`url(#${ids.cap})`}
                    />
                </g>
                <path
                    d="M2 22h36v5H2zM6 30h28v3H6zM4 35h32v4H4zM6 41h28c-2 12-6 18-8 22H14c-2-4-6-10-8-22zM10 65h20v3H10zM8 70h24v3H8zM11 75h18v3H11z"
                    fill={`url(#${ids.cap})`}
                />
                <path
                    d="M12 43c1 7 3 12 5 18M20 43v18M28 43c-1 7-3 12-5 18"
                    stroke="#3a2614"
                    strokeOpacity="0.45"
                    strokeWidth="0.8"
                    fill="none"
                />
            </svg>
            <div
                className="w-[58%] flex-1 border-x-2 border-[#d9ad52] bg-black/15"
                style={{
                    backgroundImage: SHAFT,
                    backgroundSize: '100% auto',
                    backgroundRepeat: 'repeat-y',
                    backgroundPosition: 'center top',
                }}
            />
            <svg viewBox="0 0 40 44" className="w-full shrink-0">
                <defs>
                    <SpaceGold id={ids.base} height={44} />
                </defs>
                <path
                    d="M11 0h18v3H11zM8 5h24v3H8zM10 10h20c2 6 5 10 8 13H2c3-3 6-7 8-13zM4 25h32v5H4zM1 32h38v5H1zM0 39h40v5H0z"
                    fill={`url(#${ids.base})`}
                />
            </svg>
        </div>
    );
}

/** The couple's photo in a carved gilt frame with Kbach corners. */
function GoldFrame({
    src,
    letters,
    className,
}: {
    src: string | null;
    letters: string;
    className?: string;
}) {
    const corners = [
        '-top-3 -left-3',
        '-top-3 -right-3 -scale-x-100',
        '-bottom-3 -left-3 -scale-y-100',
        '-right-3 -bottom-3 -scale-100',
    ];

    return (
        <div
            className={`relative p-2.5 ${className}`}
            style={{
                background:
                    'linear-gradient(135deg, #f6e1a0 0%, #c99a3e 20%, #f3d27a 38%, #8a5f14 56%, #e9c46a 76%, #a8781f 100%)',
                boxShadow:
                    '0 14px 34px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,240,200,0.6)',
            }}
        >
            <div
                className="relative aspect-[4/5] overflow-hidden"
                style={{ boxShadow: '0 0 0 2px #6e4a10, 0 0 0 4px #f3d98f' }}
            >
                {src ? (
                    <img
                        src={src}
                        alt=""
                        className="size-full object-cover"
                        style={photoFocus(src)}
                    />
                ) : (
                    <div className="flex size-full items-center justify-center bg-black/30">
                        <span
                            className="text-5xl font-bold"
                            style={{ ...GOLD_TEXT, fontFamily: SERIF_FONT }}
                        >
                            {letters}
                        </span>
                    </div>
                )}
            </div>
            {corners.map((place) => (
                <KbachCorner
                    key={place}
                    className={`pointer-events-none absolute w-14 ${place}`}
                />
            ))}
        </div>
    );
}
export function FoilCover({
    data,
    media,
    guestName,
    motion,
    onScrollDown,
}: CoverProps) {
    const english = data.lang === 'en';
    const heading = {
        ...GOLD_TEXT,
        fontFamily: english ? SERIF_FONT : TITLE_FONT,
    };
    const names = {
        ...GOLD_TEXT,
        fontFamily: english ? SCRIPT_FONT : TITLE_FONT,
    };
    const nameClass = english
        ? 'text-[36px] leading-tight break-words'
        : 'text-[19px] leading-[1.9] break-words';

    return (
        <section className="relative flex min-h-[760px] flex-col items-center overflow-hidden px-[60px] pt-7 pb-32 text-center">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-3 rounded-sm border-2 border-[#d4a445]/60"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-[18px] rounded-sm border border-[#d4a445]/30"
            />
            <KhmerColumn className="pointer-events-none absolute top-6 bottom-6 left-[18px] w-9" />
            <KhmerColumn className="pointer-events-none absolute top-6 right-[18px] bottom-6 w-9" />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-[58px] bottom-5"
            >
                <NagaBalustrade className="w-full" />
            </div>

            <Rise motion={motion} step={0} className="w-full">
                <AngkorFacade className="w-full" />
            </Rise>

            <Rise motion={motion} step={0} className="mt-2">
                <h1
                    className={
                        english
                            ? 'text-[15px] font-semibold tracking-[0.28em] uppercase'
                            : 'text-[21px] leading-[1.8]'
                    }
                    style={heading}
                >
                    {data.title}
                </h1>
            </Rise>

            <Rise motion={motion} step={1} className="w-full">
                <SectionMotif
                    motif="kbach"
                    primary={data.primary}
                    secondary={data.secondary}
                />
            </Rise>

            <Rise motion={motion} step={1} className="mt-3 w-[13.5rem]">
                <GoldFrame src={media.cover} letters={data.monogram} />
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
                step={5}
                className="mt-1 flex w-full items-center"
            >
                <span
                    aria-hidden
                    className="size-2.5 shrink-0 rotate-45 bg-[#d4a445]"
                />
                <span aria-hidden className="h-0.5 w-3 shrink-0 bg-[#d4a445]" />
                <div className="min-w-0 flex-1 rounded-sm border-2 border-[#d4a445] bg-black/15 px-3 py-1 shadow-inner">
                    <p
                        className="truncate text-[16px] leading-[1.9]"
                        style={heading}
                    >
                        {guestName}
                    </p>
                </div>
                <span aria-hidden className="h-0.5 w-3 shrink-0 bg-[#d4a445]" />
                <span
                    aria-hidden
                    className="size-2.5 shrink-0 rotate-45 bg-[#d4a445]"
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

            <Rise motion={motion} step={7} className="mt-4">
                <FoilSeal className="w-12" />
            </Rise>

            {onScrollDown && (
                <ScrollButton
                    label={data.copy.scrollDown}
                    onClick={onScrollDown}
                    fill="rgba(40,26,20,0.6)"
                    icon="#e2bd66"
                />
            )}
        </section>
    );
}
