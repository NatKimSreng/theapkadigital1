import { MapPin } from 'lucide-react';
import type { MapPlace } from '@/types';
import type { ResolvedInvitation } from './resolve';

const TILE = 256;
const ZOOM = 16;

/** Where (lat, lng) falls in the web-mercator tile grid at `zoom`. */
function tilePoint(lat: number, lng: number, zoom: number) {
    const n = 2 ** zoom;
    const rad = (lat * Math.PI) / 180;

    return {
        x: ((lng + 180) / 360) * n,
        y:
            ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
            n,
    };
}

/** True when a colour is light, i.e. the design sets light text on dark. */
function isLight(hex: string): boolean {
    const match = /^#?([0-9a-f]{6})$/i.exec(hex);

    if (!match) {
        return false;
    }

    const value = parseInt(match[1], 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;

    return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

/**
 * The venue on a map drawn from OpenStreetMap tiles, tinted to the
 * design's colours (a dark map for dark designs) with a pin and the
 * place's name. Tapping it opens the couple's map link.
 */
export function PlaceMap({
    data,
    place,
}: {
    data: ResolvedInvitation;
    place: MapPlace;
}) {
    const dark = isLight(data.theme.text);
    const style = dark ? 'dark_all' : 'light_all';
    const n = 2 ** ZOOM;
    const point = tilePoint(place.lat, place.lng, ZOOM);
    const fx = Math.floor(point.x);
    const fy = Math.floor(point.y);
    const tiles = [-1, 0, 1].flatMap((dy) =>
        [-1, 0, 1].map((dx) => ({
            x: (((fx + dx) % n) + n) % n,
            y: fy + dy,
            left: Math.round((fx + dx - point.x) * TILE),
            top: Math.round((fy + dy - point.y) * TILE),
            host: 'abcd'[(dx + dy + 4) % 4],
        })),
    );
    const name = place.name || data.venueText;

    return (
        <a
            href={data.mapHref ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name || data.copy.openMap}
            className="relative block h-56 w-full overflow-hidden rounded-2xl border shadow-sm"
            style={{
                borderColor: `${data.primary}66`,
                background: dark ? '#1f1b18' : '#f2efe9',
            }}
        >
            <div aria-hidden className="absolute inset-0 grayscale-[0.35]">
                {tiles.map((tile) => (
                    <img
                        key={`${tile.x}-${tile.y}`}
                        src={`https://${tile.host}.basemaps.cartocdn.com/${style}/${ZOOM}/${tile.x}/${tile.y}@2x.png`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="absolute max-w-none select-none"
                        style={{
                            width: TILE,
                            height: TILE,
                            left: `calc(50% + ${tile.left}px)`,
                            top: `calc(50% + ${tile.top}px)`,
                        }}
                    />
                ))}
            </div>
            {/* the design's colour washed over the streets */}
            <div
                aria-hidden
                className="absolute inset-0"
                style={{
                    background: data.primary,
                    mixBlendMode: 'color',
                    opacity: dark ? 0.55 : 0.4,
                }}
            />
            <div
                aria-hidden
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse at 50% 45%, transparent 55%, ${dark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.5)'} 100%)`,
                }}
            />

            {/* the pin */}
            <span
                aria-hidden
                className="inv-pulse absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: data.primary }}
            />
            <svg
                aria-hidden
                viewBox="0 0 32 42"
                className="absolute top-1/2 left-1/2 w-8 -translate-x-1/2 -translate-y-full drop-shadow-md"
            >
                <path
                    d="M16 41C16 41 3 26 3 15.5A13 13 0 0 1 29 15.5C29 26 16 41 16 41Z"
                    fill={data.primary}
                    stroke="#fff"
                    strokeWidth="2"
                />
                <circle cx="16" cy="15.5" r="5.5" fill={data.secondary} />
                <circle cx="16" cy="15.5" r="2.5" fill="#fff" />
            </svg>

            {name && (
                <span
                    className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold shadow backdrop-blur-sm"
                    style={{
                        background: dark
                            ? 'rgba(20,14,10,0.72)'
                            : 'rgba(255,255,255,0.86)',
                        color: data.primary,
                    }}
                >
                    <MapPin className="size-4 shrink-0" />
                    <span className="truncate">{name}</span>
                </span>
            )}
            <span
                className="absolute top-1.5 right-2 text-[9px]"
                style={{
                    color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                }}
            >
                © OpenStreetMap © CARTO
            </span>
        </a>
    );
}
