<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Tool;
use Illuminate\Database\Seeder;

class ToolSeeder extends Seeder
{
    public function run(): void
    {
        Company::all()->each(function ($company) {
            Tool::factory()
                ->count(3)
                ->internal()
                ->create([
                    'company_id' => $company->id,
                ]);

            Tool::factory()
                ->count(2)
                ->external()
                ->create([
                    'company_id' => $company->id,
                ]);
        });
    }
}
