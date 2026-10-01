import { Pop, Rise } from '../animations';
import { DaysToGo } from '../parts';
import { SCRIPT_FONT, SERIF_FONT, TITLE_FONT } from '../resolve';
import type { CoverProps } from './index';
import { AngkorFacade, FoilSeal, KhmerDoorway, NagaBalustrade } from './naga';
import { GOLD_TEXT, ScrollButton } from './shared';

/**
 * Naga Gold: a traditional Khmer card in chocolate stock and gold foil.
 * Angkor Wat rises over the title, the couple's photo stands in a Banteay
 * Srei doorway, the guest's name sits in a foil bar, and the causeway's
 * naga balustrade runs along the foot.
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
        <section className="relative flex min-h-[760px] flex-col items-center overflow-hidden px-9 pt-8 pb-32 text-center">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-3 rounded-sm border-2 border-[#d4a445]/60"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-[18px] rounded-sm border border-[#d4a445]/30"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-5 bottom-4"
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

            <Rise motion={motion} step={1} className="mt-2">
                <KhmerDoorway
                    src={media.cover}
                    letters={data.monogram}
                    className="w-52 drop-shadow-xl"
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
