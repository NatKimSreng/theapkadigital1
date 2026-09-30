import { Form, Head } from '@inertiajs/react';
import { GoogleButton } from '@/components/google-button';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('auth.login')} />

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {status}
                </div>
            )}

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
                <GoogleButton />
                <PasskeyVerify />

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        {t('auth.email')}
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">
                                            {t('auth.password')}
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="ml-auto text-sm"
                                                tabIndex={5}
                                            >
                                                {t('auth.forgot')}
                                            </TextLink>
                                        )}
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder={t('auth.password')}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label htmlFor="remember">
                                        {t('auth.remember')}
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="mt-2 w-full rounded-full"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner />}
                                    {t('auth.login')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                {t('auth.no_account')}{' '}
                <TextLink href={register()} tabIndex={5}>
                    {t('auth.sign_up')}
                </TextLink>
            </p>
        </>
    );
}

Login.layout = {
    title: 'auth.login_title',
    description: 'auth.login_desc',
};
