import { Form, Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Heart, MailOpen, Search, Users } from 'lucide-react';
import EventController from '@/actions/App/Http/Controllers/Admin/EventController';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import { AdminInviteLinks } from '@/components/admin-invite-links';
import type { InviteLink } from '@/components/admin-invite-links';
import { selectClassName } from '@/components/event/fields';
import { Pagination } from '@/components/pagination';
import { Input } from '@/components/ui/input';
import { AdminPage } from '@/layouts/admin-layout';
import { packageName } from '@/lib/billing';
import { formatDate, formatNumber } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types';

type AdminEvent = {
    id: number;
    name: string;
    type: string;
    event_date: string | null;
    venue: string | null;
    created_at: string;
    guests_count: number;
    rsvps_count: number;
    invitations_count: number;
    invite_links: InviteLink[];
    user: { id: number; name: string; email: string };
    package: { id: number; name: string; name_km: string | null } | null;
};

type PackageOption = { id: number; name: string; name_km: string | null };

export default function AdminEvents({
    events,
    search,
    package: selectedPackage,
    packages,
}: {
    events: Paginated<AdminEvent>;
    search: string;
    package: string;
    packages: PackageOption[];
}) {
    const { t, locale } = useTranslation();

    const filter = (value: string) =>
        router.get(
            EventController.index.url(),
            { search: search || undefined, package: value || undefined },
            { preserveState: true, preserveScroll: true },
        );

    return (
        <>
            <Head title={t('admin.events')} />
            <AdminPage title={t('admin.events')}>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                    <Form
                        {...EventController.index.form()}
                        className="relative w-full max-w-sm"
                    >
                        {selectedPackage && (
                            <input
                                type="hidden"
                                name="package"
                                value={selectedPackage}
                            />
                        )}
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            name="search"
                            type="search"
                            defaultValue={search}
                            placeholder={t('admin.search_events')}
                            className="rounded-full pl-9"
                        />
                    </Form>
                    <select
                        value={selectedPackage}
                        onChange={(event) => filter(event.target.value)}
                        aria-label={t('orders.package')}
                        className={cn(selectClassName, 'w-auto rounded-full')}
                    >
                        <option value="">{t('admin.all_packages')}</option>
                        <option value="free">{t('admin.free_plan')}</option>
                        {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                                {packageName(pkg, locale)}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-muted-foreground">
                        {t('admin.results', { count: events.total })}
                    </span>
                </div>

                {events.data.length === 0 ? (
                    <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                        {t('admin.no_events')}
                    </p>
                ) : (
                    <ul className="divide-y rounded-2xl border bg-background">
                        {events.data.map((event) => (
                            <li
                                key={event.id}
                                className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4"
                            >
                                <div className="min-w-56 flex-1">
                                    <p className="flex items-center gap-2 font-medium">
                                        <Heart className="size-4 text-primary" />
                                        {event.name}
                                    </p>
                                    <Link
                                        href={UserController.show(
                                            event.user.id,
                                        )}
                                        className="text-sm text-muted-foreground hover:text-primary hover:underline"
                                    >
                                        {event.user.name} · {event.user.email}
                                    </Link>
                                </div>
                                <span
                                    className={cn(
                                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                        event.package
                                            ? 'bg-primary/15 text-primary'
                                            : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {event.package
                                        ? packageName(event.package, locale)
                                        : t('admin.free_plan')}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <CalendarDays className="size-4" />
                                    {formatDate(event.event_date, locale)}
                                </span>
                                <span
                                    className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums"
                                    title={t('admin.guests', {
                                        count: event.guests_count,
                                    })}
                                >
                                    <Users className="size-4" />
                                    {formatNumber(event.guests_count)}
                                </span>
                                <span
                                    className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums"
                                    title={t('admin.rsvps')}
                                >
                                    <MailOpen className="size-4" />
                                    {formatNumber(event.rsvps_count)}
                                </span>
                                <AdminInviteLinks links={event.invite_links} />
                            </li>
                        ))}
                    </ul>
                )}

                <Pagination page={events} />
            </AdminPage>
        </>
    );
}
