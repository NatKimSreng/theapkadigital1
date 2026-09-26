import { Head, Link, usePage } from '@inertiajs/react';
import { ClipboardCheck, Gift, ReceiptText, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { dashboard, login, register } from '@/routes';

const features: {
    title: TranslationKey;
    body: TranslationKey;
    icon: typeof Users;
    tone: string;
}[] = [
    {
        title: 'welcome.f1',
        body: 'welcome.f1d',
        icon: Users,
        tone: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    },
    {
        title: 'welcome.f2',
        body: 'welcome.f2d',
        icon: Gift,
        tone: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    },
    {
        title: 'welcome.f3',
        body: 'welcome.f3d',
        icon: ReceiptText,
        tone: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    },
    {
        title: 'welcome.f4',
        body: 'welcome.f4d',
        icon: ClipboardCheck,
        tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('welcome.tagline')} />
            <div className="min-h-svh bg-gradient-to-b from-rose-50 via-white to-white dark:from-rose-950/20 dark:via-background dark:to-background">
                <header className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
                    <AppLogo />
                    <div className="ml-auto flex items-center gap-2">
                        <LanguageSwitcher />
                        {auth.user ? (
                            <Button asChild className="rounded-full">
                                <Link href={dashboard()}>
                                    {t('welcome.dashboard')}
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="rounded-full"
                                >
                                    <Link href={login()}>
                                        {t('welcome.login')}
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    className="hidden rounded-full sm:inline-flex"
                                >
                                    <Link href={register()}>
                                        {t('welcome.register')}
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6 sm:pt-20">
                    <section className="mx-auto max-w-3xl text-center">
                        <p className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                            {t('welcome.tagline')}
                        </p>
                        <h1 className="text-4xl leading-tight font-bold sm:text-5xl sm:leading-tight">
                            {t('welcome.title')}
                        </h1>
                        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                            {t('welcome.subtitle')}
                        </p>
                        <div className="mt-8 flex justify-center gap-3">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-full px-8"
                            >
                                <Link
                                    href={auth.user ? dashboard() : register()}
                                >
                                    {auth.user
                                        ? t('welcome.dashboard')
                                        : t('welcome.start')}
                                </Link>
                            </Button>
                        </div>
                    </section>

                    <section className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="rounded-3xl border bg-card p-6 shadow-sm"
                            >
                                <div
                                    className={`mb-4 flex size-11 items-center justify-center rounded-2xl ${feature.tone}`}
                                >
                                    <feature.icon className="size-5" />
                                </div>
                                <h2 className="font-semibold">
                                    {t(feature.title)}
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {t(feature.body)}
                                </p>
                            </div>
                        ))}
                    </section>
                </main>
            </div>
        </>
    );
}
