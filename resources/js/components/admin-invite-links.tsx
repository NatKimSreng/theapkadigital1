import { Check, Copy, ExternalLink, Link2 } from 'lucide-react';
import { findTemplate } from '@/components/invitation/templates';
import { useClipboard } from '@/hooks/use-clipboard';
import { useTranslation } from '@/lib/i18n';

export type InviteLink = {
    id: number;
    template: string;
    active: boolean;
    url: string;
};

/**
 * An event's invitation links, so an admin can open or copy them.
 */
export function AdminInviteLinks({ links }: { links: InviteLink[] }) {
    const { t } = useTranslation();
    const [copied, copy] = useClipboard();

    if (links.length === 0) {
        return (
            <p className="text-xs text-muted-foreground">
                {t('admin.no_invitation')}
            </p>
        );
    }

    return (
        <ul className="w-full space-y-1.5">
            {links.map((link) => {
                const template = findTemplate(link.template);

                return (
                    <li
                        key={link.id}
                        className="flex min-w-0 items-center gap-2 rounded-xl bg-muted/50 px-3 py-1.5 text-sm"
                    >
                        <Link2 className="size-4 shrink-0 text-primary" />
                        <span className="shrink-0 font-medium">
                            {template ? t(template.name) : link.template}
                        </span>
                        {link.active && (
                            <span className="shrink-0 rounded-full bg-primary/15 px-2 text-xs text-primary">
                                {t('admin.invitation_active')}
                            </span>
                        )}
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 flex-1 truncate text-muted-foreground hover:text-primary hover:underline"
                        >
                            {link.url}
                        </a>
                        <button
                            type="button"
                            onClick={() => copy(link.url)}
                            title={t('design.copy_link')}
                            aria-label={t('design.copy_link')}
                            className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-background hover:text-primary"
                        >
                            {copied === link.url ? (
                                <Check className="size-4 text-emerald-600" />
                            ) : (
                                <Copy className="size-4" />
                            )}
                        </button>
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={t('admin.open_invitation')}
                            aria-label={t('admin.open_invitation')}
                            className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-background hover:text-primary"
                        >
                            <ExternalLink className="size-4" />
                        </a>
                    </li>
                );
            })}
        </ul>
    );
}
