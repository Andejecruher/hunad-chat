import { Users } from '@/features/configurations/users/users';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import { BreadcrumbItem, PaginatedUsers } from '@/types';
import { Head } from '@inertiajs/react';

interface UserFilters {
    search?: string;
    role?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configurations',
        href: '#',
    },
    {
        title: 'Users',
        href: users.index().url,
    },
];

export default function UsersPage(props: {
    users: PaginatedUsers;
    filters: UserFilters;
}) {
    const { users: paginatedUsers, filters } = props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurations Company" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                <div className="relative min-h-screen flex-1 overflow-x-auto md:min-h-min dark:border-sidebar-border">
                    <Users usersData={paginatedUsers} filters={filters} />
                </div>
            </div>
        </AppLayout>
    );
}
