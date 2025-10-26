<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DepartmentBasicTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_can_access_departments_index()
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);

        $response = $this->actingAs($user)
            ->get('/management/departments');

        $response->assertStatus(200);
    }
}
