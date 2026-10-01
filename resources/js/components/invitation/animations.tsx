import { MailOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { InvitationMedia } from '@/types';
import { BaroqueCorner } from './baroque';
import { DEEP_GOLD_TEXT, GOLD_TEXT, WaxSeal } from './covers/shared';
import {
    AngkorFacade,
    FoilSeal,
    KhmerDoorway,
    NagaPillar,
} from './covers/naga';
import { TempleTowers } from './covers/temple';
import type { ResolvedInvitation } from './resolve';
import {
    SCRIPT_FONT,
    SERIF_FONT,
    TITLE_FONT,
    backgroundStyle,
    headlineStyle,
} from './resolve';

export type OpeningStyle =
    | 'doors'
    | 'envelope'
    | 'curtain'
    | 'fade'
    | 'seal'
    | 'card'
    | 'fold';
export type FallingEffect = 'none' | 'petals' | 'sparkles' | 'hearts';

export const OPENING_STYLES: OpeningStyle[] = [
    'doors',
    'envelope',
    'seal',
    'card',
    'fold',
    'curtain',
    'fade',
];
export const FALLING_EFFECTS: FallingEffect[] = [
    'none',
    'petals',
    'sparkles',
    'hearts',
];

/**
 * static: no animation (thumbnails); waiting: hidden behind the opening
 * cover; play: animate in now.
 */
export type Motion = 'static' | 'waiting' | 'play';

const OPENING_DURATION = 1900;

/** How long the opening plays before the invitation takes over, in ms. */
export function openingDuration(style: OpeningStyle): number {
    // Cards hold open while the names pop, so they run longer.
    if (style === 'card') {
        return 3500;
    }

    return style === 'fold' ? 3600 : OPENING_DURATION;
}

/**
 * Fades and lifts its content into place, staggered by `step`.
 */
export function Rise({
    motion,
    step,
    className,
    children,
}: {
    motion: Motion;
    step: number;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                motion === 'play' && 'inv-rise',
                motion === 'waiting' && 'opacity-0',
                className,
            )}
            style={
                motion === 'play'
                    ? { animationDelay: `${0.2 + step * 0.14}s` }
                    : undefined
            }
        >
            {children}
        </div>
    );
}

/**
 * Pops its content in with a little bounce, staggered by `step`.
 */
export function Pop({
    motion,
    step,
    className,
    children,
}: {
    motion: Motion;
    step: number;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                motion === 'play' && 'inv-pop',
                motion === 'waiting' && 'opacity-0',
                className,
            )}
            style={
                motion === 'play'
                    ? { animationDelay: `${0.35 + step * 0.2}s` }
                    : undefined
            }
        >
            {children}
        </div>
    );
}

/**
 * Reveals a section with a slide-up when it scrolls into view.
 */
export function Reveal({
    motion,
    children,
}: {
    motion: Motion;
    children: ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (motion === 'static' || !element) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 },
        );
        observer.observe(element);

        return () => observer.disconnect();
    }, [motion]);

    if (motion === 'static') {
        return <>{children}</>;
    }

    return (
        <div ref={ref} className="inv-reveal" data-visible={visible}>
            {children}
        </div>
    );
}

type OverlayProps = {
    data: ResolvedInvitation;
    media: InvitationMedia;
    guestName: string;
    opening: boolean;
    paper: boolean;
    onOpen: () => void;
};

export function OpeningOverlay({
    style,
    ...props
}: OverlayProps & { style: OpeningStyle }) {
    switch (style) {
        case 'envelope':
            return <EnvelopeOpening {...props} />;
        case 'seal':
            return <SealOpening {...props} />;
        case 'card':
            return <CardOpening {...props} />;
        case 'fold':
            return <FoldOpening {...props} />;
        case 'curtain':
            return <CurtainOpening {...props} />;
        case 'fade':
            return <FadeOpening {...props} />;
        default:
            return <DoorsOpening {...props} />;
    }
}

function Greeting({
    data,
    guestName,
    opening,
    onOpen,
    className,
}: {
    data: ResolvedInvitation;
    guestName: string;
    opening: boolean;
    onOpen: () => void;
    className?: string;
}) {
    const title = {
        ...headlineStyle(data, data.primary),
        fontFamily: TITLE_FONT,
    };

    return (
        <div
            className={cn(
                'relative z-10 flex flex-col items-center px-8 text-center transition-all duration-500',
                opening && 'pointer-events-none scale-90 opacity-0',
                className,
            )}
        >
            <p className="text-[20px] leading-[1.9]" style={title}>
                {data.copy.dear}
            </p>
            <p
                className="mt-4 text-[26px] leading-[1.8] break-words"
                style={title}
            >
                {guestName}
            </p>
            <div
                className="mt-3 h-px w-40"
                style={{ background: `${data.primary}88` }}
            />
            {!data.hideHosts && data.hostLeft && (
                <p className="mt-3 text-sm" style={{ color: data.secondary }}>
                    {data.hostLeft}
                    {data.hostRight && ` ${data.joiner} ${data.hostRight}`}
                </p>
            )}
            <button
                type="button"
                onClick={onOpen}
                className="inv-pulse mt-8 flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white shadow-lg"
                style={{ background: data.primary }}
            >
                <MailOpen className="size-5" />
                {data.copy.openInvitation}
            </button>
        </div>
    );
}

