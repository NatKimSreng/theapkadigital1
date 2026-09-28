import { MailOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { InvitationMedia } from '@/types';
import { BaroqueCorner } from './baroque';
import type { ResolvedInvitation } from './resolve';
import { TITLE_FONT, backgroundStyle, headlineStyle } from './resolve';

export type OpeningStyle = 'doors' | 'envelope' | 'curtain' | 'fade';
export type FallingEffect = 'none' | 'petals' | 'sparkles' | 'hearts';

export const OPENING_STYLES: OpeningStyle[] = [
    'doors',
    'envelope',
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

export const OPENING_DURATION = 1900;

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
    const r = (n: number) => {
        const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;

        return x - Math.floor(x);
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
