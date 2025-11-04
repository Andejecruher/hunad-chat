<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Department;
use App\Models\User;
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
                    'total',
                ],
                'filters',
            ]);

        // Debe retornar solo los departamentos de la company del usuario
        $this->assertCount(3, $response->json('data.data'));
    }

    #[Test]
    public function it_can_search_departments()
    {
        Department::factory()->create([
            'company_id' => $this->company->id,
            'name' => 'Ventas Internacional',
        ]);
        Department::factory()->create([
            'company_id' => $this->company->id,
            'name' => 'Soporte Técnico',
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
            'color' => 'bg-blue-500',
            'timezone' => 'America/Mexico_City',
            'is_active' => true,
            'hours' => [
                [
                    'day_of_week' => 1,
                    'is_closed' => false,
                    'time_ranges' => [
                        [
                            'open_time' => '09:00',
                            'close_time' => '18:00',
                        ],
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/management/departments', $departmentData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data',
                'message',
                'toastType',
            ]);

        $this->assertDatabaseHas('departments', [
            'name' => 'Nuevo Departamento',
            'company_id' => $this->company->id,
            'timezone' => 'America/Mexico_City',
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
                    'color',
                    'description',
                    'timezone',
                    'is_active',
                    'company',
                    'agents',
                    'hours',
                    'exceptions',
                ],
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
                'message' => 'You do not have access to this department',
                'toastType' => 'error',
            ]);
    }

    #[Test]
    public function it_can_update_a_department()
    {
        $department = Department::factory()->create(['company_id' => $this->company->id]);

        $updateData = [
            'name' => 'Nombre Actualizado',
            'description' => 'Nueva descripción',
            'timezone' => 'America/New_York',
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/management/departments/{$department->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Department updated successfully',
                'toastType' => 'success',
            ]);

        $this->assertDatabaseHas('departments', [
            'id' => $department->id,
            'name' => 'Nombre Actualizado',
            'description' => 'Nueva descripción',
            'timezone' => 'America/New_York',
        ]);
    }

    #[Test]
    public function it_can_toggle_department_status()
    {
        $department = Department::factory()->create([
            'company_id' => $this->company->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->patchJson("/management/departments/{$department->id}/toggle-status");

        $status = $department->is_active ? 'deactivated' : 'activated';

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => "Department {$status} successfully",
                'toastType' => 'success',
            ]);

        $this->assertDatabaseHas('departments', [
            'id' => $department->id,
            'is_active' => false,
        ]);
    }

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
                'timezone' => str_repeat('a', 60), // Más de 50 caracteres
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
                        'close_time' => '08:00', // Inválido: antes de open_time
                    ],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'hours.0.day_of_week',
                'hours.0.open_time',
            ]);
    }

    #[Test]
    public function it_can_sync_department_hours_correctly()
    {
        $department = Department::factory()->create(['company_id' => $this->company->id]);

        // Crear algunos horarios existentes
        $department->hours()->create([
            'day_of_week' => 1,
            'open_time' => '09:00',
            'close_time' => '17:00',
            'is_closed' => false,
        ]);

        $existingHour = $department->hours()->create([
            'day_of_week' => 2,
            'open_time' => '08:00',
            'close_time' => '16:00',
            'is_closed' => false,
        ]);

        $hoursData = [
            [
                'day_of_week' => 1,
                'is_closed' => false,
                'time_ranges' => [
                    ['open_time' => '08:00', 'close_time' => '12:00'],
                    ['open_time' => '13:00', 'close_time' => '18:00'],
                ],
            ],
            [
                'day_of_week' => 2,
                'is_closed' => false,
                'time_ranges' => [
                    [
                        'id' => $existingHour->id,
                        'open_time' => '09:00',
                        'close_time' => '17:00',
                    ],
                ],
            ],
            [
                'day_of_week' => 3,
                'is_closed' => true,
                'time_ranges' => [],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/management/departments/{$department->id}", [
                'name' => $department->name,
                'timezone' => $department->timezone,
                'hours' => $hoursData,
            ]);

        $response->assertStatus(200);

        // Verificar que los horarios se sincronizaron correctamente
        $department->refresh();

        // Día 1: debe tener 2 rangos nuevos (el anterior se eliminó)
        $day1Hours = $department->hours()->where('day_of_week', 1)->orderBy('open_time')->get();
        $this->assertCount(2, $day1Hours);

        $this->assertEquals('08:00:00', $day1Hours[0]->open_time);
        $this->assertEquals('12:00:00', $day1Hours[0]->close_time);
        $this->assertEquals('13:00:00', $day1Hours[1]->open_time);
        $this->assertEquals('18:00:00', $day1Hours[1]->close_time);

        // Día 2: debe tener 1 rango actualizado
        $day2Hours = $department->hours()->where('day_of_week', 2)->get();
        $this->assertCount(1, $day2Hours);
        $this->assertEquals($existingHour->id, $day2Hours[0]->id);
        $this->assertEquals('09:00:00', $day2Hours[0]->open_time);
        $this->assertEquals('17:00:00', $day2Hours[0]->close_time);

        // Día 3: debe tener 1 registro marcado como cerrado
        $day3Hours = $department->hours()->where('day_of_week', 3)->get();
        $this->assertCount(1, $day3Hours);
        $this->assertTrue($day3Hours[0]->is_closed);
        $this->assertNull($day3Hours[0]->open_time);
        $this->assertNull($day3Hours[0]->close_time);
    }

    #[Test]
    public function it_deletes_existing_hours_when_day_is_marked_as_closed()
    {
        $department = Department::factory()->create(['company_id' => $this->company->id]);

        // Crear horarios existentes para el día
        $department->hours()->create([
            'day_of_week' => 1,
            'open_time' => '09:00:00',
            'close_time' => '17:00:00',
            'is_closed' => false,
        ]);

        $department->hours()->create([
            'day_of_week' => 1,
            'open_time' => '18:00:00',
            'close_time' => '22:00:00',
            'is_closed' => false,
        ]);

        $hoursData = [
            [
                'day_of_week' => 1,
                'is_closed' => true,
                'time_ranges' => [],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/management/departments/{$department->id}", [
                'name' => $department->name,
                'timezone' => $department->timezone,
                'hours' => $hoursData,
            ]);

        $response->assertStatus(200);

        // Verificar que los horarios anteriores se eliminaron y se creó uno cerrado
        $day1Hours = $department->hours()->where('day_of_week', 1)->get();
        $this->assertCount(1, $day1Hours);
        $this->assertTrue($day1Hours[0]->is_closed);
        $this->assertNull($day1Hours[0]->open_time);
        $this->assertNull($day1Hours[0]->close_time);
    }

    #[Test]
    public function it_removes_all_hours_when_no_ranges_and_not_closed()
    {
        $department = Department::factory()->create(['company_id' => $this->company->id]);

        // Crear horarios existentes
        $department->hours()->create([
            'day_of_week' => 1,
            'open_time' => '09:00:00',
            'close_time' => '17:00:00',
            'is_closed' => false,
        ]);

        $hoursData = [
            [
                'day_of_week' => 1,
                'is_closed' => false,
                'time_ranges' => [],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/management/departments/{$department->id}", [
                'name' => $department->name,
                'timezone' => $department->timezone,
                'hours' => $hoursData,
            ]);

        $response->assertStatus(200);

        // Verificar que no hay horarios para ese día
        $day1Hours = $department->hours()->where('day_of_week', 1)->get();
        $this->assertCount(0, $day1Hours);
    }

    #[Test]
    public function it_can_sync_department_exceptions_correctly()
    {
        $department = Department::factory()->create(['company_id' => $this->company->id]);

        // Crear una excepción existente
        $existingException = $department->exceptions()->create([
            'name' => 'Navidad',
            'type' => 'annual',
            'start_date' => '2024-12-25',
            'behavior' => 'fully_closed',
            'recurrence_pattern' => ['month' => 12, 'day' => 25],
        ]);

        // Datos para actualizar: mantener la excepción existente modificada + agregar nueva
        $exceptionsData = [
            [
                'id' => $existingException->id,
                'name' => 'Navidad Actualizada',
                'type' => 'annual',
                'start_date' => '2024-12-25',
                'behavior' => 'partially_closed',
                'special_open_time' => '10:00',
                'special_close_time' => '14:00',
                'recurrence_pattern' => ['month' => 12, 'day' => 25],
            ],
            [
                'name' => 'Año Nuevo',
                'type' => 'annual',
                'start_date' => '2024-01-01',
                'behavior' => 'fully_closed',
                'recurrence_pattern' => ['month' => 1, 'day' => 1],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/management/departments/{$department->id}", [
                'name' => $department->name,
                'color' => $department->color,
                'timezone' => $department->timezone,
                'exceptions' => $exceptionsData,
            ]);

        $response->assertStatus(200);

        // Verificar que las excepciones se sincronizaron correctamente
        $department->refresh();
        $exceptions = $department->exceptions()->orderBy('name')->get();

        $this->assertCount(2, $exceptions);

        // Verificar la excepción actualizada
        $updatedException = $exceptions->where('id', $existingException->id)->first();
        $this->assertEquals('Navidad Actualizada', $updatedException->name);
        $this->assertEquals('partially_closed', $updatedException->behavior);
        $this->assertEquals('10:00:00', $updatedException->special_open_time);
        $this->assertEquals('14:00:00', $updatedException->special_close_time);

        // Verificar la nueva excepción
        $newException = $exceptions->where('name', 'Año Nuevo')->first();
        $this->assertNotNull($newException);
        $this->assertEquals('annual', $newException->type);
        $this->assertEquals('fully_closed', $newException->behavior);
        $this->assertEquals('2024-01-01', $newException->start_date->format('Y-m-d'));
    }

    #[Test]
    public function it_validates_exception_fields_correctly()
    {
        $department = Department::factory()->create(['company_id' => $this->company->id]);

        $invalidExceptionsData = [
            [
                'name' => '', // Nombre vacío - debería fallar
                'type' => 'invalid_type', // Tipo inválido - debería fallar
                'start_date' => 'invalid-date', // Fecha inválida - debería fallar
                'behavior' => 'invalid_behavior', // Comportamiento inválido - debería fallar
            ],
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/management/departments/{$department->id}", [
                'name' => $department->name,
                'color' => $department->color,
                'timezone' => $department->timezone,
                'exceptions' => $invalidExceptionsData,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'exceptions.0.name',
                'exceptions.0.type',
                'exceptions.0.start_date',
                'exceptions.0.behavior',
            ]);
    }
}
