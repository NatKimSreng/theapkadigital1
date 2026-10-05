import { Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    Check,
    ChevronDown,
    Copy,
    ExternalLink,
    ImagePlus,
    Play,
    MapPin,
    Maximize2,
    Minimize2,
    Music,
    Plus,
    QrCode,
    Save,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import InvitationController from '@/actions/App/Http/Controllers/InvitationController';
import { ConfirmDelete } from '@/components/event/confirm-delete';
import { SongPicker, songUrl } from '@/components/invitation/song-picker';
import { EventShell } from '@/components/event/event-shell';
import { selectClassName } from '@/components/event/fields';
import {
    FALLING_EFFECTS,
    OPENING_STYLES,
} from '@/components/invitation/animations';
import { InvitationCard } from '@/components/invitation/invitation-card';
import { resolveInvitation, startLang } from '@/components/invitation/resolve';
import type { TemplateDefinition } from '@/components/invitation/templates';
import { findTemplate } from '@/components/invitation/templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type {
    AgendaItem,
    GiftAccount,
    Invitation,
    InvitationLang,
    InvitationLanguages,
    InvitationMedia,
    InvitationMediaKey,
    InvitationSettings,
    InvitationTextKey,
    PlannerEvent,
    Song,
} from '@/types';
import { INVITATION_MEDIA, MAX_GALLERY } from '@/types/event';

const LANGUAGE_MODES: { value: InvitationLanguages; label: TranslationKey }[] =
    [
        { value: 'both', label: 'design.languages_both' },
        { value: 'km', label: 'design.languages_km' },
        { value: 'en', label: 'design.languages_en' },
    ];

type GuestOption = { id: number; name: string; invite_url: string | null };

type UploadLimits = { music: number; image: number; total: number };

type Props = {
    event: PlannerEvent;
    invitations: Invitation[];
    selectedId: number | null;
    guests: GuestOption[];
    uploadLimits: UploadLimits;
    songs: Song[];
};

