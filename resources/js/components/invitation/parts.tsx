import { Clock, Hand, Music, Navigation, Pause, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { InvitationMedia } from '@/types';
import type { ResolvedInvitation } from './resolve';
import { eventStart } from './resolve';

export function MusicButton({
    src,
    autoStart = false,
}: {
    src: string;
    autoStart?: boolean;
}) {
    const audio = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        // Runs right after the guest taps "open", while the browser still
        // counts it as a user gesture that may start audio.
        if (autoStart) {
            audio.current?.play().catch(() => undefined);
        }
    }, [autoStart]);

    const toggle = () => {
        if (!audio.current) {
            return;
        }

        if (playing) {
            audio.current.pause();
        } else {
            void audio.current.play();
        }
    };

    return (
        <div className="sticky top-3 z-10 flex h-0 justify-end pr-3">
            <audio
                ref={audio}
                src={src}
                loop
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
            />
            <button
                type="button"
                onClick={toggle}
                aria-label="Music"
                className="flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
            >
                {playing ? (
                    <Pause className="size-5" />
                ) : (
                    <Music className="size-5 animate-pulse" />
                )}
            </button>
        </div>
    );
}

export function TextPanel({
    background,
    children,
}: {
    background: string;
    children: ReactNode;
}) {
    return (
        <div
            className="rounded-3xl p-5 text-[15px] leading-8 whitespace-pre-line shadow-sm"
            style={{ background }}
        >
            {children}
        </div>
    );
}

export function DetailRow({
    icon,
    color,
    panel,
    text,
}: {
    icon: ReactNode;
    color: string;
    panel: string;
    text: string;
}) {
    return (
        <div
            className="flex items-center gap-3 rounded-2xl p-3 shadow-sm"
            style={{ background: panel }}
        >
            <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: color }}
            >
                {icon}
            </span>
            <span className="text-left text-[15px] leading-7">{text}</span>
        </div>
    );
}

export function ParentsBlock({ data }: { data: ResolvedInvitation }) {
    if (!data.groomParents && !data.brideParents) {
        return null;
    }

    const column = (label: string, names: string) =>
        names && (
            <div className="space-y-1">
                <p
                    className={`text-xs ${data.lang === 'en' ? 'tracking-wide uppercase' : ''}`}
                    style={{ color: data.secondary }}
                >
                    {label}
                </p>
                <p className="text-[15px] leading-7 font-semibold whitespace-pre-line">
                    {names}
                </p>
            </div>
        );

    return (
        <div className="grid grid-cols-2 gap-4 text-center">
            {column(data.copy.groomParents, data.groomParents)}
            {column(data.copy.brideParents, data.brideParents)}
        </div>
    );
}

export function AgendaList({ data }: { data: ResolvedInvitation }) {
    return (
        <ol className="space-y-3 text-left">
            {data.agenda.map((item, index) =>
                item.time ? (
                    <li
                        key={index}
                        className="relative border-l-2 pb-1 pl-5"
                        style={{ borderColor: `${data.primary}66` }}
                    >
                        <span
                            className="absolute top-2 -left-[7px] size-3 rounded-full"
                            style={{ background: data.primary }}
                        />
                        <p
                            className="flex items-center gap-1 text-sm font-semibold"
                            style={{ color: data.primary }}
                        >
                            <Clock className="size-3.5" />
                            {item.time}
                        </p>
                        <p className="text-[15px] leading-7">{item.title}</p>
                    </li>
                ) : (
                    <li
                        key={index}
                        className="pt-3 text-center text-base font-bold first:pt-0"
                        style={{ color: data.primary }}
                    >
                        {item.title}
                    </li>
                ),
            )}
        </ol>
    );
}

export function Gallery({ photos }: { photos: string[] }) {
    return (
        <div className="columns-2 gap-2 [&>img]:mb-2">
            {photos.map((url) => (
                <img
                    key={url}
                    src={url}
                    alt=""
                    loading="lazy"
                    className="w-full break-inside-avoid rounded-lg shadow-sm"
                />
            ))}
        </div>
    );
}

function remaining(target: Date) {
    const diff = Math.max(0, target.getTime() - Date.now());

    return {
        done: diff === 0,
        day: Math.floor(diff / 86_400_000),
        hour: Math.floor(diff / 3_600_000) % 24,
        minute: Math.floor(diff / 60_000) % 60,
        second: Math.floor(diff / 1000) % 60,
    };
}

