import { cn } from '@/lib/utils';

/**
 * Each design's own signature ornament, drawn above section headings.
 */
export type Motif =
    | 'bloom'
    | 'kbach'
    | 'sprig'
    | 'rule'
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
            case 'kbach':
                // A Kbach fleuron: three hooked flame leaves on a lotus base.
                return (
                    <>
                        <Rule color={secondary} x1={8} x2={70} />
                        <Rule color={secondary} x1={130} x2={192} />
                        <g fill={primary} transform="translate(100 34)">
                            <path d="M0 0C-8-8-7-21 2-31C3-25 8-23 11-27C10-16 7-6 0 0Z" />
                            <path
                                d="M0 0C-8-8-7-21 2-31C3-25 8-23 11-27C10-16 7-6 0 0Z"
                                transform="rotate(-50) scale(0.7)"
                            />
                            <path
                                d="M0 0C-8-8-7-21 2-31C3-25 8-23 11-27C10-16 7-6 0 0Z"
                                transform="scale(-1 1) rotate(-50) scale(0.7)"
                            />
                        </g>
                        <circle cx="76" cy="20" r="2" fill={primary} />
                        <circle cx="124" cy="20" r="2" fill={primary} />
                    </>
                );
            case 'sprig':
                return (
                    <>
                        <Rule color={secondary} x1={10} x2={80} />
                        <Rule color={secondary} x1={120} x2={190} />
                        <path
                            d="M84 30C92 20 108 20 116 10"
                            fill="none"
                            stroke={primary}
                            strokeWidth="1.4"
                        />
                        {[
                            [90, 24, 30],
                            [100, 19, 45],
                            [110, 14, 60],
                        ].map(([x, y, a]) => (
                            <g
                                key={x}
                                transform={`translate(${x} ${y}) rotate(${a})`}
                            >
                                <ellipse
                                    cy="-5"
                                    rx="2.4"
                                    ry="5.5"
                                    fill={primary}
                                />
                                <ellipse
                                    cy="5"
                                    rx="2.4"
                                    ry="5.5"
                                    fill={primary}
                                    opacity="0.75"
                                />
                            </g>
                        ))}
                    </>
                );
            case 'rule':
                // Editorial: just a hairline with a small dot.
                return (
                    <>
                        <Rule color={secondary} x1={60} x2={94} />
                        <circle cx="100" cy="20" r="2.2" fill={primary} />
                        <Rule color={secondary} x1={106} x2={140} />
                    </>
                );
            case 'bloom':
                return (
                    <>
                        <Rule color={secondary} x1={10} x2={76} />
                        <Rule color={secondary} x1={124} x2={190} />
                        <path
                            d="M84 24c4-8 10-10 14-6M116 24c-4-8-10-10-14-6"
                            fill="none"
                            stroke="#8fae7e"
                            strokeWidth="1.6"
                        />
                        <g transform="translate(100 18)">
                            {[0, 72, 144, 216, 288].map((angle) => (
                                <ellipse
                                    key={angle}
                                    cy="-5"
                                    rx="6"
                                    ry="5.5"
                                    fill={secondary}
                                    fillOpacity="0.85"
                                    transform={`rotate(${angle})`}
                                />
                            ))}
                            <circle r="4" fill="#fbe3e8" />
                            <circle r="1.8" fill={primary} />
                        </g>
                    </>
                );
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
