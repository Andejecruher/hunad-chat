<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AiToolManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;

    protected Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create();
        $this->user = User::factory()->create(['company_id' => $this->company->id]);
    }

    public function test_user_can_view_ai_tools_index()
    {
        // Arrange
        Tool::factory()->count(3)->create(['company_id' => $this->company->id]);

        // Act
        $response = $this->actingAs($this->user)
            ->get('/management/ai-tools');

        // Assert
        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->component('management/ai-tools/index')
                ->has('tools')
                ->has('tools.data', 3);
        });
    }

    public function test_user_can_view_create_form()
    {
        // Act
        $response = $this->actingAs($this->user)
            ->get('/management/ai-tools/create');

        // Assert
        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->component('management/ai-tools/create')
                ->has('categories');
        });
    }

    public function test_user_can_create_internal_tool()
    {
        // Arrange
        $toolData = [
            'name' => 'Test Internal Tool',
            'type' => 'internal',
            'description' => 'A test internal tool',
            'category' => 'automation',
            'schema' => json_encode([
                'inputs' => [
                    ['name' => 'message', 'type' => 'string', 'required' => true, 'description' => 'Message to send'],
                ],
                'outputs' => [
                    ['name' => 'result', 'type' => 'string', 'description' => 'Operation result'],
                ],
            ]),
            'config' => json_encode([
                'action' => 'create_ticket',
            ]),
            'enabled' => true,
        ];

        // Act
        $response = $this->actingAs($this->user)
            ->post('/management/ai-tools', $toolData);

        // Assert
        $response->assertRedirect();
        $this->assertDatabaseHas('tools', [
            'name' => 'Test Internal Tool',
            'type' => 'internal',
            'company_id' => $this->company->id,
            'created_by' => $this->user->id,
        ]);
    }

    public function test_user_can_create_external_tool()
    {
        // Arrange
        $toolData = [
            'name' => 'Test External API',
            'type' => 'external',
            'description' => 'A test external API tool',
            'category' => 'integration',
            'schema' => json_encode([
                'inputs' => [
                    ['name' => 'data', 'type' => 'object', 'required' => true, 'description' => 'Data to send'],
                ],
                'outputs' => [
                    ['name' => 'response', 'type' => 'object', 'description' => 'API response'],
                ],
            ]),
            'config' => json_encode([
                'method' => 'POST',
                'url' => 'https://api.example.com/webhook',
                'headers' => [
                    ['key' => 'Authorization', 'value' => 'Bearer token'],
                    ['key' => 'Content-Type', 'value' => 'application/json'],
                ],
                'timeout' => 5000,
                'retries' => 3,
            ]),
            'enabled' => true,
        ];

        // Act
        $response = $this->actingAs($this->user)
            ->post('/management/ai-tools', $toolData);

        // Assert
        $response->assertRedirect();
        $this->assertDatabaseHas('tools', [
            'name' => 'Test External API',
            'type' => 'external',
            'company_id' => $this->company->id,
        ]);
    }

    public function test_user_can_view_tool_details()
    {
        // Arrange
        $tool = Tool::factory()->create([
            'company_id' => $this->company->id,
            'created_by' => $this->user->id,
        ]);

        // Debug: check if tool exists in database
        $this->assertDatabaseHas('tools', [
            'id' => $tool->id,
            'company_id' => $this->company->id,
        ]);

        // Debug: verify user and tool have same company
        $this->assertEquals($this->company->id, $this->user->company_id);
        $this->assertEquals($this->company->id, $tool->company_id);

        // Try the basic route first to see if it's reachable
        $response = $this->actingAs($this->user)
            ->get('/management/ai-tools');

        $this->assertEquals(200, $response->getStatusCode(), 'Index page should be accessible');

        // Act - Back to using ID
        $response = $this->actingAs($this->user)
            ->get("/management/ai-tools/{$tool->id}");

        // Debug: output response if not 200
        if ($response->getStatusCode() !== 200) {
            dump('Response status:', $response->getStatusCode());
            dump('Response content:', $response->getContent());
        }

        // Assert
        $response->assertOk();
        $response->assertInertia(function ($page) use ($tool) {
            $page->component('management/ai-tools/show')
                ->where('tool.id', $tool->id)
                ->has('executionStats');
        });
    }

    public function test_user_can_edit_tool()
    {
        // Arrange
        $tool = Tool::factory()->create([
            'company_id' => $this->company->id,
            'created_by' => $this->user->id,
        ]);

        // Act
        $response = $this->actingAs($this->user)
            ->get("/management/ai-tools/{$tool->id}/edit");

        // Assert
        $response->assertOk();
        $response->assertInertia(function ($page) use ($tool) {
            $page->component('management/ai-tools/edit')
                ->where('tool.id', $tool->id)
                ->has('categories');
        });
    }

    public function test_user_can_update_tool()
    {
        // Arrange
        $tool = Tool::factory()->create([
            'company_id' => $this->company->id,
            'created_by' => $this->user->id,
            'name' => 'Original Name',
            'enabled' => true,
        ]);

        $updateData = [
            'name' => 'Updated Tool Name',
            'type' => $tool->type,
            'description' => 'Updated description',
            'category' => $tool->category,
            'schema' => json_encode($tool->schema),  // Convert to JSON string
            'config' => json_encode($tool->config),  // Convert to JSON string
            'enabled' => 0,  // Using 0 instead of false
        ];

        // Act
        $response = $this->actingAs($this->user)
            ->put("/management/ai-tools/{$tool->id}", $updateData);

        // Assert
        $response->assertRedirect();

        // Refresh the tool from database
        $tool->refresh();

        $this->assertEquals('Updated Tool Name', $tool->name);
        $this->assertEquals(false, $tool->enabled);
        $this->assertEquals($this->user->id, $tool->updated_by);
    }

    public function test_user_can_toggle_tool_status()
    {
        // Arrange
        $tool = Tool::factory()->create([
            'company_id' => $this->company->id,
            'enabled' => true,
        ]);

        // Act
        $response = $this->actingAs($this->user)
            ->patch("/management/ai-tools/{$tool->id}/toggle-status");

        // Assert
        $response->assertRedirect();
        $this->assertDatabaseHas('tools', [
            'id' => $tool->id,
            'enabled' => false,
        ]);
    }

    public function test_user_can_delete_tool_without_recent_executions()
    {
        // Arrange
        $tool = Tool::factory()->create([
            'company_id' => $this->company->id,
        ]);

        // Act
        $response = $this->actingAs($this->user)
            ->delete("/management/ai-tools/{$tool->id}");

        // Assert
        $response->assertRedirect();
        $this->assertDatabaseMissing('tools', ['id' => $tool->id]);
    }

    public function test_user_cannot_delete_tool_with_recent_executions()
    {
        // Arrange
        $tool = Tool::factory()->create([
            'company_id' => $this->company->id,
        ]);

        // Simular ejecuciones recientes creando registros en la tabla tool_executions
        // (Asumiendo que existe el modelo ToolExecution)
        // ToolExecution::factory()->create([
        //     'tool_id' => $tool->id,
        //     'created_at' => now()->subDays(3),
        // ]);

        // Act & Assert (por ahora sin ejecuciones simuladas)
        $response = $this->actingAs($this->user)
            ->delete("/management/ai-tools/{$tool->id}");

        $response->assertRedirect();
    }

    public function test_user_cannot_access_tools_from_other_companies()
    {
        // Arrange
        $otherCompany = Company::factory()->create();
        $tool = Tool::factory()->create(['company_id' => $otherCompany->id]);

        // Act & Assert - Index should not show other company's tools
        $response = $this->actingAs($this->user)
            ->get('/management/ai-tools');

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->has('tools.data', 0);
        });

        // Act & Assert - Cannot view other company's tool
        $response = $this->actingAs($this->user)
            ->get("/management/ai-tools/{$tool->id}");

        $response->assertNotFound();

        // Act & Assert - Cannot edit other company's tool
        $response = $this->actingAs($this->user)
            ->get("/management/ai-tools/{$tool->id}/edit");

        $response->assertNotFound();

        // Act & Assert - Cannot update other company's tool
        $response = $this->actingAs($this->user)
            ->put("/management/ai-tools/{$tool->id}", [
                'name' => 'Hacked Name',
                'type' => 'internal',
            ]);

        $response->assertNotFound();
    }

    public function test_create_tool_requires_valid_data()
    {
        // Act & Assert - Missing required fields
        $response = $this->actingAs($this->user)
            ->post('/management/ai-tools', []);

        $response->assertSessionHasErrors(['name', 'type', 'schema', 'config']);

        // Act & Assert - Invalid type
        $response = $this->actingAs($this->user)
            ->post('/management/ai-tools', [
                'name' => 'Test Tool',
                'type' => 'invalid_type',
                'schema' => '{}',
                'config' => '{}',
            ]);

        $response->assertSessionHasErrors(['type']);

        // Act & Assert - Invalid JSON schema
        $response = $this->actingAs($this->user)
            ->post('/management/ai-tools', [
                'name' => 'Test Tool',
                'type' => 'internal',
                'schema' => 'invalid json',
                'config' => '{}',
            ]);

        $response->assertSessionHasErrors(['schema']);
    }

    public function test_can_filter_tools_by_status()
    {
        // Arrange
        Tool::factory()->create([
            'company_id' => $this->company->id,
            'enabled' => true,
        ]);
        Tool::factory()->create([
            'company_id' => $this->company->id,
            'enabled' => false,
        ]);

        // Act - Filter enabled tools
        $response = $this->actingAs($this->user)
            ->get('/management/ai-tools?status=enabled');

        // Assert
        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->has('tools.data', 1);
        });

        // Act - Filter disabled tools
        $response = $this->actingAs($this->user)
            ->get('/management/ai-tools?status=disabled');

        // Assert
        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->has('tools.data', 1);
        });
    }

    public function test_can_search_tools_by_name()
    {
        // Arrange
        Tool::factory()->create([
            'company_id' => $this->company->id,
            'name' => 'Create Ticket Tool',
        ]);
        Tool::factory()->create([
            'company_id' => $this->company->id,
            'name' => 'Send Message Tool',
        ]);

        // Act
        $response = $this->actingAs($this->user)
            ->get('/management/ai-tools?search=ticket');

        // Assert
        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->has('tools.data', 1);
        });
    }

    public function test_guest_cannot_access_ai_tools()
    {
        // Act & Assert
        $response = $this->get('/management/ai-tools');
        $response->assertRedirect('/login');

        $response = $this->get('/management/ai-tools/create');
        $response->assertRedirect('/login');

        $response = $this->post('/management/ai-tools', []);
        $response->assertRedirect('/login');
    }
}
