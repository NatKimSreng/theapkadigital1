import { MapPin } from 'lucide-react';
import type { MapPlace } from '@/types';
import type { ResolvedInvitation } from './resolve';

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
 * The venue on an embedded Google map (the keyless embed, so there is no
 * API key or tile service to fail), washed in the design's colour and
 * darkened for dark designs, with the place's name beneath. Without a pin
 * from the couple's link it searches the venue's name.
 */
export function PlaceMap({
    data,
    place,
}: {
    data: ResolvedInvitation;
    place: MapPlace | null;
}) {
    const query = place ? `${place.lat},${place.lng}` : data.venueText;

    if (!query) {
        return null;
    }

    const dark = isLight(data.theme.text);
    const name = place?.name || data.venueText;
    const src = `https://maps.google.com/maps?${new URLSearchParams({
        q: query,
        z: '16',
        hl: data.lang,
        output: 'embed',
    })}`;

    return (
        <div className="space-y-2">
            <div
                className="relative h-60 w-full overflow-hidden rounded-2xl border shadow-sm"
                style={{
                    borderColor: `${data.primary}66`,
                    background: dark ? '#1f1b18' : '#f2efe9',
                }}
            >
                <iframe
                    src={src}
                    title={name || data.copy.location}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="size-full border-0"
                    style={{
                        // Inverting with a half-turn of hue keeps water blue
                        // and parks green on a dark map.
                        filter: dark
                            ? 'invert(0.9) hue-rotate(180deg) saturate(0.7) brightness(0.95)'
                            : 'saturate(0.75)',
                    }}
                />
                {/* the design's colour washed over the streets */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: data.primary,
                        mixBlendMode: 'color',
                        opacity: dark ? 0.35 : 0.22,
                    }}
                />
            </div>
            {name && (
                <p
                    className="flex items-center justify-center gap-1.5 text-[14px] font-semibold"
                    style={{ color: data.primary }}
                >
                    <MapPin className="size-4 shrink-0" />
                    <span className="truncate">{name}</span>
                </p>
            )}
        </div>
    );
}
