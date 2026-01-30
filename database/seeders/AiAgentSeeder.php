<?php

namespace Database\Seeders;

use App\Models\AiAgent;
use App\Models\Company;
use App\Models\Tool;
use Illuminate\Database\Seeder;

class AiAgentSeeder extends Seeder
{
    public function run(): void
    {
        Company::all()->each(function ($company) {
            $agent = AiAgent::factory()->create([
                'company_id' => $company->id,
                'name' => 'Agente Principal',
            ]);

            $tools = Tool::where('company_id', $company->id)->get();

            $agent->tools()->sync($tools->pluck('id'));
        });
    }
}
