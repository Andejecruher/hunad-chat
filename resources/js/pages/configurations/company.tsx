import { CompanySettings } from '@/features/configurations/company/company-settings';
import AppLayout from '@/layouts/app-layout';
import company from '@/routes/company';
import {
    type BreadcrumbItem,
    CompanySettings as CompanySettingsType,
    User,
} from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configurations',
        href: '#',
    },
    {
        title: 'Company',
        href: company.index().url,
    },
];

export default function CompanyPage({
    user,
    company,
}: {
    user: User;
    company: CompanySettingsType;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurations Company" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                <div className="relative min-h-screen flex-1 overflow-x-auto md:min-h-min">
                    <CompanySettings companyData={company} user={user} />
                </div>
            </div>
        </AppLayout>
    );
}