const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

function DoorsOpening({
    data,
    media,
    guestName,
    opening,
    paper,
    onOpen,
}: OverlayProps) {
    const door = (side: 'left' | 'right'): CSSProperties => ({
        ...backgroundStyle(data, media),
        transformOrigin: side === 'left' ? 'left center' : 'right center',
        transform: opening
            ? `rotateY(${side === 'left' ? -108 : 108}deg)`
            : 'rotateY(0deg)',
        transition: `transform 1.6s ${EASE}, box-shadow 1.6s ${EASE}`,
        boxShadow: opening
            ? '0 0 60px rgba(0,0,0,0.35)'
            : 'inset 0 0 40px rgba(0,0,0,0.08)',
        backfaceVisibility: 'hidden',
    });

    const panel = (side: 'left' | 'right') => (
        <div className="absolute inset-0">
            <div
                className="absolute inset-x-5 top-[8%] h-[46%] rounded-t-[999px] border-2"
                style={{ borderColor: `${data.primary}55` }}
            />
            <div
                className="absolute inset-x-5 top-[58%] bottom-[6%] rounded-sm border-2"
                style={{ borderColor: `${data.primary}55` }}
            />
            <span
                className={cn(
                    'absolute top-1/2 size-4 -translate-y-1/2 rounded-full border-2',
                    side === 'left' ? 'right-3' : 'left-3',
                )}
                style={{
                    borderColor: data.primary,
                    background: `${data.secondary}55`,
                }}
            />
            {paper && (
                <>
                    <BaroqueCorner
                        corner={side === 'left' ? 'top-left' : 'top-right'}
                        color={data.secondary}
                        className={cn(
                            'absolute top-0 w-32',
                            side === 'left' ? 'left-0' : 'right-0',
                        )}
                    />
                    <BaroqueCorner
                        corner={
                            side === 'left' ? 'bottom-left' : 'bottom-right'
                        }
                        color={data.secondary}
                        className={cn(
                            'absolute bottom-0 w-32',
                            side === 'left' ? 'left-0' : 'right-0',
                        )}
                    />
                </>
            )}
        </div>
    );

    return (
        <div
            className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden"
            style={{ perspective: '1800px', color: data.theme.text }}
        >
            <div
                className="absolute inset-y-0 left-0 w-1/2 border-r"
                style={{ ...door('left'), borderColor: `${data.primary}66` }}
            >
                {panel('left')}
            </div>
            <div
                className="absolute inset-y-0 right-0 w-1/2 border-l"
                style={{ ...door('right'), borderColor: `${data.primary}66` }}
            >
                {panel('right')}
            </div>
            <Greeting
                data={data}
                guestName={guestName}
                opening={opening}
                onOpen={onOpen}
                className="rounded-3xl bg-white/55 py-8 shadow-sm backdrop-blur-[2px]"
            />
        </div>
    );
}

function EnvelopeOpening({
    data,
    media,
    guestName,
    opening,
    onOpen,
}: OverlayProps) {
    const paper = '#fbf8f2';

    return (
        <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden px-6"
            style={{
                ...backgroundStyle(data, media),
                color: data.theme.text,
                opacity: opening ? 0 : 1,
                transition: `opacity 0.7s ease ${opening ? '1.2s' : '0s'}`,
            }}
        >
            <p
                className="mb-6 text-[20px] leading-[1.9] transition-opacity duration-500"
                style={{
                    ...headlineStyle(data, data.primary),
                    fontFamily: TITLE_FONT,
                    opacity: opening ? 0 : 1,
                }}
            >
                {data.copy.dear}
            </p>

            <div
                className="relative aspect-[4/3] w-full max-w-[340px]"
                style={{
                    perspective: '1200px',
                    transform: opening ? 'translateY(30%)' : 'none',
                    transition: `transform 0.8s ${EASE} 0.9s`,
                }}
            >
                <div
                    className="absolute inset-0 rounded-md shadow-xl"
                    style={{ background: `${data.secondary}` }}
                />
                <div
                    className="absolute inset-x-[6%] top-[8%] bottom-[6%] flex flex-col items-center justify-center rounded-sm px-4 text-center shadow"
                    style={{
                        background: paper,
                        transform: opening
                            ? 'translateY(-55%)'
                            : 'translateY(0)',
                        transition: `transform 0.8s ${EASE} 0.45s`,
                        zIndex: opening ? 3 : 1,
                    }}
                >
                    <p
                        className="text-[20px] leading-[1.8] break-words"
                        style={{
                            ...headlineStyle(data, data.primary),
                            fontFamily: TITLE_FONT,
                        }}
                    >
                        {guestName}
                    </p>
                    <p
                        className="mt-1 text-xs"
                        style={{ color: data.secondary }}
                    >
                        {data.title}
                    </p>
                </div>
                <div
                    className="absolute inset-0 rounded-md"
                    style={{
                        background: paper,
                        clipPath:
                            'polygon(0 0, 50% 66%, 100% 0, 100% 100%, 0 100%)',
                        zIndex: 2,
                        boxShadow: 'inset 0 -20px 40px rgba(0,0,0,0.05)',
                    }}
                />
                <div
                    className="absolute inset-x-0 top-0 h-[66%]"
                    style={{
                        background: `linear-gradient(180deg, ${paper}, #efe7d8)`,
                        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                        transformOrigin: 'top center',
                        transform: opening ? 'rotateX(180deg)' : 'rotateX(0)',
                        transition: `transform 0.6s ${EASE}`,
                        zIndex: opening ? 0 : 4,
                    }}
                />
                <button
                    type="button"
                    onClick={onOpen}
                    aria-label={data.copy.openInvitation}
                    className="inv-pulse absolute top-[66%] left-1/2 z-[5] flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-lg transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle at 35% 30%, ${data.secondary}, ${data.primary})`,
                        opacity: opening ? 0 : 1,
                    }}
                >
                    <MailOpen className="size-7" />
                </button>
            </div>

            <p
                className="mt-8 text-sm font-semibold transition-opacity duration-500"
                style={{ color: data.primary, opacity: opening ? 0 : 1 }}
            >
                {data.copy.openInvitation}
            </p>
        </div>
    );
}

