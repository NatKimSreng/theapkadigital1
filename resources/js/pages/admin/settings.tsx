import { Form, Head, router, usePage } from '@inertiajs/react';
import { ExternalLink, Search, Send, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import SettingController from '@/actions/App/Http/Controllers/Admin/SettingController';
import { Field, TextField } from '@/components/event/fields';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AdminPage } from '@/layouts/admin-layout';
import { useTranslation } from '@/lib/i18n';

type Settings = {
    seo_title: string | null;
    seo_description: string | null;
    og_image: string | null;
    google_verification: string | null;
    ga_id: string | null;
    facebook_url: string | null;
    support_telegram: string | null;
    telegram_chat_id: string | null;
    payment_account_name: string | null;
    payment_aba_number: string | null;
    payment_bank_details: string | null;
    payment_khqr_image: string | null;
};

const textareaClass =
    'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30';

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border bg-background p-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && (
                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
            )}
            <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
        </section>
    );
}

function ImageSetting({
    name,
    label,
    hint,
    current,
    fallback,
    aspect,
    error,
}: {
    name: string;
    label: string;
    hint: string;
    current: string | null;
    fallback?: string;
    aspect: string;
    error?: string;
}) {
    const { t } = useTranslation();
    const [preview, setPreview] = useState(current);
    const [removed, setRemoved] = useState(false);
    const input = useRef<HTMLInputElement>(null);
    const shown = preview ?? fallback ?? null;

    return (
        <div className="grid content-start gap-2">
            <span className="text-sm font-medium">{label}</span>
            <div className="relative">
                {shown ? (
                    <img
                        src={shown}
                        alt=""
                        className={`w-full rounded-xl border object-cover ${aspect}`}
                    />
                ) : (
                    <div
                        className={`flex w-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground ${aspect}`}
                    >
                        {t('settings_admin.no_image')}
                    </div>
                )}
                {preview && (
                    <button
                        type="button"
                        onClick={() => {
                            setPreview(null);
                            setRemoved(true);

                            if (input.current) {
                                input.current.value = '';
                            }
                        }}
                        className="absolute top-2 right-2 rounded-full bg-background/90 p-1.5 text-muted-foreground shadow hover:text-destructive"
                        aria-label={t('common.delete')}
                    >
                        <Trash2 className="size-4" />
                    </button>
                )}
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit rounded-full"
                onClick={() => input.current?.click()}
            >
                <Upload className="size-4" />
                {t('settings_admin.upload')}
            </Button>
            <input
                ref={input}
                type="file"
                name={name}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                        setPreview(URL.createObjectURL(file));
                        setRemoved(false);
                    }
                }}
            />
            {removed && <input type="hidden" name="remove[]" value={name} />}
            <p className="text-xs text-muted-foreground">{hint}</p>
            <InputError message={error} />
        </div>
    );
}

/**
 * Which Telegram group gets new orders and sign-ups: found from the chats
 * the bot has seen, then checked with a test message.
 */
