/**
 * Subtle background textures, one per design, layered over the theme's
 * colour so no template sits on a flat fill.
 */
export type Texture =
    | 'velvet'
    | 'damask'
    | 'grain'
    | 'watercolor'
    | 'shimmer'
    | 'confetti'
    | 'grid'
    | 'linen';

const svg = (markup: string, size: number) =>
    `url("data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${markup}</svg>`,
    )}")`;

export function textureLayer(texture: Texture, color: string): string {
    switch (texture) {
        case 'velvet':
            // A soft sheen across the pile, plus fine fibre noise.
            return `radial-gradient(ellipse 90% 45% at 25% 12%, rgba(255,255,255,0.13), transparent 60%), radial-gradient(ellipse 70% 40% at 85% 70%, rgba(255,255,255,0.06), transparent 65%), ${svg(
                `<filter id="v"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0"/></filter><rect width="100%" height="100%" filter="url(#v)"/>`,
                120,
            )}`;
        case 'damask':
            // A repeating royal flourish in faint gold.
            return svg(
                `<g fill="none" stroke="${color}" stroke-opacity="0.13" stroke-width="1.2">
                    <path d="M40 8c10 10 10 22 0 32c-10-10-10-22 0-32zM40 72c10-10 10-22 0-32c-10 10-10 22 0 32z"/>
                    <path d="M8 40c10-10 22-10 32 0c-10 10-22 10-32 0zM72 40c-10-10-22-10-32 0c10 10 22 10 32 0z"/>
                    <circle cx="40" cy="40" r="3"/>
                    <circle cx="0" cy="0" r="6"/><circle cx="80" cy="0" r="6"/><circle cx="0" cy="80" r="6"/><circle cx="80" cy="80" r="6"/>
                </g>`,
                80,
            );
        case 'grain':
            return svg(
                `<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.09 0"/></filter><rect width="100%" height="100%" filter="url(#g)"/>`,
                160,
            );
        case 'watercolor':
            return `radial-gradient(ellipse 60% 40% at 15% 20%, ${color}1f, transparent 70%), radial-gradient(ellipse 50% 35% at 90% 55%, ${color}17, transparent 70%), radial-gradient(ellipse 55% 30% at 25% 90%, ${color}14, transparent 70%)`;
        case 'shimmer':
            return svg(
                `<g fill="${color}" fill-opacity="0.35">
                    <path d="M20 12l1.2 3.3 3.3 1.2-3.3 1.2L20 21l-1.2-3.3-3.3-1.2 3.3-1.2z"/>
                    <circle cx="70" cy="30" r="1.1"/><circle cx="45" cy="75" r="0.9"/>
                    <path d="M88 82l0.8 2.2 2.2 0.8-2.2 0.8-0.8 2.2-0.8-2.2-2.2-0.8 2.2-0.8z"/>
                </g>`,
                110,
            );
        case 'confetti':
            return svg(
                `<g fill-opacity="0.28">
                    <circle cx="12" cy="18" r="2.4" fill="${color}"/>
                    <rect x="52" y="10" width="7" height="3" rx="1.5" transform="rotate(35 55 11)" fill="#f4a261"/>
                    <circle cx="80" cy="56" r="2" fill="#7fb7be"/>
                    <rect x="24" y="66" width="7" height="3" rx="1.5" transform="rotate(-25 27 67)" fill="${color}"/>
                    <circle cx="62" cy="88" r="1.6" fill="#f4a261"/>
                </g>`,
                100,
            );
        case 'grid':
            return svg(
                `<path d="M0 .5H48M.5 0V48" stroke="${color}" stroke-opacity="0.08"/><circle cx=".5" cy=".5" r="1.4" fill="${color}" fill-opacity="0.18"/>`,
                48,
            );
        case 'linen':
            return svg(
                `<path d="M0 2h6M0 5h6" stroke="${color}" stroke-opacity="0.06"/><path d="M2 0v6M5 0v6" stroke="${color}" stroke-opacity="0.045"/>`,
                6,
            );
    }
}
