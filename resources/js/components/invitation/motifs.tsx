import { cn } from '@/lib/utils';

/**
 * Each design's own signature ornament, drawn above section headings.
 */
export type Motif =
    | 'diamond'
    | 'spires'
    | 'lotus'
    | 'rings'
    | 'bunting'
    | 'roof'
    | 'vine';

type Props = {
    motif: Motif;
    primary: string;
    secondary: string;
    className?: string;
};

function Rule({ color, x1, x2 }: { color: string; x1: number; x2: number }) {
    return (
        <line
            x1={x1}
            x2={x2}
            y1="20"
            y2="20"
            stroke={color}
            strokeWidth="1"
            strokeLinecap="round"
        />
    );
}

export function SectionMotif({ motif, primary, secondary, className }: Props) {
    const art = (() => {
        switch (motif) {
            case 'diamond':
                return (
                    <>
                        <Rule color={secondary} x1={10} x2={78} />
                        <Rule color={secondary} x1={122} x2={190} />
                        <circle cx="84" cy="20" r="2" fill={secondary} />
                        <circle cx="116" cy="20" r="2" fill={secondary} />
                        <path
                            d="M100 6l12 14-12 14-12-14z"
                            fill="none"
                            stroke={primary}
                            strokeWidth="1.5"
                        />
                        <path d="M100 13l6 7-6 7-6-7z" fill={primary} />
                    </>
                );
            case 'spires':
                // Angkor Wat's five towers.
                return (
                    <>
                        <Rule color={secondary} x1={8} x2={62} />
                        <Rule color={secondary} x1={138} x2={192} />
                        <path
                            d="M66 34h68M72 34v-9l3-6 3 6v9M88 34v-13l4-9 4 9v13M96 34V14l4-12 4 12v20M104 34v-13l4-9 4 9v13M122 34v-9l3-6 3 6v9"
                            fill="none"
                            stroke={primary}
                            strokeWidth="1.4"
                            strokeLinejoin="round"
                        />
                    </>
                );
            case 'lotus':
                return (
                    <>
                        <Rule color={secondary} x1={10} x2={74} />
                        <Rule color={secondary} x1={126} x2={190} />
                        <g fill={primary} fillOpacity="0.9">
                            <path d="M100 4c6 8 6 18 0 28c-6-10-6-20 0-28z" />
                            <path
                                d="M100 32c-2-10-8-17-18-20c1 11 8 18 18 20z"
                                fillOpacity="0.7"
                            />
                            <path
                                d="M100 32c2-10 8-17 18-20c-1 11-8 18-18 20z"
                                fillOpacity="0.7"
                            />
                        </g>
                        <path
                            d="M84 34c10 3 22 3 32 0"
                            stroke={secondary}
                            strokeWidth="1.4"
                            fill="none"
                        />
                    </>
                );
            case 'rings':
                return (
                    <>
                        <Rule color={secondary} x1={10} x2={78} />
                        <Rule color={secondary} x1={122} x2={190} />
                        <circle
                            cx="93"
                            cy="21"
                            r="10"
                            fill="none"
                            stroke={primary}
                            strokeWidth="1.6"
                        />
                        <circle
                            cx="107"
                            cy="21"
                            r="10"
                            fill="none"
                            stroke={secondary}
                            strokeWidth="1.6"
                        />
                        <path d="M107 6l2 3.5-2 2.5-2-2.5z" fill={primary} />
                    </>
                );
            case 'bunting':
                return (
                    <>
                        <path
                            d="M14 8c30 14 58 14 86 0c28 14 56 14 86 0"
                            fill="none"
                            stroke={secondary}
                            strokeWidth="1.2"
                        />
                        {[28, 50, 72, 128, 150, 172].map((x, i) => (
                            <path
                                key={x}
                                d={`M${x - 7} ${14 + (i % 3 === 1 ? 3 : 1)}l7 13 7-13z`}
                                fill={i % 2 === 0 ? primary : secondary}
                                fillOpacity="0.85"
                            />
                        ))}
                        <circle cx="100" cy="20" r="4" fill={primary} />
                    </>
                );
            case 'roof':
                return (
                    <>
                        <Rule color={secondary} x1={10} x2={70} />
                        <Rule color={secondary} x1={130} x2={190} />
                        <path
                            d="M76 26l24-18 24 18"
                            fill="none"
                            stroke={primary}
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M86 25v9h28v-9"
                            fill="none"
                            stroke={primary}
                            strokeWidth="1.4"
                        />
                        <rect
                            x="96"
                            y="27"
                            width="8"
                            height="7"
                            fill={secondary}
                        />
                    </>
                );
            case 'vine':
                return (
                    <>
                        <path
                            d="M12 20c20-10 40 10 60 0M128 20c20-10 40 10 60 0"
                            fill="none"
                            stroke={secondary}
                            strokeWidth="1.2"
                        />
                        <g fill={secondary} fillOpacity="0.8">
                            <ellipse
                                cx="42"
                                cy="14"
                                rx="4"
                                ry="2"
                                transform="rotate(-30 42 14)"
                            />
                            <ellipse
                                cx="158"
                                cy="26"
                                rx="4"
                                ry="2"
                                transform="rotate(-30 158 26)"
                            />
                        </g>
                        <path
                            d="M100 32c-10-7-16-12-16-18a6 6 0 0 1 16-3a6 6 0 0 1 16 3c0 6-6 11-16 18z"
                            fill={primary}
                        />
                    </>
                );
        }
    })();

    return (
        <svg
            viewBox="0 0 200 40"
            aria-hidden
            className={cn('mx-auto h-7 w-44', className)}
        >
            {art}
        </svg>
    );
}
