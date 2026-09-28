import { useEffect, useRef, useState } from 'react';
import { InvitationCard } from './invitation-card';
import type { InvitationEvent } from './resolve';
import { emptyMedia } from './resolve';
import type { TemplateDefinition } from './templates';

const DESIGN_WIDTH = 360;
const NO_MEDIA = emptyMedia();

/**
 * A static, scaled-down render of a template's cover section.
 */
export function TemplateThumbnail({
    template,
    event,
}: {
    template: TemplateDefinition;
    event: InvitationEvent;
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
            className="pointer-events-none relative aspect-[9/8] overflow-hidden"
        >
            <div
                className="absolute top-0 left-0 origin-top-left"
                style={{ width: DESIGN_WIDTH, transform: `scale(${scale})` }}
            >
                <InvitationCard
                    template={template}
                    settings={{}}
                    media={NO_MEDIA}
                    event={event}
                    lang="km"
                    compact
                />
            </div>
        </div>
    );
}