export default function Invitations({
    event,
    invitations,
    selectedId,
    guests,
    uploadLimits,
    songs,
}: Props) {
    const { t } = useTranslation();
    const invitation = invitations.find((item) => item.id === selectedId);
    const template = invitation ? findTemplate(invitation.template) : null;

    return (
        <EventShell event={event} title={t('tab.design')}>
            {invitation && template?.theme ? (
                <>
                    <h2 className="text-lg font-bold">
                        {t('design.my_templates')}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <select
                            aria-label={t('design.my_templates')}
                            value={invitation.id}
                            onChange={(e) =>
                                router.get(
                                    InvitationController.index.url(event.id, {
                                        query: { invitation: e.target.value },
                                    }),
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                            className={cn(
                                selectClassName,
                                'h-10 w-auto min-w-64 rounded-full',
                            )}
                        >
                            {invitations.map((item) => {
                                const definition = findTemplate(item.template);

                                return (
                                    <option key={item.id} value={item.id}>
                                        {definition
                                            ? t(definition.name)
                                            : item.template}
                                    </option>
                                );
                            })}
                        </select>

                        {invitation.is_active ? (
                            <span className="flex h-10 items-center gap-1.5 rounded-full bg-emerald-50 px-4 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                <Check className="size-4" />
                                {t('design.active')}
                            </span>
                        ) : (
                            <Button
                                variant="outline"
                                className="h-10 rounded-full"
                                onClick={() =>
                                    router.post(
                                        InvitationController.activate.url({
                                            event: event.id,
                                            invitation: invitation.id,
                                        }),
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                <Check className="size-4" />
                                {t('design.use')}
                            </Button>
                        )}

                        <ConfirmDelete
                            url={InvitationController.destroy.url({
                                event: event.id,
                                invitation: invitation.id,
                            })}
                            trigger={
                                <Button
                                    variant="ghost"
                                    className="h-10 rounded-full text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="size-4" />
                                    {t('design.remove_template')}
                                </Button>
                            }
                        />
                    </div>

                    <Editor
                        key={invitation.id}
                        event={event}
                        invitation={invitation}
                        template={template}
                        guests={guests}
                        uploadLimits={uploadLimits}
                        songs={songs}
                    />
                </>
            ) : (
                <div className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
                    <h2 className="text-lg font-bold">
                        {t('design.empty_title')}
                    </h2>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                        {t('design.empty_body')}
                    </p>
                    <Button asChild className="mt-6 rounded-full">
                        <Link href={InvitationController.catalog.url(event.id)}>
                            <Plus className="size-4" />
                            {t('design.browse')}
                        </Link>
                    </Button>
                </div>
            )}
        </EventShell>
    );
}

function without<T extends object>(record: T, key: keyof T): T {
    const copy = { ...record };
    delete copy[key];

    return copy;
}

/**
 * Local preview URLs for files picked but not yet uploaded.
 */
function useObjectUrls(
    files: Partial<Record<InvitationMediaKey, File>>,
): Partial<Record<InvitationMediaKey, string>> {
    const [urls, setUrls] = useState<
        Partial<Record<InvitationMediaKey, string>>
    >({});

    useEffect(() => {
        const created = Object.fromEntries(
            Object.entries(files).map(([key, file]) => [
                key,
                URL.createObjectURL(file),
            ]),
        );
        setUrls(created);

        return () =>
            Object.values(created).forEach((url) => URL.revokeObjectURL(url));
    }, [files]);

    return urls;
}

function useFileUrls(files: File[]): string[] {
    const [urls, setUrls] = useState<string[]>([]);

    useEffect(() => {
        const created = files.map((file) => URL.createObjectURL(file));
        setUrls(created);

        return () => created.forEach((url) => URL.revokeObjectURL(url));
    }, [files]);

    return urls;
}

type EditorProps = {
    event: PlannerEvent;
    invitation: Invitation;
    template: TemplateDefinition;
    guests: GuestOption[];
    uploadLimits: UploadLimits;
    songs: Song[];
};

function megabytes(bytes: number): string {
    return (bytes / 1024 / 1024).toFixed(1).replace(/\.0$/, '');
}

function Editor({
    event,
    invitation,
    template,
    guests,
    uploadLimits,
    songs,
}: EditorProps) {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<InvitationSettings>(
        invitation.settings ?? {},
    );
    const [lang, setLang] = useState<InvitationLang>(() =>
        startLang(invitation.settings ?? {}),
    );
    const [files, setFiles] = useState<
        Partial<Record<InvitationMediaKey, File>>
    >({});
    const [removed, setRemoved] = useState<
        Partial<Record<InvitationMediaKey, true>>
    >({});
    const [saved, setSaved] = useState(() =>
        JSON.stringify(invitation.settings ?? {}),
    );
    const [saving, setSaving] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [openingRun, setOpeningRun] = useState(0);
    const fileUrls = useObjectUrls(files);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [removedGallery, setRemovedGallery] = useState<string[]>([]);
    const galleryFileUrls = useFileUrls(galleryFiles);
    const existingGallery = invitation.media.gallery
        .map((url, index) => ({
            url,
            path: invitation.settings?.gallery_paths?.[index] ?? '',
        }))
        .filter((photo) => !removedGallery.includes(photo.path));

    useEffect(() => {
        if (!fullscreen) {
            return;
        }

        const onKey = (e: KeyboardEvent) =>
            e.key === 'Escape' && setFullscreen(false);
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [fullscreen]);

    const previewMedia: InvitationMedia = {
        ...(Object.fromEntries(
            INVITATION_MEDIA.map((key) => [
                key,
                fileUrls[key] ?? (removed[key] ? null : invitation.media[key]),
            ]),
        ) as Record<InvitationMediaKey, string | null>),
        gallery: [
            ...existingGallery.map((photo) => photo.url),
            ...galleryFileUrls,
        ],
        song: songUrl(songs, settings.song, template.key),
    };
    const galleryCount = existingGallery.length + galleryFiles.length;

    // The server reads the pin from the saved map link, so only trust it
    // while the link in the form is still the saved one.
    const savedPlace =
        settings.map_url && settings.map_url === invitation.settings?.map_url
            ? (invitation.settings?.map_place ?? null)
            : null;
    const preview = { ...settings, map_place: savedPlace };
    const defaults = resolveInvitation(
        template,
        { map_place: savedPlace },
        event,
        lang,
    );
    const texts = settings.texts?.[lang] ?? {};
    const agenda = settings.agenda ?? [];
    const dirty =
        JSON.stringify(settings) !== saved ||
        Object.keys(files).length > 0 ||
        Object.keys(removed).length > 0 ||
        galleryFiles.length > 0 ||
        removedGallery.length > 0;

    const set = <K extends keyof InvitationSettings>(
        key: K,
        value: InvitationSettings[K],
    ) => setSettings((current) => ({ ...current, [key]: value }));

    const languageMode = settings.languages ?? 'both';

    const chooseLanguages = (mode: InvitationLanguages) => {
        set('languages', mode);

        // With one language there is nothing else to edit.
        if (mode !== 'both') {
            setLang(mode);
        }
    };

    const setText = (key: InvitationTextKey, value: string) =>
        setSettings((current) => ({
            ...current,
            texts: {
                ...current.texts,
                [lang]: { ...current.texts?.[lang], [key]: value },
            },
        }));

    const setAgenda = (index: number, patch: Partial<AgendaItem>) =>
        set(
            'agenda',
            agenda.map((item, i) =>
                i === index ? { ...item, ...patch } : item,
            ),
        );

    const setGift = (
        currency: 'usd' | 'khr',
        field: keyof GiftAccount,
        value: string,
    ) =>
        setSettings((current) => ({
            ...current,
            gift: {
                ...current.gift,
                [currency]: { ...current.gift?.[currency], [field]: value },
            },
        }));

    const parentsPlaceholder =
        lang === 'km' ? 'លោក ...\nលោកស្រី ...' : 'Mr. ...\nMrs. ...';

    const fitsLimit = (file: File, limit: number): boolean => {
        if (file.size <= limit) {
            return true;
        }

        toast.error(
            `${file.name}: ${t('design.file_too_large', {
                size: megabytes(file.size),
                max: megabytes(limit),
            })}`,
        );

        return false;
    };

    const pickFile = (key: InvitationMediaKey, file: File | undefined) => {
        if (
            !file ||
            !fitsLimit(
                file,
                key === 'music' ? uploadLimits.music : uploadLimits.image,
            )
        ) {
            return;
        }

        setFiles((current) => ({ ...current, [key]: file }));
        setRemoved((current) => without(current, key));
    };

    const removeFile = (key: InvitationMediaKey) => {
        setFiles((current) => without(current, key));

        if (invitation.media[key]) {
            setRemoved((current) => ({ ...current, [key]: true }));
        }
    };

    const save = () => {
        const pendingBytes = [...Object.values(files), ...galleryFiles].reduce(
            (sum, file) => sum + file.size,
            0,
        );

        // Leave room for the form fields sent alongside the files.
        if (pendingBytes > uploadLimits.total - 256 * 1024) {
            toast.error(
                t('design.upload_too_large', {
                    size: megabytes(pendingBytes),
                    max: megabytes(uploadLimits.total),
                }),
            );

            return;
        }

        const payload: Record<string, unknown> = {
            _method: 'put',
            settings: JSON.stringify(settings),
            ...files,
            gallery: galleryFiles,
            remove_gallery: removedGallery,
        };

        for (const key of Object.keys(removed)) {
            payload[`remove_${key}`] = 1;
        }

        router.post(
            InvitationController.update.url({
                event: event.id,
                invitation: invitation.id,
            }),
            payload as never,
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
                onSuccess: () => {
                    setFiles({});
                    setRemoved({});
                    setGalleryFiles([]);
                    setRemovedGallery([]);
                    setSaved(JSON.stringify(settings));
                },
                onError: (errors) =>
                    toast.error(Object.values(errors)[0] ?? ''),
            },
        );
    };

    const textField = (
        key: InvitationTextKey,
        label: TranslationKey,
        placeholder: string,
        multiline = false,
    ) => (
        <TextField
            key={`${lang}-${key}`}
            id={key}
            label={t(label)}
            value={texts[key] ?? ''}
            placeholder={placeholder}
            multiline={multiline}
            onChange={(value) => setText(key, value)}
        />
    );

    const image = (key: InvitationMediaKey, label: string) => (
        <ImageField
            key={key}
            label={label}
            url={previewMedia[key]}
            qr={key.startsWith('khqr')}
            onPick={(file) => pickFile(key, file)}
            onRemove={() => removeFile(key)}
        />
    );

    const langLabel = t(lang === 'km' ? 'design.lang_km' : 'design.lang_en');
    const paneHeight = fullscreen
        ? 'h-[calc(100svh-3.5rem)] overflow-y-auto'
        : 'lg:h-[calc(100svh-15rem)] lg:overflow-y-auto';

    return (
        <div
            className={cn(
                'grid overflow-hidden lg:grid-cols-[minmax(340px,460px)_1fr]',
                fullscreen
                    ? 'fixed inset-0 z-50 bg-background'
                    : 'mt-5 rounded-2xl border-2 border-dashed',
            )}
        >
            <div className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0">
                <div className="flex h-14 items-center justify-between bg-slate-800 px-4 text-white">
                    <span className="font-bold">{t('design.editor')}</span>
                    <button
                        type="button"
                        onClick={() => setFullscreen(!fullscreen)}
                        aria-label={t(
                            fullscreen
                                ? 'design.exit_fullscreen'
                                : 'design.fullscreen',
                        )}
                        title={t(
                            fullscreen
                                ? 'design.exit_fullscreen'
                                : 'design.fullscreen',
                        )}
                        className="rounded-md p-1.5 hover:bg-white/10"
                    >
                        {fullscreen ? (
                            <Minimize2 className="size-5" />
                        ) : (
                            <Maximize2 className="size-5" />
                        )}
                    </button>
                </div>

                <div className={cn('space-y-5 bg-muted/40 p-4', paneHeight)}>
                    <div className="space-y-3 rounded-2xl bg-blue-50 p-4 text-sm dark:bg-blue-950">
                        <div>
                            <p className="font-semibold">
                                {t('design.languages')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t('design.languages_hint')}
                            </p>
                        </div>
                        <div
                            role="radiogroup"
                            aria-label={t('design.languages')}
                            className="grid grid-cols-3 gap-1 rounded-xl bg-background p-1"
                        >
                            {LANGUAGE_MODES.map((mode) => (
                                <button
                                    key={mode.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={languageMode === mode.value}
                                    onClick={() => chooseLanguages(mode.value)}
                                    className={cn(
                                        'rounded-lg px-2 py-2 text-xs leading-tight font-medium transition-colors',
                                        languageMode === mode.value
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-muted-foreground hover:bg-muted',
                                    )}
                                >
                                    {t(mode.label)}
                                </button>
                            ))}
                        </div>
                        {languageMode === 'both' ? (
                            <div className="flex items-center justify-between gap-3 border-t border-blue-200 pt-3 dark:border-blue-900">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            lang === 'km'
                                                ? 'font-medium text-blue-700 dark:text-blue-300'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        {t('design.lang_km')}
                                    </span>
                                    <Toggle
                                        checked={lang === 'en'}
                                        label={t('design.lang_en')}
                                        onChange={(on) =>
                                            setLang(on ? 'en' : 'km')
                                        }
                                    />
                                    <span
                                        className={cn(
                                            lang === 'en'
                                                ? 'font-medium text-blue-700 dark:text-blue-300'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        {t('design.lang_en')}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {t('design.editing', { lang: langLabel })}
                                </span>
                            </div>
                        ) : (
                            <p className="border-t border-blue-200 pt-3 text-xs text-muted-foreground dark:border-blue-900">
                                {t('design.single_language', {
                                    lang: langLabel,
                                })}
                            </p>
                        )}
                    </div>

                    <Panel title={t('design.music')} dot="bg-blue-500">
                        {previewMedia.music ? (
                            <div className="flex items-center gap-2 rounded-2xl bg-muted/60 p-3">
                                <Music className="size-5 shrink-0 text-blue-600" />
                                <audio
                                    src={previewMedia.music}
                                    controls
                                    className="h-10 min-w-0 flex-1"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFile('music')}
                                    aria-label={t('design.remove')}
                                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        ) : (
                            <FileButton
                                accept="audio/*"
                                onPick={(file) => pickFile('music', file)}
                            >
                                <Upload className="size-4" />
                                {t('design.upload')}
                            </FileButton>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {t('design.music_hint')}
                        </p>
                        <SongPicker
                            songs={songs}
                            value={settings.song}
                            onChange={(value) => set('song', value)}
                            template={template.key}
                            hasOwn={!!previewMedia.music}
                        />
                    </Panel>

                    <Panel title={t('design.appearance')} dot="bg-slate-500">
                        <ColorField
                            id="primary_color"
                            label={t('design.primary_color')}
                            value={settings.primary_color || defaults.primary}
                            changed={!!settings.primary_color}
                            onChange={(value) => set('primary_color', value)}
                            onReset={() => set('primary_color', null)}
                        />
                        <ColorField
                            id="secondary_color"
                            label={t('design.secondary_color')}
                            value={
                                settings.secondary_color || defaults.secondary
                            }
                            changed={!!settings.secondary_color}
                            onChange={(value) => set('secondary_color', value)}
                            onReset={() => set('secondary_color', null)}
                        />
                        <ToggleRow
                            label={t('design.gold_text')}
                            hint={t('design.gold_hint')}
                            checked={!!settings.gold_text}
                            onChange={(on) => set('gold_text', on)}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            {image('cover', t('design.cover'))}
                            {image('background', t('design.background'))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {image('frame', t('design.frame'))}
                            <p className="self-center text-xs leading-relaxed text-muted-foreground">
                                {t('design.frame_hint')}
                            </p>
                        </div>
                    </Panel>

                    <Panel
                        title={`${t('design.heading')} (${langLabel})`}
                        dot="bg-emerald-500"
                    >
                        <p className="text-xs text-muted-foreground">
                            {t('design.auto_hint')}
                        </p>
                        {textField('title', 'design.title', defaults.title)}
                        <ToggleRow
                            label={t('design.hide_hosts')}
                            checked={!!settings.hide_hosts}
                            onChange={(on) => set('hide_hosts', on)}
                        />
                        {!settings.hide_hosts && (
                            <>
                                {textField(
                                    'host_left',
                                    'design.host_left',
                                    defaults.hostLeft,
                                )}
                                {textField(
                                    'host_right',
                                    'design.host_right',
                                    defaults.hostRight,
                                )}
                                {textField(
                                    'joiner',
                                    'design.joiner',
                                    defaults.joiner,
                                )}
                            </>
                        )}
                        {textField(
                            'invite_line',
                            'design.invite_line',
                            defaults.inviteLine,
                        )}
                        {textField(
                            'guest_name',
                            'design.guest_name',
                            defaults.guestName,
                        )}
                        {textField(
                            'date_text',
                            'design.date_text',
                            defaults.dateText,
                        )}
                        {textField(
                            'lunar_date',
                            'design.lunar_date',
                            lang === 'km'
                                ? 'ថ្ងៃសៅរ៍ ៤រោច ខែកត្តិក ឆ្នាំម្សាញ់ សប្តស័ក ពុទ្ធសករាជ ២៥៧០'
                                : 'Saturday, 4th waning day of Kattik, BE 2570',
                        )}
                        {textField(
                            'venue_text',
                            'design.venue_text',
                            defaults.venueText,
                        )}
                        {textField('address', 'design.address', '')}
                        <div className="grid gap-1.5">
                            <Label htmlFor="event_time">
                                {t('design.event_time')}
                            </Label>
                            <Input
                                id="event_time"
                                type="time"
                                value={settings.event_time ?? ''}
                                onChange={(e) =>
                                    set('event_time', e.target.value || null)
                                }
                                className="w-40 bg-background"
                            />
                        </div>
                        <ToggleRow
                            label={t('design.show_countdown')}
                            hint={
                                event.event_date
                                    ? undefined
                                    : t('design.countdown_needs_date')
                            }
                            checked={settings.show_countdown ?? true}
                            onChange={(on) => set('show_countdown', on)}
                        />
                    </Panel>

                    <Panel
                        title={`${t('design.parents')} (${langLabel})`}
                        dot="bg-teal-500"
                    >
                        <p className="text-xs text-muted-foreground">
                            {t('design.parents_hint')}
                        </p>
                        {textField(
                            'groom_parents',
                            'design.groom_parents',
                            parentsPlaceholder,
                            true,
                        )}
                        {textField(
                            'bride_parents',
                            'design.bride_parents',
                            parentsPlaceholder,
                            true,
                        )}
                    </Panel>

                    <Panel
                        title={`${t('design.message_section')} (${langLabel})`}
                        dot="bg-amber-500"
                    >
                        {textField(
                            'message_title',
                            'design.message_title',
                            defaults.messageTitle,
                        )}
                        {textField(
                            'message',
                            'design.message',
                            defaults.message,
                            true,
                        )}
                        {textField('procession', 'design.procession', '', true)}
                    </Panel>

                    <details className="group rounded-3xl bg-background shadow-sm">
                        <summary className="flex cursor-pointer list-none items-center gap-2 p-4 font-bold">
                            <CalendarDays className="size-5" />
                            {t('design.agenda')}
                            {agenda.length > 0 && (
                                <span className="rounded-full bg-muted px-2 text-xs font-normal">
                                    {agenda.length}
                                </span>
                            )}
                            <ChevronDown className="ml-auto size-5 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="space-y-3 px-4 pb-4">
                            <p className="text-xs text-muted-foreground">
                                {t('design.agenda_hint')}
                            </p>
                            {agenda.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-2"
                                >
                                    <Input
                                        aria-label={t('design.agenda_time')}
                                        placeholder={t('design.agenda_time')}
                                        value={item.time ?? ''}
                                        onChange={(e) =>
                                            setAgenda(index, {
                                                time: e.target.value,
                                            })
                                        }
                                    />
                                    <Input
                                        aria-label={t('design.agenda_item')}
                                        placeholder={`${t('design.agenda_item')} (${langLabel})`}
                                        value={item[lang] ?? ''}
                                        onChange={(e) =>
                                            setAgenda(index, {
                                                [lang]: e.target.value,
                                            })
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            set(
                                                'agenda',
                                                agenda.filter(
                                                    (_, i) => i !== index,
                                                ),
                                            )
                                        }
                                        aria-label={t('common.delete')}
                                        className="p-1 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                disabled={agenda.length >= 20}
                                onClick={() =>
                                    set('agenda', [
                                        ...agenda,
                                        { time: '', km: '', en: '' },
                                    ])
                                }
                            >
                                <Plus className="size-4" />
                                {t('design.agenda_add')}
                            </Button>
                        </div>
                    </details>

                    <Panel title={t('design.location')} dot="bg-purple-500">
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="map_url"
                                className="flex items-center gap-1.5"
                            >
                                <MapPin className="size-4" />
                                {t('design.map_url')}
                            </Label>
                            <Input
                                id="map_url"
                                type="url"
                                placeholder="https://maps.app.goo.gl/..."
                                value={settings.map_url ?? ''}
                                onChange={(e) => set('map_url', e.target.value)}
                                className="bg-background"
                            />
                            <p
                                className={cn(
                                    'text-xs',
                                    settings.map_url &&
                                        settings.map_url ===
                                            invitation.settings?.map_url &&
                                        !savedPlace
                                        ? 'text-destructive'
                                        : 'text-muted-foreground',
                                )}
                            >
                                {!settings.map_url
                                    ? t('design.map_hint')
                                    : settings.map_url !==
                                        invitation.settings?.map_url
                                      ? t('design.map_pending')
                                      : savedPlace
                                        ? t('design.map_found', {
                                              place:
                                                  savedPlace.name ??
                                                  `${savedPlace.lat}, ${savedPlace.lng}`,
                                          })
                                        : t('design.map_not_found')}
                            </p>
                        </div>
                        <div className="w-1/2 pr-1.5">
                            {image('map', t('design.map_image'))}
                        </div>
                    </Panel>

                    <Panel
                        title={`${t('design.gallery')} (${galleryCount}/${MAX_GALLERY})`}
                        dot="bg-rose-500"
                    >
                        <div className="grid grid-cols-3 gap-2">
                            {existingGallery.map((photo) => (
                                <GalleryThumb
                                    key={photo.path}
                                    url={photo.url}
                                    onRemove={() =>
                                        setRemovedGallery((current) => [
                                            ...current,
                                            photo.path,
                                        ])
                                    }
                                />
                            ))}
                            {galleryFiles.map((file, index) => (
                                <GalleryThumb
                                    key={`${file.name}-${index}`}
                                    url={galleryFileUrls[index] ?? null}
                                    onRemove={() =>
                                        setGalleryFiles((current) =>
                                            current.filter(
                                                (_, i) => i !== index,
                                            ),
                                        )
                                    }
                                />
                            ))}
                        </div>
                        <FileButton
                            accept="image/*"
                            multiple
                            disabled={galleryCount >= MAX_GALLERY}
                            onPickMany={(picked) => {
                                const accepted = picked.filter((file) =>
                                    fitsLimit(file, uploadLimits.image),
                                );
                                setGalleryFiles((current) =>
                                    [...current, ...accepted].slice(
                                        0,
                                        MAX_GALLERY - existingGallery.length,
                                    ),
                                );
                            }}
                        >
                            <ImagePlus className="size-4" />
                            {t('design.gallery_add')}
                        </FileButton>
                    </Panel>

                    <Panel
                        title={`${t('design.thanks_section')} (${langLabel})`}
                        dot="bg-amber-500"
                    >
                        {textField(
                            'thanks_title',
                            'design.thanks_title',
                            defaults.thanksTitle,
                        )}
                        {textField(
                            'thanks',
                            'design.thanks',
                            defaults.thanks,
                            true,
                        )}
                    </Panel>

                    <Panel title={t('design.khqr')} dot="bg-yellow-500">
                        <div className="grid grid-cols-2 gap-3">
                            {(['usd', 'khr'] as const).map((currency) => (
                                <div key={currency} className="space-y-2">
                                    {image(
                                        `khqr_${currency}`,
                                        t(`design.khqr_${currency}`),
                                    )}
                                    {(
                                        [
                                            ['name', 'design.account_name'],
                                            ['number', 'design.account_number'],
                                            ['link', 'design.pay_link'],
                                        ] as const
                                    ).map(([field, label]) => (
                                        <Input
                                            key={field}
                                            aria-label={t(label)}
                                            placeholder={t(label)}
                                            type={
                                                field === 'link'
                                                    ? 'url'
                                                    : 'text'
                                            }
                                            value={
                                                settings.gift?.[currency]?.[
                                                    field
                                                ] ?? ''
                                            }
                                            onChange={(e) =>
                                                setGift(
                                                    currency,
                                                    field,
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 bg-background text-xs"
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel title={t('design.animation')} dot="bg-fuchsia-500">
                        <ChoiceGroup
                            label={t('design.opening')}
                            options={OPENING_STYLES.map((value) => ({
                                value,
                                label: t(`design.opening_${value}`),
                            }))}
                            value={settings.opening ?? template.theme!.opening}
                            onChange={(value) => {
                                set('opening', value);
                                setOpeningRun((run) => run + 1);
                            }}
                        />
                        <ChoiceGroup
                            label={t('design.effect')}
                            options={FALLING_EFFECTS.map((value) => ({
                                value,
                                label: t(`design.effect_${value}`),
                            }))}
                            value={settings.effect ?? template.theme!.effect}
                            onChange={(value) => set('effect', value)}
                        />
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => setOpeningRun((run) => run + 1)}
                        >
                            <Play className="size-4" />
                            {t('design.play_opening')}
                        </Button>
                    </Panel>

                    {languageMode === 'both' && (
                        <Panel title={t('design.language')} dot="bg-blue-500">
                            <select
                                aria-label={t('design.language')}
                                value={settings.language ?? 'km'}
                                onChange={(e) =>
                                    set(
                                        'language',
                                        e.target.value as InvitationLang,
                                    )
                                }
                                className={cn(
                                    selectClassName,
                                    'w-40 bg-background',
                                )}
                            >
                                <option value="km">Khmer</option>
                                <option value="en">English</option>
                            </select>
                            <p className="text-xs text-muted-foreground">
                                {t('design.language_hint')}
                            </p>
                        </Panel>
                    )}

                    <SharePanel invitation={invitation} guests={guests} />
                </div>
            </div>

            <div className="flex min-h-0 flex-col">
                <div className="flex h-14 items-center justify-between gap-3 border-b px-4">
                    <span className="font-bold">{t('design.preview')}</span>
                    <div className="flex items-center gap-3">
                        {dirty && (
                            <span className="hidden text-xs text-amber-600 sm:inline">
                                {t('design.unsaved')}
                            </span>
                        )}
                        <span className="hidden text-xs text-muted-foreground xl:inline">
                            {t(template.name)}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setOpeningRun((run) => run + 1)}
                            className="rounded-full"
                        >
                            <Play className="size-4" />
                            <span className="hidden sm:inline">
                                {t('design.play_opening')}
                            </span>
                        </Button>
                        <Button
                            onClick={save}
                            disabled={saving || !dirty}
                            className="rounded-full"
                        >
                            <Save className="size-4" />
                            {t('common.save')}
                        </Button>
                    </div>
                </div>
                <div className={cn('bg-muted/30', paneHeight)}>
                    <div className="mx-auto max-w-[420px] shadow-xl">
                        <InvitationCard
                            template={template}
                            settings={preview}
                            media={previewMedia}
                            event={event}
                            lang={lang}
                            gate={openingRun > 0}
                            key={openingRun}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Panel({
    title,
    dot,
    children,
}: {
    title: string;
    dot: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-3 rounded-3xl bg-background p-4 shadow-sm">
            <h3 className="flex items-center gap-2 font-bold">
                <span className={cn('size-2 rounded-full', dot)} />
                {title}
            </h3>
            {children}
        </section>
    );
}

function TextField({
    id,
    label,
    value,
    placeholder,
    multiline,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    placeholder: string;
    multiline: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            {multiline ? (
                <textarea
                    id={id}
                    rows={6}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
            ) : (
                <Input
                    id={id}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className="bg-background"
                />
            )}
        </div>
    );
}

function Toggle({
    checked,
    label,
    onChange,
}: {
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                checked ? 'bg-primary' : 'bg-muted-foreground/30',
            )}
        >
            <span
                className={cn(
                    'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform',
                    checked && 'translate-x-5',
                )}
            />
        </button>
    );
}

function ToggleRow({
    label,
    hint,
    checked,
    onChange,
}: {
    label: string;
    hint?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-2xl border bg-background p-3">
            <div>
                <p className="text-sm font-medium">{label}</p>
                {hint && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {hint}
                    </p>
                )}
            </div>
            <Toggle checked={checked} label={label} onChange={onChange} />
        </div>
    );
}

function FileButton({
    accept,
    onPick,
    onPickMany,
    multiple = false,
    disabled = false,
    children,
}: {
    accept: string;
    onPick?: (file: File | undefined) => void;
    onPickMany?: (files: File[]) => void;
    multiple?: boolean;
    disabled?: boolean;
    children: ReactNode;
}) {
    const input = useRef<HTMLInputElement>(null);

    return (
        <>
            <input
                ref={input}
                type="file"
                accept={accept}
                multiple={multiple}
                className="hidden"
                onChange={(e) => {
                    const picked = Array.from(e.target.files ?? []);
                    onPick?.(picked[0]);
                    onPickMany?.(picked);
                    e.target.value = '';
                }}
            />
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={disabled}
                onClick={() => input.current?.click()}
            >
                {children}
            </Button>
        </>
    );
}

function ChoiceGroup<T extends string>({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
}) {
    return (
        <div className="grid gap-1.5">
            <span className="text-sm font-medium">{label}</span>
            <div className="flex flex-wrap gap-1.5">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={option.value === value}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'rounded-full border px-3 py-1 text-sm transition-colors',
                            option.value === value
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'bg-background hover:bg-muted',
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function GalleryThumb({
    url,
    onRemove,
}: {
    url: string | null;
    onRemove: () => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            {url && <img src={url} alt="" className="size-full object-cover" />}
            <button
                type="button"
                onClick={onRemove}
                aria-label={t('design.remove')}
                className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
            >
                <X className="size-3.5" />
            </button>
        </div>
    );
}

function ColorField({
    id,
    label,
    value,
    changed,
    onChange,
    onReset,
}: {
    id: string;
    label: string;
    value: string;
    changed: boolean;
    onChange: (value: string) => void;
    onReset: () => void;
}) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState(value);

    useEffect(() => setDraft(value), [value]);

    return (
        <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
                <Label htmlFor={id}>{label}</Label>
                {changed && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="text-xs text-muted-foreground hover:text-foreground"
                    >
                        {t('design.reset_color')}
                    </button>
                )}
            </div>
            <div className="flex gap-2">
                <input
                    type="color"
                    aria-label={label}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-9 w-14 shrink-0 cursor-pointer rounded-md border bg-background p-1"
                />
                <Input
                    id={id}
                    value={draft}
                    onChange={(e) => {
                        setDraft(e.target.value);

                        if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                            onChange(e.target.value);
                        }
                    }}
                    className="bg-background font-mono"
                />
            </div>
        </div>
    );
}

function ImageField({
    label,
    url,
    qr,
    onPick,
    onRemove,
}: {
    label: string;
    url: string | null;
    qr: boolean;
    onPick: (file: File | undefined) => void;
    onRemove: () => void;
}) {
    const { t } = useTranslation();
    const input = useRef<HTMLInputElement>(null);
    const Icon = qr ? QrCode : ImagePlus;

    return (
        <div className="grid gap-1.5">
            <span className="text-sm font-medium">{label}</span>
            <input
                ref={input}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    onPick(e.target.files?.[0]);
                    e.target.value = '';
                }}
            />
            <button
                type="button"
                onClick={() => input.current?.click()}
                className="relative aspect-square overflow-hidden rounded-xl border border-dashed bg-muted text-muted-foreground hover:text-foreground"
            >
                {url ? (
                    <img src={url} alt="" className="size-full object-cover" />
                ) : (
                    <span className="flex size-full flex-col items-center justify-center gap-1 text-xs">
                        <Icon className="size-6" />
                        {label}
                    </span>
                )}
            </button>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full"
                    onClick={() => input.current?.click()}
                >
                    <Upload className="size-3.5" />
                    {t('design.upload')}
                </Button>
                <button
                    type="button"
                    onClick={onRemove}
                    disabled={!url}
                    aria-label={t('design.remove')}
                    className="flex size-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-40"
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}

function SharePanel({
    invitation,
    guests,
}: {
    invitation: Invitation;
    guests: GuestOption[];
}) {
    const { t } = useTranslation();
    const [guestId, setGuestId] = useState('');
    const guest = guests.find((item) => String(item.id) === guestId);

    const link =
        guest?.invite_url ??
        window.location.origin +
            InvitationController.share.url(invitation.public_id);

    const copy = async () => {
        await navigator.clipboard.writeText(link);
        toast.success(t('design.copied'));
    };

    return (
        <Panel title={t('design.share')} dot="bg-emerald-500">
            <p className="text-xs text-muted-foreground">
                {t('design.share_hint')}
            </p>
            <div className="grid gap-1.5">
                <Label htmlFor="share_guest">{t('design.share_guest')}</Label>
                <select
                    id="share_guest"
                    value={guestId}
                    onChange={(e) => setGuestId(e.target.value)}
                    className={cn(selectClassName, 'bg-background')}
                >
                    <option value="">{t('design.share_none')}</option>
                    {guests.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
            </div>
            <Input readOnly value={link} className="bg-background text-xs" />
            <div className="flex gap-2">
                <Button
                    type="button"
                    size="sm"
                    className="rounded-full"
                    onClick={copy}
                >
                    <Copy className="size-4" />
                    {t('design.copy_link')}
                </Button>
                <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                >
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4" />
                        {t('design.open')}
                    </a>
                </Button>
            </div>
        </Panel>
    );
}
