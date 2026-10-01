import { ChevronsDown } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useId } from 'react';

/**
 * Pieces shared by the illustrated covers (Blush Garden, Kbach Royal, Naga Gold,
 * Emerald Velvet, Mocha Editorial, Golden Prasat).
 */

export const GOLD_TEXT: CSSProperties = {
    backgroundImage:
        'linear-gradient(180deg, #f6e1a0 0%, #d7a948 38%, #a8781f 70%, #e2bd66 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.35))',
};

/** Darker gold foil that stays legible on ivory and sandstone. */
export const DEEP_GOLD_TEXT: CSSProperties = {
    backgroundImage:
        'linear-gradient(180deg, #d4a650 0%, #a8781f 45%, #6e4a10 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
};

/** Unique SVG ids per instance, so several covers can share a page. */
export function useIds<T extends string>(...names: T[]): Record<T, string> {
    const base = useId().replace(/[^a-zA-Z0-9]/g, '');

    return Object.fromEntries(
        names.map((name) => [name, `${base}-${name}`]),
    ) as Record<T, string>;
}

export function GoldGradient({ id }: { id: string }) {
    return (
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f8e6a8" />
            <stop offset="0.4" stopColor="#d4a445" />
            <stop offset="0.7" stopColor="#a67520" />
            <stop offset="1" stopColor="#e6c173" />
        </linearGradient>
    );
}

/** A Kbach flame leaf pointing up from (0,0), its tip hooked back. */
const FLAME = 'M0 0C-8-8-7-21 2-31C3-25 8-23 11-27C10-16 7-6 0 0Z';

export function Flame({
    x,
    y,
    angle,
    size = 1,
    fill,
}: {
    x: number;
    y: number;
    angle: number;
    size?: number;
    fill: string;
}) {
    return (
        <path
            d={FLAME}
            fill={fill}
            stroke="#6b4a0e"
            strokeOpacity="0.55"
            strokeWidth="0.6"
            transform={`translate(${x} ${y}) rotate(${angle}) scale(${size})`}
        />
    );
}

/** A round button to continue, in the cover's own colours. */
export function ScrollButton({
    label,
    onClick,
    ring = '#d4a445',
    fill = 'rgba(255,255,255,0.85)',
    icon = '#b8862b',
    textStyle = GOLD_TEXT,
}: {
    label: string;
    onClick: () => void;
    ring?: string;
    fill?: string;
    icon?: string;
    textStyle?: CSSProperties;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group mt-5 flex flex-col items-center gap-1"
        >
            <span
                className="flex size-14 items-center justify-center rounded-full border-[3px] shadow-lg transition-transform group-hover:scale-105"
                style={{ borderColor: ring, background: fill }}
            >
                <ChevronsDown
                    className="size-6 animate-bounce"
                    style={{ color: icon }}
                />
            </span>
            <span className="text-[13px] font-semibold" style={textStyle}>
                {label}
            </span>
        </button>
    );
}

// A slightly uneven wax edge: fixed bumps so it renders the same everywhere.
const SEAL_EDGE = (() => {
    const points = Array.from({ length: 28 }, (_, i) => {
        const angle = (i / 28) * Math.PI * 2;
        const radius = 46 + Math.sin(i * 2.7) * 2.4 + Math.cos(i * 1.3) * 1.6;

        return `${(50 + Math.cos(angle) * radius).toFixed(2)} ${(50 + Math.sin(angle) * radius).toFixed(2)}`;
    });

    return `M${points.join('L')}Z`;
})();

/**
 * An embossed wax seal with the couple's initials.
 */
export function WaxSeal({
    color,
    letters,
    className = 'size-20',
}: {
    color: string;
    letters: string;
    className?: string;
}) {
    const ids = useIds('wax', 'shine');

    return (
        <svg
            viewBox="0 0 100 100"
            aria-hidden
            className={className}
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))' }}
        >
            <defs>
                <radialGradient id={ids.wax} cx="0.38" cy="0.32" r="0.75">
                    <stop offset="0" stopColor={color} stopOpacity="0.72" />
                    <stop offset="0.55" stopColor={color} />
                    <stop offset="1" stopColor="#000" stopOpacity="0.55" />
                </radialGradient>
                <radialGradient id={ids.shine} cx="0.3" cy="0.25" r="0.35">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
            </defs>
            <path d={SEAL_EDGE} fill={color} />
            <path d={SEAL_EDGE} fill={`url(#${ids.wax})`} />
            <circle
                cx="50"
                cy="50"
                r="33"
                fill="none"
                stroke="#000"
                strokeOpacity="0.28"
                strokeWidth="3"
            />
            <circle
                cx="50.8"
                cy="50.8"
                r="33"
                fill="none"
                stroke="#fff"
                strokeOpacity="0.22"
                strokeWidth="1.2"
            />
            <circle
                cx="50"
                cy="50"
                r="27"
                fill="none"
                stroke="#000"
                strokeOpacity="0.18"
                strokeDasharray="1.5 3"
            />
            {/* Letters pressed into the wax: a light edge under a dark cut. */}
            <text
                x="51"
                y="61"
                textAnchor="middle"
                fontFamily="'Cormorant Garamond', serif"
                fontWeight="700"
                fontSize={letters.length > 1 ? 30 : 40}
                fill="#fff"
                fillOpacity="0.3"
            >
                {letters}
            </text>
            <text
                x="50"
                y="60"
                textAnchor="middle"
                fontFamily="'Cormorant Garamond', serif"
                fontWeight="700"
                fontSize={letters.length > 1 ? 30 : 40}
                fill="#000"
                fillOpacity="0.38"
            >
                {letters}
            </text>
            <ellipse
                cx="50"
                cy="50"
                rx="46"
                ry="46"
                fill={`url(#${ids.shine})`}
            />
        </svg>
    );
}
