import AppLayout from '@/layouts/app-layout';
import { users } from '@/routes/configurations';
import { Users } from '@/features/configurations/Users/users'
import {
    type BreadcrumbItem,
    User,
} from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configurations',
        href: '#',
    },
    {
        title: 'Users',
        href: users().url,
    },
];

export default function UsersPage({users}: {users: User[];}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurations Company" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                <div className="relative min-h-screen flex-1 overflow-x-auto md:min-h-min dark:border-sidebar-border">
                    <Users data={users} />
                </div>
            </div>
        </AppLayout>
    );
}