export function Countdown({ data }: { data: ResolvedInvitation }) {
    const target = eventStart(data);
    const [left, setLeft] = useState(() => (target ? remaining(target) : null));
    const targetTime = target?.getTime();

    useEffect(() => {
        if (targetTime === undefined) {
            return;
        }

        const tick = () => setLeft(remaining(new Date(targetTime)));
        tick();
        const timer = window.setInterval(tick, 1000);

        return () => window.clearInterval(timer);
    }, [targetTime]);

    if (!left) {
        return null;
    }

    if (left.done) {
        return (
            <p
                className="text-lg font-semibold"
                style={{ color: data.primary }}
            >
                {data.copy.today}
            </p>
        );
    }

    return (
        <div className="grid grid-cols-4 gap-2">
            {(['day', 'hour', 'minute', 'second'] as const).map((unit) => (
                <div
                    key={unit}
                    className="rounded-2xl border py-3 shadow-sm"
                    style={{
                        borderColor: `${data.primary}55`,
                        background: data.theme.panel,
                    }}
                >
                    <p
                        className="text-2xl font-bold tabular-nums"
                        style={{ color: data.primary }}
                    >
                        {String(left[unit]).padStart(2, '0')}
                    </p>
                    <p className="text-xs">{data.copy.units[unit]}</p>
                </div>
            ))}
        </div>
    );
}

export function GiftSection({
    data,
    media,
}: {
    data: ResolvedInvitation;
    media: InvitationMedia;
}) {
    const options = (
        [
            ['usd', data.copy.giftUsd, media.khqr_usd],
            ['khr', data.copy.giftKhr, media.khqr_khr],
        ] as const
    ).filter(([key, , qr]) => qr || data.gift[key]?.number);
    const [selected, setSelected] = useState<'usd' | 'khr'>(
        options[0]?.[0] ?? 'usd',
    );

    if (options.length === 0) {
        return null;
    }

    const current = options.find(([key]) => key === selected) ?? options[0];
    const [key, , qr] = current;
    const account = data.gift[key] ?? {};

    return (
        <div className="space-y-4">
            <p className="text-sm leading-6">{data.copy.giftHint}</p>
            {options.length > 1 && (
                <div
                    className="mx-auto inline-flex rounded-full border p-1"
                    style={{ borderColor: `${data.primary}66` }}
                >
                    {options.map(([option, label]) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setSelected(option)}
                            className="rounded-full px-4 py-1 text-sm font-semibold"
                            style={
                                option === key
                                    ? {
                                          background: data.primary,
                                          color: '#fff',
                                      }
                                    : { color: data.primary }
                            }
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}
            <div className="mx-auto max-w-64 space-y-3 rounded-3xl bg-white p-4 text-neutral-800 shadow-md">
                {qr && (
                    <img src={qr} alt="KHQR" className="w-full rounded-xl" />
                )}
                {account.name && (
                    <p className="text-sm">
                        <span className="block text-xs text-neutral-500">
                            {data.copy.accountName}
                        </span>
                        <span className="font-semibold">{account.name}</span>
                    </p>
                )}
                {account.number && (
                    <p className="text-sm">
                        <span className="block text-xs text-neutral-500">
                            {data.copy.accountNumber}
                        </span>
                        <span className="font-mono font-semibold tracking-wider">
                            {account.number}
                        </span>
                    </p>
                )}
            </div>
            {account.link && (
                <a
                    href={account.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow"
                    style={{ background: data.primary }}
                >
                    <Send className="size-4" />
                    {data.copy.sendGift}
                </a>
            )}
        </div>
    );
}

export function MapButton({ data }: { data: ResolvedInvitation }) {
    return (
        <a
            href={data.mapHref!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow"
            style={{ background: data.primary }}
        >
            <Navigation className="size-4" />
            {data.copy.openMap}
        </a>
    );
}

export function ScrollHint({
    label,
    showEnglish,
    onClick,
}: {
    label: string;
    showEnglish: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="mt-6 flex items-center gap-3 rounded-full bg-black/35 px-6 py-2.5 text-white backdrop-blur-sm transition hover:bg-black/45"
        >
            <Hand className="size-6" />
            <span className="text-left leading-tight">
                <span className="block text-base">{label}</span>
                {showEnglish && (
                    <span className="block text-xs opacity-80">
                        Scroll down
                    </span>
                )}
            </span>
        </button>
    );
}
