import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { Motion } from './animations';
import { DEMO_FOCUS } from './demo';
import { Ornament } from './ornaments';
import type { ResolvedInvitation } from './resolve';
import type { HeroStyle } from './templates';

/**
 * Where to anchor a photo when it is cropped, so faces stay in view.
 */
export function photoFocus(src: string): CSSProperties {
    return { objectPosition: DEMO_FOCUS[src] ?? 'center 30%' };
}

/**
 * The couple's photo on the cover, framed in the template's own way. Falls
 * back to the template's ornament until a photo is uploaded.
 */
export function HeroPhoto({
    style,
    src,
    data,
    motion,
}: {
    style: HeroStyle;
    src: string | null;
    data: ResolvedInvitation;
    motion: Motion;
}) {
    const { primary, secondary, theme } = data;
    const float = motion !== 'static' && 'inv-float';

    if (!src) {
        return (
            <Ornament
                type={theme.ornament}
                primary={primary}
                secondary={secondary}
                className={cn('h-48 w-48', float)}
            />
        );
    }

    const img = (className: string) => (
        <img
            src={src}
            alt=""
            className={cn('object-cover', className)}
            style={photoFocus(src)}
        />
    );

    switch (style) {
        case 'arch':
            return (
                <div
                    className="rounded-t-full p-1.5 shadow-xl"
                    style={{
                        background: `linear-gradient(180deg, ${primary}, ${secondary})`,
                    }}
                >
                    <div
                        className="rounded-t-full border-2 p-1"
                        style={{ borderColor: theme.panel }}
                    >
                        {img('h-80 w-56 rounded-t-full')}
                    </div>
                </div>
            );

        case 'polaroid':
            return (
                <div className={cn('relative', float)}>
                    <span
                        aria-hidden
                        className="absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 -rotate-3 opacity-80"
                        style={{ background: `${secondary}aa` }}
                    />
                    <div className="-rotate-3 bg-white p-3 pb-12 shadow-2xl">
                        {img('aspect-[4/5] w-60')}
                    </div>
                </div>
            );

        case 'circle':
            return (
                <div
                    className="rounded-full p-1.5"
                    style={{
                        background: `conic-gradient(${primary}, ${secondary}, ${primary}, ${secondary}, ${primary})`,
                        boxShadow: `0 0 0 6px ${theme.panel}, 0 0 0 7px ${primary}88, 0 18px 40px -12px rgba(0,0,0,0.35)`,
                    }}
                >
                    {img('size-60 rounded-full border-4 border-white')}
                </div>
            );

        case 'framed':
            return (
                <div className="relative mr-3 mb-3">
                    <span
                        aria-hidden
                        className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border-2"
                        style={{ borderColor: primary }}
                    />
                    {img('relative aspect-[4/5] w-60 rounded-2xl shadow-xl')}
                </div>
            );

        default:
            return img('max-h-64 w-full rounded-2xl shadow-lg');
    }
}
