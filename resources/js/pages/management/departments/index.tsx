import { Departments } from '@/features/management/departments/departments';
import AppLayout from '@/layouts/app-layout';
import departmentsRoutes from '@/routes/departments';
import { type BreadcrumbItem, Department, PaginatedData } from '@/types';
import { Head } from '@inertiajs/react';

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
        href: departmentsRoutes.index().url,
    },
];

export default function DepartmentsPage(props: {
    departments: PaginatedData<Department[]>;
    filters: UserFilters;
}) {
    const { departments, filters } = props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departments" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                <div className="relative min-h-screen flex-1 overflow-x-auto md:min-h-min">
                    <Departments
                        departmentsData={departments}
                        filters={filters}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
