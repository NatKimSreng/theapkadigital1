import { router } from '@inertiajs/react';
import { Check, Heart, X } from 'lucide-react';
import { useState } from 'react';
import type { ResolvedInvitation } from './resolve';

export type RsvpConfig = {
    url: string;
    /** The guest's invite code on a personal link. */
    guest: string | null;
    reply: { attending: boolean; message: string | null } | null;
};

/**
 * "Will you attend?" plus a wish message. Without a config (editor
 * previews) the form is shown but cannot be sent.
 */
export function RsvpForm({
    data,
    rsvp,
}: {
    data: ResolvedInvitation;
    rsvp?: RsvpConfig;
}) {
    const { copy, primary, secondary, theme } = data;
    const [attending, setAttending] = useState<boolean | null>(
        rsvp?.reply?.attending ?? null,
    );
    const [message, setMessage] = useState(rsvp?.reply?.message ?? '');
    const [name, setName] = useState('');
    const [sent, setSent] = useState(Boolean(rsvp?.reply));
    const [sending, setSending] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const needsName = !rsvp?.guest;
    const canSend =
        Boolean(rsvp) &&
        attending !== null &&
        (!needsName || name.trim() !== '') &&
        !sending;

    const submit = () => {
        if (!rsvp || !canSend) {
            return;
        }

        router.post(
            rsvp.url,
            {
                guest: rsvp.guest,
                name: needsName ? name : null,
                attending,
                message: message || null,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setSending(true),
                onFinish: () => setSending(false),
                onError: (errs) => setErrors(errs),
                onSuccess: () => {
                    setErrors({});
                    setSent(true);
                },
            },
        );
    };

    if (sent) {
        return (
            <div
                className="space-y-3 rounded-3xl p-6 shadow-sm"
                style={{ background: theme.panel }}
            >
                <Heart
                    className="mx-auto size-8"
                    style={{ color: primary }}
                    fill={primary}
                />
                <p className="text-[15px] leading-7">{copy.rsvpThanks}</p>
                <p className="text-sm font-semibold" style={{ color: primary }}>
                    {attending ? `✓ ${copy.attending}` : `✗ ${copy.declining}`}
                </p>
                <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="text-xs underline underline-offset-4 opacity-80"
                >
                    {copy.rsvpChange}
                </button>
            </div>
        );
    }

    const choice = (value: boolean, label: string) => {
        const selected = attending === value;
        const Icon = value ? Check : X;

        return (
            <button
                type="button"
                onClick={() => setAttending(value)}
                aria-pressed={selected}
                className="flex min-w-28 items-center justify-center gap-1.5 rounded-full px-5 py-3 text-[15px] font-semibold shadow-sm transition-all"
                style={
                    selected
                        ? { background: primary, color: '#fff' }
                        : {
                              background: 'rgba(120,120,130,0.18)',
                              color: value ? theme.text : '#d6336c',
                          }
                }
            >
                <Icon className="size-4" />
                {label}
            </button>
        );
    };

    const fieldStyle = {
        background: 'rgba(255,255,255,0.55)',
        color: '#3f3a36',
        borderColor: `${secondary}55`,
    };

    return (
        <div className="space-y-6">
            <div
                className="space-y-5 rounded-3xl px-5 py-6 shadow-sm"
                style={{ background: theme.panel }}
            >
                <p
                    className="text-[18px] leading-[1.9]"
                    style={{ color: primary }}
                >
                    {copy.rsvpQuestion}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    {choice(true, copy.attending)}
                    {choice(false, copy.declining)}
                </div>
                {needsName && (
                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder={copy.yourName}
                        maxLength={120}
                        className="w-full rounded-2xl border px-4 py-3 text-[15px] outline-none placeholder:text-neutral-500"
                        style={fieldStyle}
                    />
                )}
                <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={copy.wishes}
                    maxLength={1000}
                    rows={3}
                    className="w-full resize-none rounded-2xl border px-4 py-3 text-[15px] leading-7 outline-none placeholder:text-neutral-500"
                    style={fieldStyle}
                />
                {Object.values(errors)[0] && (
                    <p className="text-sm text-red-600">
                        {Object.values(errors)[0]}
                    </p>
                )}
            </div>

            <button
                type="button"
                onClick={submit}
                disabled={!canSend}
                className="relative mx-auto block w-4/5 max-w-72 rounded-full p-[3px] shadow-lg transition-opacity disabled:opacity-60"
                style={{
                    background: `linear-gradient(135deg, ${secondary}, ${primary}, ${secondary})`,
                }}
            >
                <span
                    className="block rounded-full border py-3 text-[17px] font-bold text-white"
                    style={{
                        borderColor: 'rgba(255,255,255,0.7)',
                        background: `linear-gradient(180deg, ${primary}, ${secondary})`,
                        textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                    }}
                >
                    {copy.send}
                </span>
            </button>
        </div>
    );
}