/**
 * A closed envelope sealed with wax: tapping the seal breaks it, the flap
 * lifts and the card rises out before the envelope fades away.
 */
function SealOpening({
    data,
    media,
    guestName,
    opening,
    onOpen,
}: OverlayProps) {
    const envelope = data.theme.envelope ?? '#efe6d6';
    const seal = data.theme.seal ?? data.primary;
    const half = (side: 'left' | 'right'): CSSProperties => ({
        // The halves overlap a little so no seam shows before the seal breaks.
        clipPath: side === 'left' ? 'inset(0 49% 0 0)' : 'inset(0 0 0 50%)',
        transform: opening
            ? `translate(${side === 'left' ? '-60%' : '60%'}, 30%) rotate(${side === 'left' ? -35 : 35}deg)`
            : 'none',
        opacity: opening ? 0 : 1,
        transition: `transform 0.55s ${EASE}, opacity 0.45s ease 0.15s`,
    });

    return (
        <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden px-6"
            style={{
                ...backgroundStyle(data, media),
                color: data.theme.text,
                opacity: opening ? 0 : 1,
                transition: `opacity 0.6s ease ${opening ? '1.25s' : '0s'}`,
            }}
        >
            <p
                className="text-[15px] leading-[1.9] transition-opacity duration-500"
                style={{ color: data.secondary, opacity: opening ? 0 : 1 }}
            >
                {data.copy.dear}
            </p>
            <p
                className="mb-8 max-w-full truncate text-[22px] leading-[1.9] transition-opacity duration-500"
                style={{
                    ...headlineStyle(data, data.primary),
                    fontFamily: TITLE_FONT,
                    opacity: opening ? 0 : 1,
                }}
            >
                {guestName}
            </p>

            <div
                className="relative aspect-[1.45] w-full max-w-[330px]"
                style={{ perspective: '1100px' }}
            >
                {/* back of the envelope, with a patterned liner */}
                <div
                    className="absolute inset-0 rounded-md shadow-2xl"
                    style={{
                        background: `repeating-linear-gradient(45deg, ${data.secondary}33 0 6px, transparent 6px 12px), ${envelope}`,
                        filter: 'brightness(0.86)',
                    }}
                />

                {/* the card inside */}
                <div
                    className="absolute inset-x-[7%] top-[6%] bottom-[8%] flex flex-col items-center justify-center rounded-sm px-4 text-center shadow-md"
                    style={{
                        background: '#fffdf8',
                        transform: opening ? 'translateY(-62%)' : 'none',
                        transition: `transform 0.75s ${EASE} 0.7s`,
                        zIndex: 1,
                    }}
                >
                    <p
                        className="text-[15px] leading-[1.8]"
                        style={{ color: data.primary, fontFamily: TITLE_FONT }}
                    >
                        {data.title}
                    </p>
                    <p
                        className="mt-1 text-xs"
                        style={{ color: data.secondary }}
                    >
                        {data.dateText}
                    </p>
                </div>

                {/* front pocket */}
                <div
                    className="absolute inset-0 rounded-md"
                    style={{
                        background: `linear-gradient(160deg, ${envelope}, ${envelope}), ${envelope}`,
                        clipPath:
                            'polygon(0 0, 50% 64%, 100% 0, 100% 100%, 0 100%)',
                        boxShadow: 'inset 0 -24px 40px rgba(0,0,0,0.12)',
                        zIndex: 2,
                    }}
                />
                <div
                    aria-hidden
                    className="absolute inset-0 rounded-md"
                    style={{
                        background:
                            'linear-gradient(115deg, rgba(0,0,0,0.08) 0%, transparent 40%), linear-gradient(245deg, rgba(0,0,0,0.08) 0%, transparent 40%)',
                        clipPath:
                            'polygon(0 0, 50% 64%, 100% 0, 100% 100%, 0 100%)',
                        zIndex: 2,
                    }}
                />

                {/* the flap */}
                <div
                    className="absolute inset-x-0 top-0 h-[64%]"
                    style={{
                        background: `linear-gradient(180deg, ${envelope}, ${envelope})`,
                        filter: 'brightness(1.04)',
                        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                        transformOrigin: 'top center',
                        transform: opening
                            ? 'rotateX(180deg)'
                            : 'rotateX(0deg)',
                        transition: `transform 0.6s ${EASE} 0.3s`,
                        boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.06)',
                        zIndex: opening ? 0 : 3,
                    }}
                />

                {/* a fine trim along the edges and the flap */}
                <svg
                    aria-hidden
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 z-[4] size-full transition-opacity duration-300"
                    style={{ opacity: opening ? 0 : 1 }}
                >
                    <rect
                        x="0.5"
                        y="0.5"
                        width="99"
                        height="99"
                        rx="1.5"
                        fill="none"
                        stroke={data.primary}
                        strokeOpacity="0.55"
                        vectorEffect="non-scaling-stroke"
                    />
                    <path
                        d="M0.5 0.5L50 64L99.5 0.5"
                        fill="none"
                        stroke={data.primary}
                        strokeOpacity="0.7"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>

                {/* the wax seal, which breaks in two when tapped */}
                <button
                    type="button"
                    onClick={onOpen}
                    disabled={opening}
                    aria-label={data.copy.openInvitation}
                    className={cn(
                        'absolute top-[64%] left-1/2 z-[5] size-20 -translate-x-1/2 -translate-y-1/2 rounded-full',
                        !opening && 'inv-pulse',
                    )}
                >
                    <span className="absolute inset-0" style={half('left')}>
                        <WaxSeal
                            color={seal}
                            letters={data.monogram}
                            className="size-20"
                        />
                    </span>
                    <span className="absolute inset-0" style={half('right')}>
                        <WaxSeal
                            color={seal}
                            letters={data.monogram}
                            className="size-20"
                        />
                    </span>
                </button>
            </div>

            <p
                className="mt-10 text-sm font-semibold tracking-wide transition-opacity duration-500"
                style={{ color: data.primary, opacity: opening ? 0 : 1 }}
            >
                {data.copy.tapSeal}
            </p>
        </div>
    );
}

