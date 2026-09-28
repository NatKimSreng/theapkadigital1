import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('auth.forgot_title')} />

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {status}
                </div>
            )}

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
                <Form {...email.form()} className="grid gap-5">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('auth.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <Button
                                size="lg"
                                className="w-full rounded-full"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing && <Spinner />}
                                {t('auth.send_reset_link')}
                            </Button>
                        </>
                    )}
                </Form>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                {t('auth.back_to')}{' '}
                <TextLink href={login()}>{t('auth.login')}</TextLink>
            </p>
        </>
    );
}

ForgotPassword.layout = {
    title: 'auth.forgot_title',
    description: 'auth.forgot_desc',
};
