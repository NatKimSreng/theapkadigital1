import { Form, Head, router } from '@inertiajs/react';
import { Music, Star, Trash2, Upload } from 'lucide-react';
import SongController from '@/actions/App/Http/Controllers/Admin/SongController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { AdminPage } from '@/layouts/admin-layout';
import { useTranslation } from '@/lib/i18n';
import type { Song } from '@/types';

export default function AdminSongs({
    songs,
    maxMb,
}: {
    songs: Song[];
    maxMb: number;
}) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('admin.music')} />
            <AdminPage title={t('admin.music')}>
                <p className="-mt-4 mb-6 max-w-2xl text-sm text-muted-foreground">
                    {t('admin.music_desc')}
                </p>

                <Form
                    {...SongController.store.form()}
                    resetOnSuccess
                    options={{ preserveScroll: true }}
                    className="mb-8 grid gap-4 rounded-2xl border bg-background p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-1.5">
                                <Label htmlFor="title">
                                    {t('admin.music_title')}
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    placeholder="ភ្លេងការ សារិកាកែវ"
                                />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="artist">
                                    {t('admin.music_artist')}
                                </Label>
                                <Input id="artist" name="artist" />
                                <InputError message={errors.artist} />
                            </div>
                            <div className="grid gap-1.5 sm:col-span-3">
                                <Label htmlFor="file">
                                    {t('admin.music_file', { max: maxMb })}
                                </Label>
                                <Input
                                    id="file"
                                    name="file"
                                    type="file"
                                    required
                                    accept="audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/wav,.mp3,.m4a,.aac,.ogg,.wav"
                                />
                                <InputError message={errors.file} />
                            </div>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-full px-6 sm:col-start-3"
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <Upload className="size-4" />
                                )}
                                {t('admin.music_upload')}
                            </Button>
                        </>
                    )}
                </Form>

                {songs.length === 0 ? (
                    <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                        {t('admin.music_empty')}
                    </p>
                ) : (
                    <ul className="divide-y rounded-2xl border bg-background">
                        {songs.map((song) => (
                            <li
                                key={song.id}
                                className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4"
                            >
                                <Music className="size-5 shrink-0 text-blue-600" />
                                <div className="min-w-40 flex-1">
                                    <p className="flex items-center gap-2 font-medium">
                                        {song.title}
                                        {song.is_default && (
                                            <span className="rounded-full bg-amber-100 px-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                {t('design.music_default')}
                                            </span>
                                        )}
                                    </p>
                                    {song.artist && (
                                        <p className="text-sm text-muted-foreground">
                                            {song.artist}
                                        </p>
                                    )}
                                </div>
                                <audio
                                    src={song.url}
                                    controls
                                    preload="none"
                                    className="h-10 w-full max-w-xs"
                                />
                                {!song.is_default && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full"
                                        onClick={() =>
                                            router.patch(
                                                SongController.update.url(
                                                    song.id,
                                                ),
                                                { is_default: true },
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        <Star className="size-4" />
                                        {t('admin.music_make_default')}
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full text-destructive"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                t(
                                                    'admin.music_delete_confirm',
                                                    {
                                                        title: song.title,
                                                    },
                                                ),
                                            )
                                        ) {
                                            router.delete(
                                                SongController.destroy.url(
                                                    song.id,
                                                ),
                                                { preserveScroll: true },
                                            );
                                        }
                                    }}
                                >
                                    <Trash2 className="size-4" />
                                    {t('common.delete')}
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </AdminPage>
        </>
    );
}