// Sparkles thrown out from behind the names as they pop.
const BURST = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 84 + (i % 3) * 18;

    return {
        dx: Math.round(Math.cos(angle) * distance),
        dy: Math.round(Math.sin(angle) * distance * 0.75),
        size: 11 + (i % 3) * 5,
        delay: 1.6 + (i % 4) * 0.06,
    };
});

/** The front of the folded card: Angkor's towers in gold on coloured stock. */
function CardFront({ data }: { data: ResolvedInvitation }) {
    const english = data.lang === 'en';

    return (
        <div className="relative size-full">
            <div className="absolute inset-2 rounded-sm border border-[#e2bd66]/75" />
            <div className="absolute inset-[13px] rounded-sm border border-[#e2bd66]/35" />
            <TempleTowers
                className="absolute inset-x-[12%] top-[16%] w-[76%]"
                fill="rgba(0,0,0,0.16)"
            />
            <p
                className={cn(
                    'absolute inset-x-6 bottom-[15%] text-center',
                    english
                        ? 'text-[15px] font-semibold tracking-[0.25em] uppercase'
                        : 'text-[15px] leading-[1.9]',
                )}
                style={{
                    ...GOLD_TEXT,
                    fontFamily: english ? SERIF_FONT : TITLE_FONT,
                }}
            >
                {data.title}
            </p>
        </div>
    );
}

/**
 * A gate-fold card printed with a temple: tapping the clasp swings both
 * panels open and the couple's names pop up inside, one after the other.
 */
