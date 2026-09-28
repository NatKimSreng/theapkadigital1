import { Link, router } from '@inertiajs/react';
import {
    CheckCheck,
    Copy,
    Download,
    ExternalLink,
    QrCode,
    Send,
    Share2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import GuestController from '@/actions/App/Http/Controllers/GuestController';
import InvitationController from '@/actions/App/Http/Controllers/InvitationController';
import { longDate } from '@/components/invitation/resolve';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Guest, PlannerEvent } from '@/types';

type Props = {
    event: PlannerEvent;
    guest: Guest;
    ready: boolean;
};

const roundButton =
    'flex size-9 items-center justify-center rounded-full border bg-background text-foreground shadow-xs transition-colors hover:bg-muted disabled:opacity-40';

/**
 * Per-guest buttons to send the personal invitation link and show its QR code.
 */
export function GuestInviteActions({ event, guest, ready }: Props) {
    return (
        <>
            <SendInviteDialog event={event} guest={guest} ready={ready} />
            <QrDialog event={event} guest={guest} ready={ready} />
        </>
    );
}

function useMarkSent(event: PlannerEvent, guest: Guest) {
    return () => {
        if (guest.invite_sent_at) {
            return;
        }

        router.post(
            GuestController.markSent.url({ event: event.id, guest: guest.id }),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };
}

function NotReady({ event }: { event: PlannerEvent }) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                {t('invite.not_ready')}
            </p>
            <Button asChild className="rounded-full">
                <Link href={InvitationController.catalog.url(event.id)}>
                    {t('invite.add_template')}
                </Link>
            </Button>
        </div>
    );
}

function SendInviteDialog({ event, guest, ready }: Props) {
    const { t, locale } = useTranslation();
    const markSent = useMarkSent(event, guest);
    const link = guest.invite_url ?? '';
    const sent = !!guest.invite_sent_at;

    const message = [
        t('invite.greeting', { name: guest.name }),
        '',
        t('invite.body', { name: guest.name, event: event.name }),
        event.event_date
            ? t('invite.when', { date: longDate(event.event_date, locale) })
            : null,
        event.venue ? t('invite.where', { venue: event.venue }) : null,
        '',
        t('invite.cta'),
        link,
    ]
        .filter((line) => line !== null)
        .join('\n');

    const copy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        toast.success(t('invite.copied'));
        markSent();
    };

    const share = async () => {
        try {
            await navigator.share({ title: event.name, text: message });
            markSent();
        } catch {
            // The guest closed the share sheet.
        }
    };

    const telegram = `https://t.me/share/url?${new URLSearchParams({
        url: link,
        text: message.replace(link, '').trim(),
    }).toString()}`;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    aria-label={t(sent ? 'invite.sent' : 'invite.send')}
                    title={t(sent ? 'invite.sent' : 'invite.send')}
                    className={cn(
                        roundButton,
                        sent &&
                            'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
                    )}
                >
                    {sent ? (
                        <CheckCheck className="size-4" />
                    ) : (
                        <Send className="size-4" />
                    )}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogTitle>
                    {t('invite.send_title', { name: guest.name })}
                </DialogTitle>
                {sent && guest.invite_sent_at && (
                    <DialogDescription className="flex items-center gap-1.5 text-primary">
                        <CheckCheck className="size-4" />
                        {t('invite.sent_at', {
                            date: formatDate(
                                guest.invite_sent_at.slice(0, 10),
                                locale,
                            ),
                        })}
                    </DialogDescription>
                )}

                {ready ? (
                    <div className="space-y-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor={`link-${guest.id}`}>
                                {t('invite.link')}
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id={`link-${guest.id}`}
                                    readOnly
                                    value={link}
                                    onFocus={(e) => e.target.select()}
                                />
                                <Button
                                    type="button"
                                    onClick={() => copy(link)}
                                    className="shrink-0"
                                >
                                    <Copy className="size-4" />
                                    {t('invite.copy_link')}
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor={`message-${guest.id}`}>
                                {t('invite.message_label')}
                            </Label>
                            <textarea
                                id={`message-${guest.id}`}
                                readOnly
                                rows={8}
                                value={message}
                                className="w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm leading-relaxed"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => copy(message)}
                            >
                                <Copy className="size-4" />
                                {t('invite.copy_message')}
                            </Button>
                            {'share' in navigator && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={share}
                                >
                                    <Share2 className="size-4" />
                                    {t('invite.share')}
                                </Button>
                            )}
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-full"
                            >
                                <a
                                    href={telegram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={markSent}
                                >
                                    <Send className="size-4" />
                                    Telegram
                                </a>
                            </Button>
                            <Button
                                asChild
                                variant="ghost"
                                className="rounded-full"
                            >
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="size-4" />
                                    {t('invite.open')}
                                </a>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <NotReady event={event} />
                )}
            </DialogContent>
        </Dialog>
    );
}

/**
 * Renders the QR code with the guest's name underneath as a PNG download.
 */
async function downloadQr(svgUrl: string, name: string) {
    const image = new Image();
    image.src = svgUrl;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1150;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 32, 32, 960, 960);
    context.fillStyle = '#3f3f46';
    context.font = "600 46px 'Kantumruy Pro', sans-serif";
    context.textAlign = 'center';
    context.fillText(name, 512, 1080, 960);

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png'),
    );

    if (!blob) {
        return;
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `invitation-${name.replace(/[\\/:*?"<>|]+/g, '-')}.png`;
    anchor.click();
    URL.revokeObjectURL(url);
}

function QrDialog({ event, guest, ready }: Props) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const markSent = useMarkSent(event, guest);
    const qrUrl = GuestController.qr.url({ event: event.id, guest: guest.id });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    aria-label={t('invite.qr')}
                    title={t('invite.qr')}
                    className={roundButton}
                >
                    <QrCode className="size-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogTitle>{guest.name}</DialogTitle>
                {ready ? (
                    <div className="space-y-4 text-center">
                        {open && (
                            <img
                                src={qrUrl}
                                alt={t('invite.qr')}
                                className="mx-auto aspect-square w-full max-w-64 rounded-xl border bg-white p-2"
                            />
                        )}
                        <p className="text-sm text-muted-foreground">
                            {t('invite.qr_hint')}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <Button
                                type="button"
                                className="rounded-full"
                                onClick={async () => {
                                    await downloadQr(qrUrl, guest.name);
                                    markSent();
                                }}
                            >
                                <Download className="size-4" />
                                {t('invite.download_qr')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full"
                                onClick={async () => {
                                    await navigator.clipboard.writeText(
                                        guest.invite_url ?? '',
                                    );
                                    toast.success(t('invite.copied'));
                                    markSent();
                                }}
                            >
                                <Copy className="size-4" />
                                {t('invite.copy_link')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <NotReady event={event} />
                )}
            </DialogContent>
        </Dialog>
    );
}
