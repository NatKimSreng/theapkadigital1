import { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';

type Point = [number, number];
type Curve = [Point, Point, Point, Point];

function bezier([p0, p1, p2, p3]: Curve, t: number): Point {
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;

    return [
        a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
        a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
    ];
}

function tangentAngle(curve: Curve, t: number): number {
    const [x1, y1] = bezier(curve, Math.max(0, t - 0.01));
    const [x2, y2] = bezier(curve, Math.min(1, t + 0.01));

    return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
}

function curvePath([p0, p1, p2, p3]: Curve): string {
    return `M${p0[0]} ${p0[1]}C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`;
}

/**
 * A curl that winds inwards from a starting point, like the end of a scroll.
 */
function spiralPath(
    [cx, cy]: Point,
    radius: number,
    turns: number,
    start: number,
    clockwise: boolean,
): string {
    const steps = Math.round(turns * 36);
    const points: string[] = [];

    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const angle =
            start + (clockwise ? 1 : -1) * progress * turns * Math.PI * 2;
        const r = radius * (1 - progress * 0.85);
        points.push(
            `${(cx + r * Math.cos(angle)).toFixed(1)} ${(cy + r * Math.sin(angle)).toFixed(1)}`,
        );
    }

    return `M${points.join('L')}`;
}

/**
 * A lobed acanthus leaf with its base at the origin, pointing along +x.
 */
function leafPath(length: number, width: number): string {
    const l = length;
    const w = width;

    return [
        'M0 0',
        `C${l * 0.15} ${-w * 0.9} ${l * 0.35} ${-w * 1.1} ${l * 0.38} ${-w * 0.55}`,
        `C${l * 0.45} ${-w * 1.15} ${l * 0.65} ${-w * 1.1} ${l * 0.66} ${-w * 0.5}`,
        `C${l * 0.75} ${-w * 1.0} ${l * 0.95} ${-w * 0.9} ${l} ${-w * 0.25}`,
        `C${l * 1.02} ${w * 0.1} ${l * 0.9} ${w * 0.25} ${l * 0.8} ${w * 0.05}`,
        `C${l * 0.6} ${w * 0.35} ${l * 0.3} ${w * 0.45} 0 0Z`,
    ].join('');
}

