<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\User;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DepartmentControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create();
        $this->user = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
    }

    #[Test]
    public function it_can_list_departments()
    {
        Department::factory(3)->create(['company_id' => $this->company->id]);
        Department::factory(2)->create(); // Departamentos de otra company

        $response = $this->actingAs($this->user)
            ->getJson('/management/departments');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data',
                    'current_page',
                    'per_page',
                    'total'
                ],
                'meta' => [
                    'total_active',
                    'total_inactive',
                    'includes'
                ]
            ]);

        // Debe retornar solo los departamentos de la company del usuario
        $this->assertCount(3, $response->json('data.data'));
    }

    #[Test]
    public function it_can_search_departments()
    {
        Department::factory()->create([
            'company_id' => $this->company->id,
            'name' => 'Ventas Internacional'
        ]);
        Department::factory()->create([
            'company_id' => $this->company->id,
            'name' => 'Soporte Técnico'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/management/departments?search=ventas');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.data'));
        $this->assertEquals('Ventas Internacional', $response->json('data.data.0.name'));
    }

    #[Test]
    public function it_can_create_a_department()
    {
        $departmentData = [
            'name' => 'Nuevo Departamento',
            'description' => 'Descripción del departamento',
            'timezone' => 'America/Mexico_City',
            'is_active' => true,
            'hours' => [
                [
                    'day_of_week' => 1,
                    'open_time' => '09:00',
                    'close_time' => '18:00',
                    'is_closed' => false
                ]
            ]
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/management/departments', $departmentData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data',
                'message',
                'toastType'
            ]);

        $this->assertDatabaseHas('departments', [
            'name' => 'Nuevo Departamento',
            'company_id' => $this->company->id,
            'timezone' => 'America/Mexico_City'
        ]);

        // Verificar que se crearon los horarios
        $department = Department::where('name', 'Nuevo Departamento')->first();
        $this->assertCount(1, $department->hours);
    }

    #[Test]
    public function it_can_show_a_department()
    {
        $department = Department::factory()->create(['company_id' => $this->company->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/management/departments/{$department->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                    'description',
                    'timezone',
                    'is_active',
                    'company',
                    'agents',
                    'hours',
                    'exceptions'
                ],
                'meta'
            ]);
    }

    #[Test]
    public function it_cannot_show_department_from_different_company()
    {
        $otherCompany = Company::factory()->create();
        $department = Department::factory()->create(['company_id' => $otherCompany->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/management/departments/{$department->id}");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'No tienes acceso a este departamento'
            ]);
    }

    #[Test]
    public function it_can_update_a_department()
    {
        $department = Department::factory()->create(['company_id' => $this->company->id]);

        $updateData = [
            'name' => 'Nombre Actualizado',
            'description' => 'Nueva descripción',
            'timezone' => 'America/New_York'
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/management/departments/{$department->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Departamento actualizado exitosamente'
            ]);

        $this->assertDatabaseHas('departments', [
            'id' => $department->id,
            'name' => 'Nombre Actualizado',
            'description' => 'Nueva descripción',
            'timezone' => 'America/New_York'
        ]);
    }

    #[Test]
    public function it_can_toggle_department_status()
    {
        $department = Department::factory()->create([
            'company_id' => $this->company->id,
            'is_active' => true
        ]);

        $response = $this->actingAs($this->user)
            ->patchJson("/management/departments/{$department->id}/toggle-status");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Departamento desactivado exitosamente'
            ]);

        $this->assertDatabaseHas('departments', [
            'id' => $department->id,
            'is_active' => false
        ]);
    }

//    #[Test]
//    public function it_can_get_department_stats()
//    {
//        Department::factory(3)->create(['company_id' => $this->company->id, 'is_active' => true]);
//        Department::factory(2)->create(['company_id' => $this->company->id, 'is_active' => false]);
//        Department::factory(5)->create(); // Otras companies
//
//        $response = $this->actingAs($this->user)
//            ->getJson('/management/departments/stats');
//
//        $response->assertStatus(200)
//            ->assertJsonStructure([
//                'success',
//                'data' => [
//                    'total',
//                    'active',
//                    'inactive',
//                    'with_agents',
//                    'without_agents',
//                    'by_timezone'
//                ]
//            ]);
//
//        $stats = $response->json('data');
//        $this->assertEquals(5, $stats['total']);
//        $this->assertEquals(3, $stats['active']);
//        $this->assertEquals(2, $stats['inactive']);
//    }

    #[Test]
    public function it_validates_required_fields_when_creating_department()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/management/departments', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'timezone']);
    }

    #[Test]
    public function it_validates_timezone_format()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/management/departments', [
                'name' => 'Test Department',
                'timezone' => str_repeat('a', 60) // Más de 50 caracteres
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['timezone']);
    }

    #[Test]
    public function it_validates_department_hours_format()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/management/departments', [
                'name' => 'Test Department',
                'timezone' => 'UTC',
                'hours' => [
                    [
                        'day_of_week' => 8, // Inválido: debe ser 0-6
                        'open_time' => 'invalid_time',
                        'close_time' => '08:00' // Inválido: antes de open_time
                    ]
                ]
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'hours.0.day_of_week',
                'hours.0.open_time'
            ]);
    }
}