function TelegramGroupField({
    defaultValue,
    error,
}: {
    defaultValue: string;
    error?: string;
}) {
    const { t } = useTranslation();
    const { telegramBot } = usePage().props;
    const [value, setValue] = useState(defaultValue);
    const [chats, setChats] = useState<{ id: string; title: string }[] | null>(
        null,
    );
    const [looking, setLooking] = useState(false);

    if (!telegramBot) {
        return (
            <p className="text-sm text-muted-foreground">
                {t('settings_admin.telegram_needs_bot')}
            </p>
        );
    }

    const findGroups = async () => {
        setLooking(true);

        try {
            const response = await fetch(
                SettingController.telegramChats.url(),
                {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                },
            );
            const json = (await response.json()) as {
                chats: { id: string; title: string }[];
            };
            setChats(json.chats);
        } catch {
            setChats([]);
        } finally {
            setLooking(false);
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
                {t('settings_admin.telegram_steps', { bot: `@${telegramBot}` })}
            </p>
            <Field
                label={t('settings_admin.telegram_group')}
                htmlFor="telegram_chat_id"
            >
                <Input
                    id="telegram_chat_id"
                    name="telegram_chat_id"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="-1001234567890"
                />
                <InputError message={error} />
            </Field>
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    disabled={looking}
                    onClick={findGroups}
                >
                    {looking ? <Spinner /> : <Search className="size-4" />}
                    {t('settings_admin.telegram_find')}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    disabled={!defaultValue}
                    title={
                        defaultValue
                            ? undefined
                            : t('settings_admin.telegram_save_first')
                    }
                    onClick={() =>
                        router.post(
                            SettingController.telegramTest.url(),
                            {},
                            { preserveScroll: true },
                        )
                    }
                >
                    <Send className="size-4" />
                    {t('settings_admin.telegram_test')}
                </Button>
            </div>
            {chats !== null &&
                (chats.length === 0 ? (
                    <p className="text-sm text-destructive">
                        {t('settings_admin.telegram_none_found')}
                    </p>
                ) : (
                    <ul className="space-y-1.5">
                        {chats.map((chat) => (
                            <li key={chat.id}>
                                <button
                                    type="button"
                                    onClick={() => setValue(chat.id)}
                                    className="flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm hover:bg-accent"
                                >
                                    <span className="font-medium">
                                        {chat.title}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {value === chat.id
                                            ? t(
                                                  'settings_admin.telegram_chosen',
                                              )
                                            : t(
                                                  'settings_admin.telegram_choose',
                                              )}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                ))}
        </div>
    );
}

export default function AdminSettings({
    settings,
    defaults,
    urls,
}: {
    settings: Settings;
    defaults: { seo_title: string; seo_description: string };
    urls: { sitemap: string; robots: string };
}) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('admin.site_settings')} />
            <Form
                {...SettingController.update.form()}
                options={{ preserveScroll: true }}
            >
                {({ processing, errors }) => (
                    <AdminPage
                        title={t('admin.site_settings')}
                        actions={
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-full px-6"
                            >
                                {processing && <Spinner />}
                                {t('common.save')}
                            </Button>
                        }
                    >
                        <div className="space-y-5">
                            <Section
                                title={t('settings_admin.seo')}
                                description={t('settings_admin.seo_desc')}
                            >
                                <TextField
                                    label={t('settings_admin.seo_title')}
                                    name="seo_title"
                                    defaultValue={settings.seo_title ?? ''}
                                    placeholder={defaults.seo_title}
                                    maxLength={120}
                                    error={errors.seo_title}
                                    wrapperClassName="md:col-span-2"
                                />
                                <Field
                                    label={t('settings_admin.seo_description')}
                                    htmlFor="seo_description"
                                    error={errors.seo_description}
                                    className="md:col-span-2"
                                >
                                    <textarea
                                        id="seo_description"
                                        name="seo_description"
                                        rows={3}
                                        maxLength={300}
                                        defaultValue={
                                            settings.seo_description ?? ''
                                        }
                                        placeholder={defaults.seo_description}
                                        className={textareaClass}
                                    />
                                </Field>
                                <ImageSetting
                                    name="og_image"
                                    label={t('settings_admin.og_image')}
                                    hint={t('settings_admin.og_image_hint')}
                                    current={settings.og_image}
                                    fallback="/og-image.png"
                                    aspect="aspect-[1200/630]"
                                    error={errors.og_image}
                                />
                                <div className="grid content-start gap-4">
                                    <TextField
                                        label={t('settings_admin.google')}
                                        name="google_verification"
                                        defaultValue={
                                            settings.google_verification ?? ''
                                        }
                                        placeholder="abc123…"
                                        error={errors.google_verification}
                                    />
                                    <p className="-mt-2 text-xs text-muted-foreground">
                                        {t('settings_admin.google_hint')}
                                    </p>
                                    <TextField
                                        label={t('settings_admin.ga')}
                                        name="ga_id"
                                        defaultValue={settings.ga_id ?? ''}
                                        placeholder="G-XXXXXXXXXX"
                                        error={errors.ga_id}
                                    />
                                    <div className="rounded-xl bg-muted/60 p-3 text-sm">
                                        <p className="mb-2 text-muted-foreground">
                                            {t('settings_admin.sitemap_hint')}
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {[urls.sitemap, urls.robots].map(
                                                (url) => (
                                                    <a
                                                        key={url}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 font-medium text-primary hover:underline"
                                                    >
                                                        {url.split('/').pop()}
                                                        <ExternalLink className="size-3.5" />
                                                    </a>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            <Section
                                title={t('settings_admin.payment')}
                                description={t('settings_admin.payment_desc')}
                            >
                                <TextField
                                    label={t('checkout.account_name')}
                                    name="payment_account_name"
                                    defaultValue={
                                        settings.payment_account_name ?? ''
                                    }
                                    error={errors.payment_account_name}
                                />
                                <TextField
                                    label={t('checkout.aba')}
                                    name="payment_aba_number"
                                    defaultValue={
                                        settings.payment_aba_number ?? ''
                                    }
                                    placeholder="000 000 000"
                                    error={errors.payment_aba_number}
                                />
                                <Field
                                    label={t('checkout.bank')}
                                    htmlFor="payment_bank_details"
                                    error={errors.payment_bank_details}
                                >
                                    <textarea
                                        id="payment_bank_details"
                                        name="payment_bank_details"
                                        rows={4}
                                        maxLength={500}
                                        defaultValue={
                                            settings.payment_bank_details ?? ''
                                        }
                                        className={textareaClass}
                                    />
                                </Field>
                                <ImageSetting
                                    name="payment_khqr_image"
                                    label="KHQR"
                                    hint={t('settings_admin.khqr_hint')}
                                    current={settings.payment_khqr_image}
                                    aspect="aspect-square max-w-48"
                                    error={errors.payment_khqr_image}
                                />
                            </Section>

                            <Section title={t('settings_admin.social')}>
                                <TextField
                                    label="Facebook"
                                    name="facebook_url"
                                    type="url"
                                    defaultValue={settings.facebook_url ?? ''}
                                    placeholder="https://facebook.com/…"
                                    error={errors.facebook_url}
                                />
                                <TextField
                                    label="Telegram"
                                    name="support_telegram"
                                    defaultValue={
                                        settings.support_telegram ?? ''
                                    }
                                    placeholder="@theapka"
                                    error={errors.support_telegram}
                                />
                            </Section>

                            <Section
                                title={t('settings_admin.telegram_title')}
                                description={t('settings_admin.telegram_desc')}
                            >
                                <TelegramGroupField
                                    defaultValue={
                                        settings.telegram_chat_id ?? ''
                                    }
                                    error={errors.telegram_chat_id}
                                />
                            </Section>
                        </div>
                    </AdminPage>
                )}
            </Form>
        </>
    );
}