function CardOpening({
    data,
    media,
    guestName,
    opening,
    onOpen,
}: OverlayProps) {
    const english = data.lang === 'en';
    // Darken the theme colour when a design has no card stock of its own,
    // so the gold artwork always reads.
    const stock =
        data.theme.envelope ??
        `linear-gradient(rgba(0,0,0,0.38), rgba(0,0,0,0.38)), ${data.primary}`;
    const names =
        !data.hideHosts && data.hostLeft
            ? [data.hostLeft, data.hostRight].filter(Boolean)
            : [];
    const nameStyle: CSSProperties = {
        ...DEEP_GOLD_TEXT,
        fontFamily: english ? SCRIPT_FONT : TITLE_FONT,
    };
    const pop = (delay: number) => ({
        className: opening ? 'inv-pop' : 'opacity-0',
        style: opening ? { animationDelay: `${delay}s` } : undefined,
    });

    const panel = (side: 'left' | 'right') => {
        const left = side === 'left';
        const face: CSSProperties = {
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: left ? '6px 0 0 6px' : '0 6px 6px 0',
        };

        return (
            <div
                className={cn(
                    'absolute inset-y-0 z-[2] w-1/2',
                    left ? 'left-0' : 'right-0',
                )}
                style={{
                    transformStyle: 'preserve-3d',
                    transformOrigin: left ? 'left center' : 'right center',
                    transform: opening
                        ? `rotateY(${left ? -128 : 128}deg)`
                        : 'none',
                    transition: `transform 1.15s ${EASE} 0.25s`,
                }}
            >
                <div
                    className="absolute inset-0 overflow-hidden shadow-xl"
                    style={{ ...face, background: stock }}
                >
                    <div
                        className={cn(
                            'absolute inset-y-0 w-[200%]',
                            left ? 'left-0' : 'right-0',
                        )}
                    >
                        <CardFront data={data} />
                    </div>
                    <div
                        className={cn(
                            'absolute inset-y-0 w-6',
                            left
                                ? 'right-0 bg-gradient-to-l'
                                : 'left-0 bg-gradient-to-r',
                            'from-black/25 to-transparent',
                        )}
                    />
                </div>
                {/* the inside of the cover */}
                <div
                    className="absolute inset-0"
                    style={{
                        ...face,
                        transform: 'rotateY(180deg)',
                        background: `repeating-linear-gradient(45deg, ${data.secondary}1f 0 6px, transparent 6px 12px), #f7ecd6`,
                        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.12)',
                    }}
                />
            </div>
        );
    };

    return (
        <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden px-6"
            style={{
                ...backgroundStyle(data, media),
                color: data.theme.text,
                opacity: opening ? 0 : 1,
                transition: `opacity 0.6s ease ${opening ? '2.9s' : '0s'}`,
            }}
        >
            <p
                className="text-[15px] leading-[1.9] transition-opacity duration-500"
                style={{ color: data.secondary, opacity: opening ? 0 : 1 }}
            >
                {data.copy.dear}
            </p>
            <p
                className="mb-6 max-w-full truncate text-[22px] leading-[1.9] transition-opacity duration-500"
                style={{
                    ...headlineStyle(data, data.primary),
                    fontFamily: TITLE_FONT,
                    opacity: opening ? 0 : 1,
                }}
            >
                {guestName}
            </p>

            <div
                className="relative aspect-[3/4] w-full max-w-[300px]"
                style={{
                    perspective: '1400px',
                    transform: opening ? 'scale(0.84)' : 'none',
                    transition: `transform 1s ${EASE} 0.25s`,
                }}
            >
                {/* inside the card */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-md px-5 text-center shadow-2xl"
                    style={{
                        background:
                            'radial-gradient(ellipse at 50% 30%, #fffaf0 0%, #f6e8cc 100%)',
                    }}
                >
                    <div className="absolute inset-2 rounded-sm border border-[#b8862b]/60" />
                    <div className="absolute inset-[13px] rounded-sm border border-[#b8862b]/30" />

                    <div {...pop(0.75)}>
                        <TempleTowers className="w-40" fill="#f3e3c0" />
                    </div>
                    <p
                        className={cn(
                            english
                                ? 'mt-2 text-[12px] font-semibold tracking-[0.25em] uppercase'
                                : 'mt-2 text-[13px] leading-[1.9]',
                            pop(0.95).className,
                        )}
                        style={{
                            ...pop(0.95).style,
                            color: data.secondary,
                            fontFamily: english ? SERIF_FONT : TITLE_FONT,
                        }}
                    >
                        {data.title}
                    </p>

                    <div className="relative mt-1 w-full">
                        {names.length > 0 ? (
                            names.map((name, index) => (
                                <div key={index}>
                                    {index > 0 && (
                                        <p
                                            className={cn(
                                                'text-sm',
                                                pop(1.35).className,
                                            )}
                                            style={{
                                                ...pop(1.35).style,
                                                color: data.secondary,
                                            }}
                                        >
                                            {data.joiner}
                                        </p>
                                    )}
                                    <p
                                        className={cn(
                                            english
                                                ? 'text-[38px] leading-tight break-words'
                                                : 'text-[22px] leading-[1.9] break-words',
                                            pop(index === 0 ? 1.1 : 1.55)
                                                .className,
                                        )}
                                        style={{
                                            ...pop(index === 0 ? 1.1 : 1.55)
                                                .style,
                                            ...nameStyle,
                                        }}
                                    >
                                        {name}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p
                                className={cn(
                                    'text-[34px] leading-tight',
                                    pop(1.1).className,
                                )}
                                style={{ ...pop(1.1).style, ...nameStyle }}
                            >
                                {data.monogram}
                            </p>
                        )}

                        {opening &&
                            BURST.map((spark, index) => (
                                <svg
                                    key={index}
                                    viewBox="0 0 24 24"
                                    aria-hidden
                                    className="inv-burst pointer-events-none absolute top-1/2 left-1/2"
                                    style={
                                        {
                                            width: spark.size,
                                            height: spark.size,
                                            marginLeft: -spark.size / 2,
                                            marginTop: -spark.size / 2,
                                            animationDelay: `${spark.delay}s`,
                                            '--dx': `${spark.dx}px`,
                                            '--dy': `${spark.dy}px`,
                                        } as CSSProperties
                                    }
                                >
                                    <path
                                        d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z"
                                        fill={index % 2 ? '#d9a441' : '#b5562e'}
                                    />
                                </svg>
                            ))}
                    </div>

                    {data.dateText && (
                        <p
                            className={cn(
                                'mt-4 text-xs font-semibold',
                                pop(1.85).className,
                            )}
                            style={{
                                ...pop(1.85).style,
                                color: data.secondary,
                            }}
                        >
                            {data.dateText}
                        </p>
                    )}
                </div>

                {panel('left')}
                {panel('right')}

                {/* the clasp across the fold */}
                <button
                    type="button"
                    onClick={onOpen}
                    disabled={opening}
                    aria-label={data.copy.openInvitation}
                    className={cn(
                        'absolute top-1/2 left-1/2 z-[3] size-16 -translate-x-1/2 -translate-y-1/2 rounded-full',
                        !opening && 'inv-pulse',
                    )}
                >
                    <span
                        className="absolute inset-0"
                        style={{
                            transform: opening ? 'scale(1.5)' : 'none',
                            opacity: opening ? 0 : 1,
                            transition: `transform 0.35s ${EASE}, opacity 0.3s ease`,
                        }}
                    >
                        <WaxSeal
                            color={data.theme.seal ?? '#c9a24a'}
                            letters={data.monogram}
                            className="size-16"
                        />
                    </span>
                </button>
            </div>

            <p
                className="mt-8 text-sm font-semibold transition-opacity duration-500"
                style={{ color: data.primary, opacity: opening ? 0 : 1 }}
            >
                {data.copy.tapCard}
            </p>
        </div>
    );
}

/** Card stock with a fine double gold border, shaped by `radius`. */
function Stock({
    color,
    radius,
    children,
}: {
    color: string;
    radius: string;
    children?: ReactNode;
}) {
    return (
        <>
            <div
                className="absolute inset-0"
                style={{ background: color, borderRadius: radius }}
            />
            <div
                className="absolute inset-1.5 border border-[#d4a445]/70"
                style={{ borderRadius: radius }}
            />
            <div
                className="absolute inset-[10px] border border-[#d4a445]/30"
                style={{ borderRadius: radius }}
            />
            {children}
        </>
    );
}

/**
 * A die-cut card folded shut: side flaps meet over the centre panel and a
 * domed top flap folds down over them, held by a gold seal. Tapping the
 * seal lifts the top flap, where the couple's names pop in, then swings
 * the side flaps out to show their naga pillars.
 */
function FoldOpening({
    data,
    media,
    guestName,
    opening,
    onOpen,
}: OverlayProps) {
    const english = data.lang === 'en';
    const stock =
        data.theme.envelope ??
        `linear-gradient(rgba(0,0,0,0.42), rgba(0,0,0,0.42)), ${data.primary}`;
    const gold: CSSProperties = {
        ...GOLD_TEXT,
        fontFamily: english ? SERIF_FONT : TITLE_FONT,
    };
    const pop = (delay: number) => ({
        className: opening ? 'inv-pop' : 'opacity-0',
        style: opening ? { animationDelay: `${delay}s` } : undefined,
    });
    const hidden: CSSProperties = {
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
    };
    const names =
        !data.hideHosts && data.hostLeft
            ? [data.hostLeft, data.hostRight].filter(Boolean)
            : [];

    // The closed front: Angkor Wat drawn across both side flaps.
    const front = (
        <div className="relative size-full">
            <Stock color={stock} radius="2px" />
            <AngkorFacade className="absolute top-[38%] left-1/2 w-[84%] -translate-x-1/2" />
        </div>
    );

    const side = (left: boolean) => (
        <div
            className={cn(
                'absolute inset-y-0 z-[2] w-1/2',
                left ? 'right-full' : 'left-full',
            )}
            style={{
                transformStyle: 'preserve-3d',
                transformOrigin: left ? 'right center' : 'left center',
                transform: opening
                    ? 'none'
                    : `rotateY(${left ? 180 : -180}deg)`,
                transition: `transform 0.9s ${EASE} 0.75s`,
            }}
        >
            {/* inside: a naga pillar */}
            <div className="absolute inset-0 overflow-hidden" style={hidden}>
                <Stock color={stock} radius="2px">
                    <NagaPillar
                        className={cn(
                            'absolute top-1/2 left-1/2 w-[56%] -translate-x-1/2 -translate-y-1/2',
                            !left && '-scale-x-100',
                        )}
                    />
                </Stock>
            </div>
            {/* outside: half of the closed front */}
            <div
                className="absolute inset-0 overflow-hidden shadow-xl"
                style={{ ...hidden, transform: 'rotateY(180deg)' }}
            >
                <div
                    className={cn(
                        'absolute inset-y-0 w-[200%]',
                        left ? 'left-0' : 'right-0',
                    )}
                >
                    {front}
                </div>
                <div
                    className={cn(
                        'absolute inset-y-0 w-5 from-black/30 to-transparent',
                        left
                            ? 'right-0 bg-gradient-to-l'
                            : 'left-0 bg-gradient-to-r',
                    )}
                />
            </div>
        </div>
    );

    return (
        <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden px-6"
            style={{
                ...backgroundStyle(data, media),
                color: data.theme.text,
                opacity: opening ? 0 : 1,
                transition: `opacity 0.6s ease ${opening ? '3s' : '0s'}`,
            }}
        >
            <div
                className="flex flex-col items-center transition-opacity duration-500"
                style={{ opacity: opening ? 0 : 1 }}
            >
                <p
                    className="text-[15px] leading-[1.9]"
                    style={{ color: data.secondary }}
                >
                    {data.copy.dear}
                </p>
                <p
                    className="max-w-full truncate text-[22px] leading-[1.9]"
                    style={{
                        ...headlineStyle(data, data.primary),
                        fontFamily: TITLE_FONT,
                    }}
                >
                    {guestName}
                </p>
            </div>

            <div
                className="relative my-16 h-[290px] w-[200px] shrink-0"
                style={{
                    perspective: '1600px',
                    transform: opening ? 'scale(0.85)' : 'scale(1.18)',
                    transition: `transform 1s ${EASE} 0.6s`,
                }}
            >
                {/* the centre panel */}
                <div className="absolute inset-0 shadow-2xl">
                    <Stock color={stock} radius="2px">
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
                            <p
                                className={cn(
                                    english
                                        ? 'text-[11px] font-semibold tracking-[0.2em] uppercase'
                                        : 'text-[13px] leading-[1.8]',
                                    pop(1.45).className,
                                )}
                                style={{ ...pop(1.45).style, ...gold }}
                            >
                                {data.title}
                            </p>
                            <div {...pop(1.6)}>
                                <KhmerDoorway
                                    letters={data.monogram}
                                    className="w-20"
                                />
                            </div>
                            <p
                                className={cn(
                                    'text-[11px] leading-[1.8]',
                                    pop(1.8).className,
                                )}
                                style={{ ...pop(1.8).style, ...gold }}
                            >
                                {data.inviteLine}
                            </p>
                            <div
                                className={cn(
                                    'w-full max-w-full rounded-sm border border-[#d4a445] bg-black/15 px-2',
                                    pop(1.95).className,
                                )}
                                style={pop(1.95).style}
                            >
                                <p
                                    className="truncate text-[12px] leading-[1.9]"
                                    style={gold}
                                >
                                    {guestName}
                                </p>
                            </div>
                            {data.dateText && (
                                <p
                                    className={cn(
                                        'text-[10px] font-semibold',
                                        pop(2.1).className,
                                    )}
                                    style={{
                                        ...pop(2.1).style,
                                        color: data.secondary,
                                    }}
                                >
                                    {data.dateText}
                                </p>
                            )}
                        </div>
                    </Stock>
                </div>

                {side(true)}
                {side(false)}

                {/* the domed top flap */}
                <div
                    className="absolute inset-x-0 bottom-full z-[3] h-[92px]"
                    style={{
                        transformStyle: 'preserve-3d',
                        transformOrigin: 'center bottom',
                        transform: opening ? 'none' : 'rotateX(-180deg)',
                        transition: `transform 0.7s ${EASE} 0.15s`,
                    }}
                >
                    {/* inside: the couple's names */}
                    <div className="absolute inset-0" style={hidden}>
                        <Stock color={stock} radius="50% 50% 0 0 / 46% 46% 0 0">
                            <div className="absolute inset-x-4 bottom-2 flex flex-col items-center justify-end">
                                {names.length > 0 ? (
                                    names.map((name, index) => (
                                        <p
                                            key={index}
                                            className={cn(
                                                english
                                                    ? 'max-w-full truncate text-[22px] leading-tight'
                                                    : 'max-w-full truncate text-[12px] leading-[1.8]',
                                                pop(index === 0 ? 0.95 : 1.15)
                                                    .className,
                                            )}
                                            style={{
                                                ...pop(
                                                    index === 0 ? 0.95 : 1.15,
                                                ).style,
                                                ...GOLD_TEXT,
                                                fontFamily: english
                                                    ? SCRIPT_FONT
                                                    : TITLE_FONT,
                                            }}
                                        >
                                            {name}
                                        </p>
                                    ))
                                ) : (
                                    <p
                                        className={cn(
                                            'text-[22px]',
                                            pop(0.95).className,
                                        )}
                                        style={{
                                            ...pop(0.95).style,
                                            ...GOLD_TEXT,
                                            fontFamily: SERIF_FONT,
                                        }}
                                    >
                                        {data.monogram}
                                    </p>
                                )}
                            </div>
                        </Stock>
                    </div>
                    {/* outside: a Kbach fleuron */}
                    <div
                        className="absolute inset-0 drop-shadow-lg"
                        style={{ ...hidden, transform: 'rotateX(180deg)' }}
                    >
                        <Stock color={stock} radius="0 0 50% 50% / 0 0 46% 46%">
                            <FoilSeal className="absolute top-3 left-1/2 w-7 -translate-x-1/2 opacity-80" />
                        </Stock>
                    </div>
                </div>

                {/* the seal that holds it shut */}
                <button
                    type="button"
                    onClick={onOpen}
                    disabled={opening}
                    aria-label={data.copy.openInvitation}
                    className={cn(
                        'absolute bottom-3 left-1/2 z-[4] flex size-14 -translate-x-1/2 items-center justify-center rounded-full',
                        !opening && 'inv-pulse',
                    )}
                    style={{
                        background: `radial-gradient(circle at 35% 30%, #5a4134, ${data.theme.envelope ?? '#3a2a22'})`,
                        opacity: opening ? 0 : 1,
                        transform: opening ? 'scale(1.4)' : 'none',
                        transition: `transform 0.35s ${EASE}, opacity 0.3s ease`,
                    }}
                >
                    <FoilSeal className="w-10" />
                </button>
            </div>

            <p
                className="text-sm font-semibold transition-opacity duration-500"
                style={{ color: data.primary, opacity: opening ? 0 : 1 }}
            >
                {data.copy.tapSeal}
            </p>
        </div>
    );
}

function CurtainOpening({ data, guestName, opening, onOpen }: OverlayProps) {
    const fabric = (side: 'left' | 'right'): CSSProperties => ({
        background: `repeating-linear-gradient(90deg, ${data.primary} 0px, ${data.secondary} 14px, ${data.primary} 28px), ${data.primary}`,
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.35)',
        transform: opening
            ? `translateX(${side === 'left' ? '-100%' : '100%'}) scaleX(0.6)`
            : 'none',
        transformOrigin: side === 'left' ? 'left' : 'right',
        transition: `transform 1.5s ${EASE} 0.2s`,
    });

    return (
        <div
            className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden"
            style={{ color: data.theme.text }}
        >
            <div
                className="absolute inset-y-0 left-0 w-[52%] rounded-br-[40%_8%]"
                style={fabric('left')}
            />
            <div
                className="absolute inset-y-0 right-0 w-[52%] rounded-bl-[40%_8%]"
                style={fabric('right')}
            />
            <div
                className="absolute inset-x-0 top-0 h-16"
                style={{
                    background: `radial-gradient(circle at 50% 0, ${data.secondary} 60%, transparent 62%) 0 100%/40px 24px repeat-x, ${data.primary}`,
                    boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
                    transform: opening ? 'translateY(-110%)' : 'none',
                    transition: `transform 0.8s ${EASE} 1s`,
                }}
            />
            <Greeting
                data={data}
                guestName={guestName}
                opening={opening}
                onOpen={onOpen}
                className="mx-6 rounded-3xl bg-white/90 py-8 shadow-xl"
            />
        </div>
    );
}

function FadeOpening({
    data,
    media,
    guestName,
    opening,
    onOpen,
}: OverlayProps) {
    return (
        <div
            className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden"
            style={{
                ...backgroundStyle(data, media),
                color: data.theme.text,
                opacity: opening ? 0 : 1,
                transform: opening ? 'scale(1.08)' : 'none',
                transition: `opacity 1.1s ease, transform 1.4s ${EASE}`,
            }}
        >
            <Greeting
                data={data}
                guestName={guestName}
                opening={false}
                onOpen={onOpen}
            />
        </div>
    );
}

// A fixed pseudo-random layout so particles don't jump between renders.
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
    // Rounded so server-rendered styles match the browser's exactly.
    const r = (n: number) => {
        const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;

        return Math.round((x - Math.floor(x)) * 1000) / 1000;
    };

    return {
        left: r(1) * 100,
        top: r(6) * 100,
        size: 10 + r(2) * 10,
        duration: 8 + r(3) * 7,
        delay: -r(4) * 14,
        drift: (r(5) - 0.5) * 120,
        spin: 180 + r(7) * 360,
    };
});

