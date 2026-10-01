import { Pop, Rise } from '../animations';
import { DaysToGo } from '../parts';
import { SCRIPT_FONT, SERIF_FONT, TITLE_FONT } from '../resolve';
import type { CoverProps } from './index';
import { KbachCorner } from './kbach';
import { FoilSeal, KbachCrest, NagaPillar } from './naga';
import { GOLD_TEXT, ScrollButton } from './shared';

/**
 * Naga Gold: a traditional Khmer card in chocolate stock and gold foil,
 * laid out as the unfolded card. Naga pillars stand on the side flaps, a
 * Kbach crest frames the couple's photo, the guest's name sits in a foil
 * bar, and a seal closes the foot.
 */
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
        <section className="relative flex min-h-[760px] flex-col items-center overflow-hidden px-16 pt-9 pb-28 text-center">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-3 rounded-sm border-2 border-[#d4a445]/60"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-[18px] rounded-sm border border-[#d4a445]/30"
            />
            <NagaPillar className="pointer-events-none absolute top-10 left-3 w-[54px]" />
            <NagaPillar className="pointer-events-none absolute top-10 right-3 w-[54px] -scale-x-100" />
            <KbachCorner className="pointer-events-none absolute bottom-1 left-1 w-24 -scale-y-100" />
            <KbachCorner className="pointer-events-none absolute right-1 bottom-1 w-24 -scale-100" />

            <Rise motion={motion} step={0}>
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

            <Rise motion={motion} step={1} className="mt-2">
                <KbachCrest
                    src={media.cover}
                    letters={data.monogram}
                    className="w-48 drop-shadow-xl"
                />
            </Rise>

            {!data.hideHosts && data.hostLeft && (
                <div className="mt-1 w-full">
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
