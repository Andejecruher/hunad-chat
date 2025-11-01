import AppLayout from '@/layouts/app-layout';
import {
    type BreadcrumbItem, Department,
} from '@/types';
import { Head } from '@inertiajs/react';
import { DepartmentSchedule } from '@/features/management/departments/department';
import departmentsRoutes from '@/routes/departments';

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
        title: 'Department',
        href: '#',
    }
];

export default function DepartmentPage(props: {
    department: Department;
}) {
    const { department} = props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurations Company" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                <div className="relative min-h-screen flex-1 overflow-x-auto md:min-h-min">
                    <DepartmentSchedule department={department} />
                </div>
            </div>
        </AppLayout>
    );
}
