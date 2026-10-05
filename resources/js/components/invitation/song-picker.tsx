import { Check, Music, Pause, Play, VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Song } from '@/types';

type Choice = number | 'none' | null | undefined;

/** The song an invitation plays from the library for a choice. */
export function songUrl(songs: Song[], choice: Choice): string | null {
    if (choice === 'none') {
        return null;
    }

    const song =
        songs.find((item) => item.id === choice) ??
        songs.find((item) => item.is_default);

    return song?.url ?? null;
}

/**
 * The music library as a list: tap a song to choose it, tap its play
 * button to hear it first, or choose no music at all.
 */
export function SongPicker({
    songs,
    value,
    onChange,
    hasOwn,
}: {
    songs: Song[];
    value: Choice;
    onChange: (value: number | 'none' | null) => void;
    hasOwn: boolean;
}) {
    const { t } = useTranslation();
    const audio = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState<number | null>(null);
    const chosen = (song: Song) =>
        value === song.id ||
        ((value === null || value === undefined) && song.is_default);

    const preview = (song: Song) => {
        const player = audio.current;

        if (!player) {
            return;
        }

        if (playing === song.id) {
            player.pause();
            setPlaying(null);

            return;
        }

        player.src = song.url;
        void player.play();
        setPlaying(song.id);
    };

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">{t('design.music_library')}</p>
            {hasOwn && (
                <p className="text-xs text-muted-foreground">
                    {t('design.music_own_plays')}
                </p>
            )}
            <audio ref={audio} onEnded={() => setPlaying(null)} />
            <ul className={cn('space-y-1.5', hasOwn && 'opacity-60')}>
                {songs.map((song) => (
                    <li
                        key={song.id}
                        className={cn(
                            'flex items-center gap-2 rounded-2xl border p-2 transition-colors',
                            chosen(song)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                                : 'hover:bg-muted/60',
                        )}
                    >
                        <button
                            type="button"
                            onClick={() => preview(song)}
                            aria-label={t('design.music_preview')}
                            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {playing === song.id ? (
                                <Pause className="size-4" />
                            ) : (
                                <Play className="size-4" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                onChange(song.is_default ? null : song.id)
                            }
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium">
                                    {song.title}
                                </span>
                                {song.artist && (
                                    <span className="block truncate text-xs text-muted-foreground">
                                        {song.artist}
                                    </span>
                                )}
                            </span>
                            {song.is_default && (
                                <span className="shrink-0 rounded-full bg-muted px-2 text-[11px] text-muted-foreground">
                                    {t('design.music_default')}
                                </span>
                            )}
                            {chosen(song) && (
                                <Check className="size-5 shrink-0 text-blue-600" />
                            )}
                        </button>
                    </li>
                ))}
                <li>
                    <button
                        type="button"
                        onClick={() => onChange('none')}
                        className={cn(
                            'flex w-full items-center gap-2 rounded-2xl border p-2 text-left text-sm transition-colors',
                            value === 'none'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                                : 'hover:bg-muted/60',
                        )}
                    >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                            <VolumeX className="size-4" />
                        </span>
                        <span className="flex-1 font-medium">
                            {t('design.music_none')}
                        </span>
                        {value === 'none' && (
                            <Check className="size-5 shrink-0 text-blue-600" />
                        )}
                    </button>
                </li>
            </ul>
            {songs.length === 0 && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Music className="size-3.5" />
                    {t('design.music_library_empty')}
                </p>
            )}
        </div>
    );
}
