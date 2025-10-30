import AppLayout from '@/layouts/app-layout';
import {
    type BreadcrumbItem,
} from '@/types';
import { Head } from '@inertiajs/react';
import { DepartmentSchedule } from '@/features/management/departments/department';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Management',
        href: '#',
    },
    {
        title: 'Departments',
        href: '#',
    },
    {
        title: 'Department',
        href: '#',
    }
];

export default function DepartmentPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurations Company" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                <div className="relative min-h-screen flex-1 overflow-x-auto md:min-h-min">
                    <DepartmentSchedule params={{id: 1}} />
                </div>
            </div>
        </AppLayout>
    );
}
