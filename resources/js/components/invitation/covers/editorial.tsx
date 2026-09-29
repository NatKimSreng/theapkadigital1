import { Rise } from '../animations';
import { photoFocus } from '../heroes';
import { Ornament } from '../ornaments';
import { DaysToGo } from '../parts';
import { SCRIPT_FONT, SERIF_FONT, TITLE_FONT, khmerDigits } from '../resolve';
import type { CoverProps } from './index';
import { WaxSeal } from './shared';

/**
 * Mocha Editorial: type-led and airy. Ivory stock, an oversized date, an
 * arch photo with a layered paper outline and a terracotta wax seal.
 */

function dateNumbers(date: string | null, khmer: boolean): string[] | null {
    if (!date) {
        return null;
    }

    const [year, month, day] = date.slice(0, 10).split('-');
    const numbers = [day, month, year.slice(2)];

    return khmer ? numbers.map(khmerDigits) : numbers;
}

export function EditorialCover({
    data,
    media,
    guestName,
    motion,
    onScrollDown,
}: CoverProps) {
    const english = data.lang === 'en';
    const numbers = dateNumbers(data.eventDate, !english);
    const mocha = data.primary;
    const terracotta = data.secondary;
    // Letter-spacing suits English small caps but pulls Khmer apart.
    const caps = english ? 'tracking-[0.35em] uppercase' : '';

    return (
        <section className="relative flex min-h-[720px] flex-col px-8 pt-10 pb-12">
            <Rise
                motion={motion}
                step={0}
                className={`flex items-center justify-between font-semibold ${english ? 'text-[10px]' : 'text-[12px]'} ${caps}`}
            >
                <span
                    style={{
                        color: terracotta,
                        fontFamily: english ? undefined : TITLE_FONT,
                    }}
                >
                    {english ? data.copy.saveDate : data.title}
                </span>
                <span
                    aria-hidden
                    className="mx-3 h-px flex-1"
                    style={{ background: `${mocha}55` }}
                />
                <span style={{ color: mocha }}>
                    {numbers ? `№ ${numbers[2]}` : '№'}
                </span>
            </Rise>

            {numbers && (
                <Rise motion={motion} step={1} className="mt-4">
                    <p
                        className="flex items-center justify-between text-[64px] leading-none font-light tabular-nums"
                        style={{ color: mocha, fontFamily: SERIF_FONT }}
                    >
                        {numbers.flatMap((part, index) => [
                            index > 0 && (
                                <span
                                    key={`dot-${index}`}
                                    aria-hidden
                                    className="size-2 rounded-full"
                                    style={{ background: terracotta }}
                                />
                            ),
                            <span key={index}>{part}</span>,
                        ])}
                    </p>
                </Rise>
            )}

            <Rise motion={motion} step={2} className="relative mt-7 self-start">
                <div
                    aria-hidden
                    className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-full border"
                    style={{ borderColor: `${mocha}88` }}
                />
                <div className="relative h-72 w-52 overflow-hidden rounded-t-full shadow-xl">
                    {media.cover ? (
                        <img
                            src={media.cover}
                            alt=""
                            className="size-full object-cover"
                            style={photoFocus(media.cover)}
                        />
                    ) : (
                        <div
                            className="flex size-full items-center justify-center"
                            style={{ background: `${terracotta}22` }}
                        >
                            <Ornament
                                type={data.theme.ornament}
                                primary={mocha}
                                secondary={terracotta}
                                className="size-28"
                            />
                        </div>
                    )}
                </div>
                <div className="absolute -top-3 -right-10">
                    <WaxSeal
                        color={data.theme.seal ?? terracotta}
                        letters={data.monogram}
                        className="size-20 rotate-[-8deg]"
                    />
                </div>
            </Rise>

            {!data.hideHosts && data.hostLeft && (
                <Rise motion={motion} step={3} className="mt-8 text-right">
                    <p
                        className={
                            english
                                ? 'text-[40px] leading-[0.95]'
                                : 'text-[18px] leading-[1.9]'
                        }
                        style={{
                            color: mocha,
                            fontFamily: english ? SCRIPT_FONT : TITLE_FONT,
                        }}
                    >
                        {data.hostLeft}
                    </p>
                    {data.hostRight && (
                        <p
                            className={
                                english
                                    ? 'text-[40px] leading-[0.95]'
                                    : 'text-[18px] leading-[1.9]'
                            }
                            style={{
                                color: mocha,
                                fontFamily: english ? SCRIPT_FONT : TITLE_FONT,
                            }}
                        >
                            <span
                                className="mr-2 text-[18px]"
                                style={{
                                    color: terracotta,
                                    fontFamily: SERIF_FONT,
                                }}
                            >
                                {data.joiner}
                            </span>
                            {data.hostRight}
                        </p>
                    )}
                </Rise>
            )}

            <Rise motion={motion} step={4} className="mt-6">
                <div
                    className="flex items-end justify-between gap-4 border-t pt-4"
                    style={{ borderColor: `${mocha}33` }}
                >
                    <div className="min-w-0">
                        <p
                            className={`text-[10px] font-semibold ${english ? 'tracking-[0.3em] uppercase' : 'text-[12px]'}`}
                            style={{ color: terracotta }}
                        >
                            {data.inviteLine}
                        </p>
                        <p
                            className={`mt-1 truncate text-[20px] ${english ? 'italic' : ''}`}
                            style={{
                                color: mocha,
                                fontFamily: english ? SERIF_FONT : TITLE_FONT,
                                fontSize: english ? 22 : 15,
                            }}
                        >
                            {guestName}
                        </p>
                    </div>
                    <div
                        className={`shrink-0 text-right text-[11px] leading-5 ${english ? 'tracking-wide uppercase' : ''}`}
                        style={{ color: mocha }}
                    >
                        {data.dateParts?.weekday}
                        {data.timeText && <br />}
                        {data.timeText}
                    </div>
                </div>
                {data.venueText && (
                    <p
                        className={`mt-3 text-[12px] ${english ? 'tracking-wide' : ''}`}
                        style={{ color: `${mocha}cc` }}
                    >
                        {data.venueText}
                    </p>
                )}
            </Rise>

            <Rise motion={motion} step={5}>
                <DaysToGo data={data} className="mt-4" />
            </Rise>

            {onScrollDown && (
                <button
                    type="button"
                    onClick={onScrollDown}
                    className={`mt-8 flex flex-col items-center self-center font-semibold ${english ? 'text-[10px]' : 'text-[12px]'} ${caps}`}
                    style={{ color: terracotta }}
                >
                    {data.copy.scrollDown}
                    <span
                        aria-hidden
                        className="mt-2 h-10 w-px animate-pulse"
                        style={{ background: terracotta }}
                    />
                </button>
            )}
        </section>
    );
}
