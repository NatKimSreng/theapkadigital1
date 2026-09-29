import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { demoEvent, demoMedia, demoSettings } from './demo';
import { InvitationCard } from './invitation-card';
import type { TemplateDefinition } from './templates';

const DESIGN_WIDTH = 360;

/**
 * A static, scaled-down render of a template's cover, filled with the
 * sample photos and names.
 */
export function TemplateThumbnail({
    template,
    className = 'aspect-[3/4]',
}: {
    template: TemplateDefinition;
    className?: string;
}) {
    const box = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.75);

    useEffect(() => {
        const element = box.current;

        if (!element) {
            return;
        }

        const observer = new ResizeObserver(([entry]) =>
            setScale(entry.contentRect.width / DESIGN_WIDTH),
        );
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={box}
            className={cn(
                'pointer-events-none relative overflow-hidden',
                className,
            )}
        >
            <div
                className="absolute top-0 left-0 origin-top-left"
                style={{ width: DESIGN_WIDTH, transform: `scale(${scale})` }}
            >
                <InvitationCard
                    template={template}
                    settings={demoSettings(template)}
                    media={demoMedia(template)}
                    event={demoEvent(template)}
                    lang="km"
                    compact
                />
            </div>
        </div>
    );
}
