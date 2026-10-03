import { Form, Head, Link } from '@inertiajs/react';
import { CalendarHeart, Check, Clock, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import OrderController from '@/actions/App/Http/Controllers/OrderController';
import { Field, SelectField, TextField } from '@/components/event/fields';
import { Button } from '@/components/ui/button';
import { packageName } from '@/lib/billing';
import { formatDate, formatUsd } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { index as eventsIndex } from '@/routes/events';
import type { Package, PaymentMethod, PlannerEvent } from '@/types';

type Payment = {
    account_name: string | null;
    aba_number: string | null;
    bank_details: string | null;
    khqr_image: string | null;
    telegram: string | null;
};

function Step({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 font-semibold">{title}</h2>
            {children}
        </section>
    );
}

export default function Checkout({
    package: pkg,
    events,
    pendingEventIds,
    selectedEventId,
    payment,
    methods,
}: {
    package: Package;
    events: PlannerEvent[];
    pendingEventIds: number[];
    selectedEventId: number | null;
    payment: Payment;
    methods: PaymentMethod[];
}) {
    const { t, locale } = useTranslation();
    const available = events.filter(
        (event) => !pendingEventIds.includes(event.id),
    );
    const [eventId, setEventId] = useState<number | null>(
        available.find((event) => event.id === selectedEventId)?.id ??
            available[0]?.id ??
            null,
    );
    const hasPaymentDetails = Boolean(
        payment.aba_number || payment.bank_details || payment.khqr_image,
    );

    return (
        <>
            <Head title={t('checkout.title')} />

            <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[1fr_20rem]">
                <div className="space-y-5">
                    <h1 className="font-serif text-3xl font-semibold">
                        {t('checkout.title')}
                    </h1>

                    <Step title={t('checkout.step_event')}>
                        {events.length === 0 ? (
                            <div className="flex flex-col items-start gap-3">
                                <p className="text-muted-foreground">
                                    {t('checkout.no_events')}
                                </p>
                                <Button asChild className="rounded-full">
                                    <Link href={eventsIndex()}>
                                        {t('checkout.create_event')}
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2">
                                {events.map((event) => {
                                    const pending = pendingEventIds.includes(
                                        event.id,
                                    );
                                    const selected = eventId === event.id;

                                    return (
                                        <button
                                            key={event.id}
                                            type="button"
                                            disabled={pending}
                                            onClick={() => setEventId(event.id)}
                                            className={cn(
                                                'flex items-start gap-3 rounded-2xl border bg-background p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                                                selected &&
                                                    'border-primary ring-1 ring-primary',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                                                    selected &&
                                                        'border-primary bg-primary text-primary-foreground',
                                                )}
                                            >
                                                {selected && (
                                                    <Check className="size-3.5" />
                                                )}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block font-medium">
                                                    {event.name}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {formatDate(
                                                        event.event_date,
                                                        locale,
                                                    )}
                                                </span>
                                                <span className="mt-1 block text-xs text-muted-foreground">
                                                    {pending ? (
                                                        <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                                                            <Clock className="size-3" />
                                                            {t(
                                                                'checkout.waiting',
                                                            )}
                                                        </span>
                                                    ) : (
                                                        t('checkout.current', {
                                                            name: event.package
                                                                ? packageName(
                                                                      event.package,
                                                                      locale,
                                                                  )
                                                                : t(
                                                                      'plan.free',
                                                                  ),
                                                        })
                                                    )}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </Step>

                    <Step title={t('checkout.step_pay')}>
                        {hasPaymentDetails ? (
                            <div className="flex flex-wrap items-start gap-6">
                                {payment.khqr_image && (
                                    <figure className="text-center">
                                        <img
                                            src={payment.khqr_image}
                                            alt="KHQR"
                                            className="size-44 rounded-2xl border bg-white object-contain p-2"
                                        />
                                        <figcaption className="mt-2 max-w-44 text-xs text-muted-foreground">
                                            {t('checkout.scan')}
                                        </figcaption>
                                    </figure>
                                )}
                                <dl className="grid flex-1 gap-3 text-sm">
                                    <div>
                                        <dt className="text-muted-foreground">
                                            {t('checkout.amount')}
                                        </dt>
                                        <dd className="text-2xl font-bold text-primary">
                                            {formatUsd(pkg.price)}
                                        </dd>
                                    </div>
                                    {payment.account_name && (
                                        <div>
                                            <dt className="text-muted-foreground">
                                                {t('checkout.account_name')}
                                            </dt>
                                            <dd className="font-medium">
                                                {payment.account_name}
                                            </dd>
                                        </div>
                                    )}
                                    {payment.aba_number && (
                                        <div>
                                            <dt className="text-muted-foreground">
                                                {t('checkout.aba')}
                                            </dt>
                                            <dd className="font-mono font-medium">
                                                {payment.aba_number}
                                            </dd>
                                        </div>
                                    )}
                                    {payment.bank_details && (
                                        <div>
                                            <dt className="text-muted-foreground">
                                                {t('checkout.bank')}
                                            </dt>
                                            <dd className="font-medium whitespace-pre-line">
                                                {payment.bank_details}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        ) : (
                            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                {t('checkout.not_set')}
                            </p>
                        )}
                    </Step>

                    <Step title={t('checkout.step_receipt')}>
                        <Form
                            {...OrderController.store.form(pkg.id)}
                            className="grid gap-4 sm:grid-cols-2"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <input
                                        type="hidden"
                                        name="event_id"
                                        value={eventId ?? ''}
                                    />
                                    <SelectField
                                        label={t('checkout.method')}
                                        name="payment_method"
                                        defaultValue={methods[0]}
                                        error={errors.payment_method}
                                        options={methods.map((method) => ({
                                            value: method,
                                            label: t(`method.${method}`),
                                        }))}
                                    />
                                    <TextField
                                        label={t('checkout.reference')}
                                        name="reference"
                                        maxLength={100}
                                        error={errors.reference}
                                    />
                                    <Field
                                        label={t('checkout.receipt')}
                                        htmlFor="receipt"
                                        error={errors.receipt}
                                        className="sm:col-span-2"
                                    >
                                        <input
                                            id="receipt"
                                            name="receipt"
                                            type="file"
                                            required
                                            accept="image/jpeg,image/png,image/webp,application/pdf"
                                            className="block w-full rounded-xl border bg-background p-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-accent-foreground"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t('checkout.receipt_hint')}
                                        </p>
                                    </Field>
                                    <Field
                                        label={t('checkout.note')}
                                        htmlFor="note"
                                        error={errors.note}
                                        className="sm:col-span-2"
                                    >
                                        <textarea
                                            id="note"
                                            name="note"
                                            rows={2}
                                            maxLength={500}
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        />
                                    </Field>
                                    {errors.event_id && (
                                        <p className="text-sm text-destructive sm:col-span-2">
                                            {errors.event_id}
                                        </p>
                                    )}
                                    <div className="sm:col-span-2">
                                        <Button
                                            size="lg"
                                            className="rounded-full px-8"
                                            disabled={
                                                processing || eventId === null
                                            }
                                        >
                                            {t('checkout.submit')}
                                        </Button>
                                        {payment.telegram && (
                                            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <MessageCircle className="size-3.5" />
                                                {t('checkout.then_telegram')}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </Form>
                    </Step>
                </div>

                <aside className="lg:sticky lg:top-20 lg:self-start">
                    <div className="rounded-3xl border bg-gradient-to-br from-accent to-card p-6 shadow-sm">
                        <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
                            {t('checkout.summary')}
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <CalendarHeart className="size-5" />
                            </span>
                            <div>
                                <p className="font-serif text-2xl font-semibold">
                                    {packageName(pkg, locale)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {formatUsd(pkg.price)}{' '}
                                    {t('pricing.per_event')}
                                </p>
                            </div>
                        </div>
                        <ul className="mt-5 space-y-2 text-sm">
                            <li className="flex gap-2">
                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                {pkg.guest_limit
                                    ? t('pricing.guests', {
                                          count: pkg.guest_limit,
                                      })
                                    : t('pricing.unlimited_guests')}
                            </li>
                            {pkg.premium_templates && (
                                <li className="flex gap-2">
                                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                    {t('pricing.premium_templates')}
                                </li>
                            )}
                            {pkg.remove_branding && (
                                <li className="flex gap-2">
                                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                    {t('pricing.remove_branding')}
                                </li>
                            )}
                        </ul>
                        {payment.telegram && (
                            <a
                                href={`https://t.me/${payment.telegram.replace(/^@/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                            >
                                <MessageCircle className="size-4" />
                                {t('checkout.help')}
                            </a>
                        )}
                    </div>
                </aside>
            </div>
        </>
    );
}
