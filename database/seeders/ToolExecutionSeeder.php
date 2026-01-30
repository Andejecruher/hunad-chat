<?php

namespace Database\Seeders;

use App\Models\ToolExecution;
use Illuminate\Database\Seeder;

class ToolExecutionSeeder extends Seeder
{
    public function run(): void
    {
        ToolExecution::factory()
            ->count(10)
            ->create();
    }
}
