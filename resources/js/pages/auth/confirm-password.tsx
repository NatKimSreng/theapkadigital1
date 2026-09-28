import { Form, Head } from '@inertiajs/react';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('auth.confirm_title')} />

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
                <PasskeyVerify
                    routes={{
                        options: confirmOptions(),
                        submit: confirmStore(),
                    }}
                    label={t('auth.passkey_confirm')}
                    loadingLabel={t('auth.passkey_confirming')}
                    separator={t('auth.or_password')}
                />

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="grid gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {t('auth.password')}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    placeholder={t('auth.password')}
                                    autoComplete="current-password"
                                    autoFocus
                                />
                                <InputError message={errors.password} />
                            </div>

                            <Button
                                size="lg"
                                className="w-full rounded-full"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}
                                {t('auth.confirm_button')}
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'auth.confirm_title',
    description: 'auth.confirm_desc',
};
