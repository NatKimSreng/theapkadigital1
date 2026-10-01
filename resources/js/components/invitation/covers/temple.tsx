import { useIds } from './shared';

/**
 * Khmer temple towers (prasat), shared by the Golden Prasat cover and the
 * opening card.
 */

const f = (n: number) => n.toFixed(1);

/** A lotus bud pointing up from (0,0). */
const BUD = 'M0 0c-2.2-2.2-2.2-5.4 0-7.6c2.2 2.2 2.2 5.4 0 7.6z';

/** A gold gradient in user space, so it also paints flat lines. */
export function SpaceGold({ id, height }: { id: string; height: number }) {
    return (
        <linearGradient
            id={id}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            y2={height}
        >
            <stop offset="0" stopColor="#f3d98f" />
            <stop offset="0.45" stopColor="#c99a3e" />
            <stop offset="0.75" stopColor="#9c6d1c" />
            <stop offset="1" stopColor="#d9b061" />
        </linearGradient>
    );
}

/**
 * One Angkor-style tower: a square body under a tiered lotus-bud crown,
 * with a niche at its foot and a finial on top.
 */
export function Tower({
    cx,
    base,
    w,
    h,
    fill,
    stroke,
}: {
    cx: number;
    base: number;
    w: number;
    h: number;
    fill: string;
    stroke: string;
}) {
    const body = h * 0.28;
    const crown = h - body;
    const half = (u: number) =>
        (w / 2) * 0.9 * Math.pow(1 - Math.pow(u, 1.7), 0.62);
    const steps = 16;
    const side = (dir: -1 | 1) =>
        Array.from({ length: steps + 1 }, (_, i) => {
            const u = dir === -1 ? i / steps : (steps - i) / steps;

            return `L${f(cx + dir * half(u))} ${f(base - body - crown * u)}`;
        }).join('');
    const outline = `M${f(cx - w / 2)} ${f(base)}L${f(cx - w / 2)} ${f(base - body)}${side(-1)}${side(1)}L${f(cx + w / 2)} ${f(base - body)}L${f(cx + w / 2)} ${f(base)}Z`;
    const tiers = [1, 2, 3, 4, 5].map((k) => {
        const u = k / 6.4;

        return { y: base - body - crown * u, hw: half(u) };
    });
    const niche = { w: w * 0.15, h: body * 0.82 };
    const scale = f(w / 56);

    return (
        <g>
            <path
                d={outline}
                fill={fill}
                stroke={stroke}
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <path
                d={`M${f(cx - w / 2)} ${f(base - body)}H${f(cx + w / 2)}`}
                stroke={stroke}
                strokeWidth="1.3"
            />
            {tiers.map(({ y, hw }) => (
                <g key={y}>
                    <path
                        d={`M${f(cx - hw)} ${f(y)}H${f(cx + hw)}`}
                        stroke={stroke}
                        strokeWidth="1"
                    />
                    <path
                        d={BUD}
                        fill={stroke}
                        transform={`translate(${f(cx - hw)} ${f(y)}) scale(${scale})`}
                    />
                    <path
                        d={BUD}
                        fill={stroke}
                        transform={`translate(${f(cx + hw)} ${f(y)}) scale(${scale})`}
                    />
                </g>
            ))}
            <path
                d={`M${f(cx - niche.w)} ${f(base)}V${f(base - niche.h * 0.6)}Q${f(cx - niche.w)} ${f(base - niche.h)} ${f(cx)} ${f(base - niche.h)}Q${f(cx + niche.w)} ${f(base - niche.h)} ${f(cx + niche.w)} ${f(base - niche.h * 0.6)}V${f(base)}Z`}
                fill="rgba(40,20,5,0.28)"
                stroke={stroke}
                strokeWidth="0.9"
            />
            <path
                d={`M${f(cx)} ${f(base - h)}V${f(base - h - h * 0.07)}`}
                stroke={stroke}
                strokeWidth="1.4"
                strokeLinecap="round"
            />
            <circle
                cx={cx}
                cy={f(base - h - h * 0.07)}
                r={f(Math.max(1.4, w * 0.03))}
                fill={stroke}
            />
        </g>
    );
}

/** Angkor Wat's five towers on a stepped terrace, in gold line work. */
export function TempleTowers({
    className,
    fill = 'none',
}: {
    className?: string;
    fill?: string;
}) {
    const ids = useIds('gold');
    const gold = `url(#${ids.gold})`;

    return (
        <svg viewBox="0 0 240 156" aria-hidden className={className}>
            <defs>
                <SpaceGold id={ids.gold} height={156} />
            </defs>
            <Tower cx={20} base={140} w={28} h={60} fill={fill} stroke={gold} />
            <Tower
                cx={220}
                base={140}
                w={28}
                h={60}
                fill={fill}
                stroke={gold}
            />
            <Tower cx={58} base={140} w={42} h={92} fill={fill} stroke={gold} />
            <Tower
                cx={182}
                base={140}
                w={42}
                h={92}
                fill={fill}
                stroke={gold}
            />
            <Tower
                cx={120}
                base={140}
                w={62}
                h={128}
                fill={fill}
                stroke={gold}
            />
            <path
                d="M2 140H238M8 146H232M2 152H238"
                stroke={gold}
                strokeWidth="1.4"
            />
        </svg>
    );
}
