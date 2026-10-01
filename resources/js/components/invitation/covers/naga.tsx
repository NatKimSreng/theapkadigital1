import { photoFocus } from '../heroes';
import { Flame, useIds } from './shared';
import { SpaceGold } from './temple';

/**
 * Gold-foil Khmer ornaments for Naga Gold: the naga pillars from the side
 * flaps, the Kbach crest and the seal.
 */

const f = (n: number) => n.toFixed(1);

/**
 * A slim temple column on a stepped base, topped by a naga whose neck
 * curls outward to the left, its back lined with Kbach flames.
 * Mirror it for the right-hand side.
 */
export function NagaPillar({ className }: { className?: string }) {
    const ids = useIds('gold');
    const gold = `url(#${ids.gold})`;

    return (
        <svg viewBox="0 0 70 320" aria-hidden className={className}>
            <defs>
                <SpaceGold id={ids.gold} height={320} />
            </defs>
            {/* neck and head */}
            <path
                d="M40 122C40 96 47 78 41 58C35 40 22 32 13 39C6 45 9 55 17 55C22 55 23 49 19 47"
                fill="none"
                stroke={gold}
                strokeWidth="6"
                strokeLinecap="round"
            />
            <path
                d="M45 120C45 96 52 78 46 56"
                fill="none"
                stroke={gold}
                strokeWidth="1"
            />
            <Flame x={47} y={104} angle={28} size={0.62} fill={gold} />
            <Flame x={50} y={86} angle={22} size={0.66} fill={gold} />
            <Flame x={49} y={68} angle={12} size={0.7} fill={gold} />
            <Flame x={43} y={50} angle={-8} size={0.72} fill={gold} />
            <Flame x={33} y={39} angle={-34} size={0.7} fill={gold} />
            <Flame x={21} y={34} angle={-62} size={0.6} fill={gold} />
            <Flame x={9} y={58} angle={-150} size={0.45} fill={gold} />
            <circle cx="15" cy="45" r="1.6" fill="#3a2a22" />

            {/* lotus capital */}
            <path d="M27 130H53L48 122H32Z" fill={gold} />
            {[-1, 0, 1].map((i) => (
                <path
                    key={i}
                    d="M0 0c-3-3-3-7 0-10c3 3 3 7 0 10z"
                    fill={gold}
                    transform={`translate(${f(40 + i * 7)} 122)`}
                />
            ))}

            {/* shaft with a lattice of diamonds */}
            <rect
                x="32"
                y="130"
                width="16"
                height="160"
                fill="none"
                stroke={gold}
                strokeWidth="1.6"
            />
            {Array.from({ length: 15 }, (_, i) => (
                <path
                    key={i}
                    d={`M40 ${134 + i * 10.5}l4.5 5 -4.5 5 -4.5 -5z`}
                    fill={gold}
                    opacity="0.85"
                />
            ))}
            {[170, 250].map((y) => (
                <rect key={y} x="30" y={y} width="20" height="4" fill={gold} />
            ))}

            {/* stepped base */}
            <path
                d="M28 290H52V298H28ZM23 298H57V306H23ZM18 306H62V316H18Z"
                fill={gold}
            />
        </svg>
    );
}

/**
 * An oval Kbach crest: a flame wreath around the couple's photo, or their
 * initials when there is no photo.
 */
export function KbachCrest({
    src,
    letters,
    className,
}: {
    src?: string | null;
    letters: string;
    className?: string;
}) {
    const ids = useIds('gold', 'clip');
    const gold = `url(#${ids.gold})`;
    const cx = 100;
    const cy = 124;
    const rx = 60;
    const ry = 78;
    const wreath = Array.from({ length: 32 }, (_, i) => {
        const t = (i / 32) * Math.PI * 2 - Math.PI / 2;

        return {
            x: cx + (rx + 4) * Math.cos(t),
            y: cy + (ry + 4) * Math.sin(t),
            angle: (t * 180) / Math.PI + 90,
        };
    }).filter((_, i) => i !== 0 && i !== 16);

    return (
        <svg viewBox="0 0 200 240" aria-hidden={!src} className={className}>
            <defs>
                <SpaceGold id={ids.gold} height={240} />
                <clipPath id={ids.clip}>
                    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
                </clipPath>
            </defs>
            {wreath.map(({ x, y, angle }) => (
                <Flame
                    key={angle}
                    x={Number(f(x))}
                    y={Number(f(y))}
                    angle={Number(f(angle))}
                    size={0.7}
                    fill={gold}
                />
            ))}
            {src ? (
                <foreignObject
                    x={cx - rx}
                    y={cy - ry}
                    width={rx * 2}
                    height={ry * 2}
                    clipPath={`url(#${ids.clip})`}
                >
                    <img
                        src={src}
                        alt=""
                        className="size-full object-cover"
                        style={photoFocus(src)}
                    />
                </foreignObject>
            ) : (
                <>
                    <ellipse
                        cx={cx}
                        cy={cy}
                        rx={rx}
                        ry={ry}
                        fill="rgba(0,0,0,0.18)"
                    />
                    <text
                        x={cx}
                        y={cy + 14}
                        textAnchor="middle"
                        fontFamily="'Cormorant Garamond', serif"
                        fontWeight="700"
                        fontSize={letters.length > 1 ? 44 : 56}
                        fill={gold}
                    >
                        {letters}
                    </text>
                </>
            )}
            <ellipse
                cx={cx}
                cy={cy}
                rx={rx}
                ry={ry}
                fill="none"
                stroke={gold}
                strokeWidth="4"
            />
            <ellipse
                cx={cx}
                cy={cy}
                rx={rx - 6}
                ry={ry - 6}
                fill="none"
                stroke={gold}
                strokeWidth="0.8"
            />
            {/* a flame finial on top and a lotus under the crest */}
            <g transform={`translate(${cx} ${cy - ry - 4})`}>
                <Flame x={0} y={0} angle={-32} size={0.8} fill={gold} />
                <Flame x={0} y={0} angle={32} size={0.8} fill={gold} />
                <Flame x={0} y={2} angle={0} size={1.05} fill={gold} />
            </g>
            <g transform={`translate(${cx} ${cy + ry + 26})`}>
                <path d="M0 0c-8-7-8-17 0-25c8 8 8 18 0 25z" fill={gold} />
                <path d="M0 0c-12-2-19-10-20-20c9 1 16 9 20 20z" fill={gold} />
                <path d="M0 0c12-2 19-10 20-20c-9 1-16 9-20 20z" fill={gold} />
            </g>
        </svg>
    );
}

/** The round gold seal at the foot of the card, with a lotus spire. */
export function FoilSeal({ className }: { className?: string }) {
    const ids = useIds('gold');
    const gold = `url(#${ids.gold})`;

    return (
        <svg viewBox="0 0 60 72" aria-hidden className={className}>
            <defs>
                <SpaceGold id={ids.gold} height={72} />
            </defs>
            <circle
                cx="30"
                cy="42"
                r="26"
                fill="none"
                stroke={gold}
                strokeWidth="2.4"
            />
            <circle
                cx="30"
                cy="42"
                r="21"
                fill="none"
                stroke={gold}
                strokeWidth="0.8"
            />
            <path
                d="M30 22c3 4 3 8 0 11c-3-3-3-7 0-11zM25 36h10l-1.5-3h-7zM22 42h16l-2-6H24zM19 50h22l-2-8H21zM16 56h28v3H16z"
                fill={gold}
            />
            <Flame x={30} y={16} angle={0} size={0.5} fill={gold} />
        </svg>
    );
}
