import { Form, Head, Link } from '@inertiajs/react';
import { Search, ShieldCheck } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import { Pagination } from '@/components/pagination';
import { Input } from '@/components/ui/input';
import { AdminPage } from '@/layouts/admin-layout';
import { formatDateTime } from '@/lib/billing';
import { useTranslation } from '@/lib/i18n';
import type { Paginated, User } from '@/types';

type AdminUser = User & { events_count: number; orders_count: number };

export default function AdminUsers({
    users,
    search,
}: {
    users: Paginated<AdminUser>;
    search: string;
}) {
    const { t, locale } = useTranslation();

    return (
        <>
            <Head title={t('admin.users')} />
            <AdminPage title={t('admin.users')}>
                <Form
                    {...UserController.index.form()}
                    className="relative mb-5 max-w-sm"
                >
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        name="search"
                        type="search"
                        defaultValue={search}
                        placeholder={t('admin.search')}
                        className="rounded-full pl-9"
                    />
                </Form>

                {users.data.length === 0 ? (
                    <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                        {t('admin.no_users')}
                    </p>
                ) : (
                    <ul className="divide-y rounded-2xl border bg-background">
                        {users.data.map((user) => (
                            <li key={user.id}>
                                <Link
                                    href={UserController.show(user.id)}
                                    className="flex flex-wrap items-center gap-x-5 gap-y-1 p-4 transition-colors hover:bg-accent/50"
                                >
                                    <div className="min-w-48 flex-1">
                                        <p className="flex items-center gap-2 font-medium">
                                            {user.name}
                                            {user.is_admin && (
                                                <ShieldCheck className="size-4 text-primary" />
                                            )}
                                            {user.disabled_at && (
                                                <span className="rounded-full bg-red-100 px-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                                                    {t('admin.disabled')}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {t('admin.events_count', {
                                            count: user.events_count,
                                        })}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {t('admin.orders_count', {
                                            count: user.orders_count,
                                        })}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {t('admin.joined')}{' '}
                                        {formatDateTime(
                                            user.created_at,
                                            locale,
                                        )}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                <Pagination page={users} />
            </AdminPage>
        </>
    );
}
