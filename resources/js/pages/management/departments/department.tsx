import { DepartmentSchedule } from '@/features/management/departments/department';
import AppLayout from '@/layouts/app-layout';
import departmentsRoutes from '@/routes/departments';
import { type BreadcrumbItem, Department } from '@/types';
import { Head } from '@inertiajs/react';

export default function DepartmentPage(props: { department: Department }) {
    const { department } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Management',
            href: '#',
        },
        {
            title: 'Departments',
            href: departmentsRoutes.index().url,
        },
        {
            title: `${department.name}`,
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${department.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                <div className="relative min-h-screen flex-1 overflow-x-auto md:min-h-min">
                    <DepartmentSchedule department={department} />
                </div>
            </div>
        </AppLayout>
    );
}
