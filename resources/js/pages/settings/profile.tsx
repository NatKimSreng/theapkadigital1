import { Form, Head, usePage } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { TelegramLogin } from '@/components/telegram-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SettingsCard } from '@/layouts/settings/layout';
import { useTranslation } from '@/lib/i18n';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile() {
    const { auth, telegramBot } = usePage<PageProps>().props;
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('settings.profile')} />

            <SettingsCard
                title={t('settings.profile')}
                description={t('settings.profile_desc')}
            >
                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="grid max-w-xl gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('auth.name')}</Label>
                                <Input
                                    id="name"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder={t('auth.name_placeholder')}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('auth.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    defaultValue={auth.user.email ?? ''}
                                    name="email"
                                    // Telegram accounts may have no email.
                                    required={auth.user.email !== null}
                                    autoComplete="username"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <Button
                                    className="rounded-full px-6"
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    {t('common.save')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </SettingsCard>

            {telegramBot && (
                <SettingsCard
                    title="Telegram"
                    description={t('settings.telegram_desc')}
                >
                    {auth.user.telegram_id ? (
                        <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            <CircleCheck className="size-5" />
                            {t('settings.telegram_connected')}
                        </p>
                    ) : (
                        <div className="w-fit">
                            <TelegramLogin bot={telegramBot} />
                        </div>
                    )}
                </SettingsCard>
            )}

            <DeleteUser />
        </>
    );
}
