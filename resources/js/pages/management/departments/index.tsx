import AppLayout from '@/layouts/app-layout';
import {
    type BreadcrumbItem, Department, PaginatedData,
} from '@/types';
import { Head } from '@inertiajs/react';
import { Departments } from '@/features/management/departments/departments';

interface UserFilters {
    search?: string;
    role?: string;
    status?: string;
    limit?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Management',
        href: '#',
    },
    {
        title: 'Departments',
        href: '#',
    },
];

export default function DepartmentsPage(props: {
    departments: PaginatedData<Department[]>;
    filters: UserFilters;
}) {
    const { departments, filters } = props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurations Company" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                <div className="relative min-h-screen flex-1 overflow-x-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <Departments departmentsData={departments} filters={filters} />
                </div>
            </div>
        </AppLayout>
    );
}