function Leaf({
    x,
    y,
    angle,
    length,
    flip,
    color,
}: {
    x: number;
    y: number;
    angle: number;
    length: number;
    flip: boolean;
    color: string;
}) {
    const width = length * 0.55;

    return (
        <g
            transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(1 ${flip ? -1 : 1})`}
        >
            <path d={leafPath(length, width)} fill={color} />
            <path
                d={`M${length * 0.06} 0Q${length * 0.5} ${-width * 0.2} ${length * 0.86} ${-width * 0.32}`}
                fill="none"
                stroke="#fff"
                strokeOpacity="0.55"
                strokeWidth={Math.max(0.8, length * 0.03)}
                strokeLinecap="round"
            />
        </g>
    );
}

function Leaves({
    curve,
    color,
    from = 0.1,
    to = 0.92,
    count = 8,
    size = 36,
}: {
    curve: Curve;
    color: string;
    from?: number;
    to?: number;
    count?: number;
    size?: number;
}) {
    return (
        <>
            {Array.from({ length: count }, (_, i) => {
                const t = from + ((to - from) * i) / (count - 1);
                const [x, y] = bezier(curve, t);
                const outward = i % 2 === 0;

                return (
                    <Leaf
                        key={i}
                        x={x}
                        y={y}
                        angle={tangentAngle(curve, t) + (outward ? -50 : 50)}
                        length={size * (1 - (i / count) * 0.45)}
                        flip={!outward}
                        color={color}
                    />
                );
            })}
        </>
    );
}

/**
 * A fan of three leaves finishing the end of a stem.
 */
function Plume({
    curve,
    color,
    size,
}: {
    curve: Curve;
    color: string;
    size: number;
}) {
    const [x, y] = curve[3];
    const angle = tangentAngle(curve, 1);

    return (
        <>
            <Leaf
                x={x}
                y={y}
                angle={angle - 38}
                length={size * 0.8}
                flip={false}
                color={color}
            />
            <Leaf
                x={x}
                y={y}
                angle={angle + 38}
                length={size * 0.8}
                flip
                color={color}
            />
            <Leaf
                x={x}
                y={y}
                angle={angle}
                length={size}
                flip={false}
                color={color}
            />
        </>
    );
}

function Stem({
    curve,
    color,
    width,
}: {
    curve: Curve;
    color: string;
    width: number;
}) {
    return (
        <>
            <path d={curvePath(curve)} stroke={color} strokeWidth={width} />
            <path
                d={curvePath(curve)}
                stroke="#fff"
                strokeOpacity="0.4"
                strokeWidth={width * 0.25}
            />
        </>
    );
}

function Blossom({
    at: [x, y],
    size,
    color,
}: {
    at: Point;
    size: number;
    color: string;
}) {
    return (
        <g transform={`translate(${x} ${y})`} fill={color}>
            {[0, 120, 240].map((angle) => (
                <path
                    key={angle}
                    d={`M0 0C${-size * 0.6} ${-size * 0.4} ${-size * 0.5} ${-size * 1.1} 0 ${-size}C${size * 0.5} ${-size * 1.1} ${size * 0.6} ${-size * 0.4} 0 0Z`}
                    transform={`rotate(${angle})`}
                />
            ))}
            <circle r={size * 0.22} fill="#fff" opacity="0.8" />
        </g>
    );
}

// One corner, drawn for the top-left; the other corners mirror it.
const TOP_STEM: Curve = [
    [8, 16],
    [70, -12],
    [128, 54],
    [196, 24],
];
const SIDE_STEM: Curve = [
    [16, 8],
    [-12, 70],
    [54, 128],
    [24, 196],
];
const INNER_STEM: Curve = [
    [58, 58],
    [82, 66],
    [94, 90],
    [124, 100],
];
const INNER_STEM_B: Curve = [
    [58, 58],
    [66, 82],
    [90, 94],
    [100, 124],
];

function CornerArt({ color }: { color: string }) {
    return (
        <g>
            <g fill="none" strokeLinecap="round">
                <Stem curve={TOP_STEM} color={color} width={5} />
                <Stem curve={SIDE_STEM} color={color} width={5} />
                <Stem curve={INNER_STEM} color={color} width={3.2} />
                <Stem curve={INNER_STEM_B} color={color} width={3.2} />
                <path
                    d={spiralPath([46, 46], 36, 1.8, -Math.PI * 0.75, true)}
                    stroke={color}
                    strokeWidth="6.5"
                />
                <path
                    d={spiralPath([46, 46], 27, 1.6, -Math.PI * 0.75, true)}
                    stroke="#fff"
                    strokeOpacity="0.45"
                    strokeWidth="1.4"
                />
                <path
                    d={spiralPath([128, 110], 11, 1.4, 0, true)}
                    stroke={color}
                    strokeWidth="2.6"
                />
                <path
                    d={spiralPath([110, 128], 11, 1.4, Math.PI / 2, false)}
                    stroke={color}
                    strokeWidth="2.6"
                />
            </g>
            <Leaves curve={TOP_STEM} color={color} />
            <Leaves curve={SIDE_STEM} color={color} />
            <Leaves
                curve={INNER_STEM}
                color={color}
                from={0.25}
                to={0.85}
                count={4}
                size={26}
            />
            <Leaves
                curve={INNER_STEM_B}
                color={color}
                from={0.25}
                to={0.85}
                count={4}
                size={26}
            />
            <Plume curve={TOP_STEM} color={color} size={34} />
            <Plume curve={SIDE_STEM} color={color} size={34} />
            <Blossom at={[136, 74]} size={11} color={color} />
            <Blossom at={[74, 136]} size={11} color={color} />
            <Blossom at={[170, 62]} size={7} color={color} />
            <Blossom at={[62, 170]} size={7} color={color} />
        </g>
    );
}

const CORNER_TRANSFORMS = {
    'top-left': undefined,
    'top-right': 'scaleX(-1)',
    'bottom-left': 'scaleY(-1)',
    'bottom-right': 'scale(-1)',
} as const;

export type Corner = keyof typeof CORNER_TRANSFORMS;

export function BaroqueCorner({
    corner,
    color,
    className,
    style,
}: {
    corner: Corner;
    color: string;
    className?: string;
    style?: CSSProperties;
}) {
    return (
        <svg
            viewBox="0 0 200 200"
            className={className}
            overflow="visible"
            style={{ ...style, transform: CORNER_TRANSFORMS[corner] }}
            aria-hidden="true"
        >
            <CornerArt color={color} />
        </svg>
    );
}

/**
 * Baroque corners on all four corners of the nearest positioned parent.
 */
export function BaroqueCorners({
    color,
    size = 'w-36',
    top = true,
    bottom = true,
}: {
    color: string;
    size?: string;
    top?: boolean;
    bottom?: boolean;
}) {
    const base = `pointer-events-none absolute ${size}`;

    return (
        <>
            {top && (
                <>
                    <BaroqueCorner
                        corner="top-left"
                        color={color}
                        className={`${base} top-0 left-0`}
                    />
                    <BaroqueCorner
                        corner="top-right"
                        color={color}
                        className={`${base} top-0 right-0`}
                    />
                </>
            )}
            {bottom && (
                <>
                    <BaroqueCorner
                        corner="bottom-left"
                        color={color}
                        className={`${base} bottom-0 left-0`}
                    />
                    <BaroqueCorner
                        corner="bottom-right"
                        color={color}
                        className={`${base} right-0 bottom-0`}
                    />
                </>
            )}
        </>
    );
}

/**
 * An oval, gilded picture frame with a beaded inner rim and scroll crests
 * at the top and bottom. Renders the photo inside when one is given.
 */
export function OrnateOvalFrame({
    src,
    color,
    className,
    placeholder,
}: {
    src: string | null;
    color: string;
    className?: string;
    placeholder?: ReactNode;
}) {
    const gilt = `gilt-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
    const beads = Array.from({ length: 48 }, (_, i) => {
        const angle = (i / 48) * Math.PI * 2;

        return [150 + 112 * Math.cos(angle), 190 + 152 * Math.sin(angle)];
    });

    const crest = (y: number, flip: boolean) => (
        <g
            transform={`translate(150 ${y}) scale(1 ${flip ? -1 : 1})`}
            fill="none"
            stroke={color}
            strokeLinecap="round"
        >
            <path
                d={spiralPath([-22, -6], 14, 1.3, 0, false)}
                strokeWidth="3"
            />
            <path
                d={spiralPath([22, -6], 14, 1.3, Math.PI, true)}
                strokeWidth="3"
            />
            <path
                d="M0 -30C-8 -18 -8 -8 0 0C8 -8 8 -18 0 -30Z"
                fill={color}
                stroke="none"
            />
            <path
                d={leafPath(34, 12)}
                fill={color}
                stroke="none"
                transform="translate(-6 -2) rotate(200)"
            />
            <path
                d={leafPath(34, 12)}
                fill={color}
                stroke="none"
                transform="translate(6 -2) rotate(-20) scale(1 -1)"
            />
        </g>
    );

    return (
        <div className={className}>
            <div className="relative aspect-[300/380] w-full">
                <div
                    className="absolute overflow-hidden rounded-[50%]"
                    style={{ inset: '12.5% 13.5%' }}
                >
                    {src ? (
                        <img
                            src={src}
                            alt=""
                            className="size-full object-cover"
                        />
                    ) : (
                        placeholder
                    )}
                </div>
                <svg
                    viewBox="0 0 300 380"
                    className="pointer-events-none absolute inset-0 size-full"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id={gilt} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#f3e2bd" />
                            <stop offset="35%" stopColor={color} />
                            <stop offset="65%" stopColor="#f0dcb0" />
                            <stop offset="100%" stopColor={color} />
                        </linearGradient>
                    </defs>
                    <ellipse
                        cx="150"
                        cy="190"
                        rx="126"
                        ry="166"
                        fill="none"
                        stroke={`url(#${gilt})`}
                        strokeWidth="16"
                    />
                    <ellipse
                        cx="150"
                        cy="190"
                        rx="138"
                        ry="178"
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                    />
                    <ellipse
                        cx="150"
                        cy="190"
                        rx="116"
                        ry="156"
                        fill="none"
                        stroke={color}
                        strokeWidth="1.2"
                    />
                    {beads.map(([x, y], i) => (
                        <circle
                            key={i}
                            cx={x.toFixed(1)}
                            cy={y.toFixed(1)}
                            r="2.2"
                            fill="#f6ead0"
                            stroke={color}
                            strokeWidth="0.6"
                        />
                    ))}
                    {crest(26, false)}
                    {crest(354, true)}
                    <g transform="translate(18 190) rotate(-90)">
                        <path
                            d={leafPath(30, 11)}
                            fill={color}
                            transform="translate(-4 0) rotate(180)"
                        />
                        <path
                            d={leafPath(30, 11)}
                            fill={color}
                            transform="translate(4 0)"
                        />
                    </g>
                    <g transform="translate(282 190) rotate(90)">
                        <path
                            d={leafPath(30, 11)}
                            fill={color}
                            transform="translate(-4 0) rotate(180)"
                        />
                        <path
                            d={leafPath(30, 11)}
                            fill={color}
                            transform="translate(4 0)"
                        />
                    </g>
                </svg>
            </div>
        </div>
    );
}