function ParticleShape({
    effect,
    index,
}: {
    effect: FallingEffect;
    index: number;
}) {
    if (effect === 'hearts') {
        return (
            <path
                d="M12 21s-7-4.6-9.3-9C1.2 9 3 5 6.6 5c2.2 0 3.6 1.3 5.4 3.3C13.8 6.3 15.2 5 17.4 5 21 5 22.8 9 21.3 12c-2.3 4.4-9.3 9-9.3 9z"
                fill={index % 2 ? '#e8798f' : '#f3a6b6'}
            />
        );
    }

    if (effect === 'sparkles') {
        return (
            <path
                d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z"
                fill={index % 2 ? '#f1d48b' : '#fff4d0'}
            />
        );
    }

    return (
        <path
            d="M12 2C17 6 19 12 12 22 5 12 7 6 12 2z"
            fill={
                index % 3 === 0
                    ? '#f7c5cf'
                    : index % 3 === 1
                      ? '#f2b3c0'
                      : '#fde2e7'
            }
            opacity="0.9"
        />
    );
}

/**
 * Petals, hearts or sparkles drifting over the visible part of the card.
 */
export function FallingLayer({ effect }: { effect: FallingEffect }) {
    if (effect === 'none') {
        return null;
    }

    const twinkle = effect === 'sparkles';

    return (
        <div className="pointer-events-none sticky top-0 z-20 h-0" aria-hidden>
            <div className="absolute inset-x-0 top-0 h-[max(640px,100svh)] overflow-hidden">
                {PARTICLES.map((particle, index) => (
                    <svg
                        key={index}
                        viewBox="0 0 24 24"
                        className={
                            twinkle
                                ? 'inv-twinkle absolute'
                                : 'inv-fall absolute'
                        }
                        style={
                            {
                                left: `${particle.left}%`,
                                top: twinkle ? `${particle.top}%` : undefined,
                                width: particle.size,
                                height: particle.size,
                                animationDuration: `${twinkle ? particle.duration / 3 : particle.duration}s`,
                                animationDelay: `${particle.delay}s`,
                                '--drift': `${particle.drift}px`,
                                '--spin': `${particle.spin}deg`,
                            } as CSSProperties
                        }
                    >
                        <ParticleShape effect={effect} index={index} />
                    </svg>
                ))}
            </div>
        </div>
    );
}
