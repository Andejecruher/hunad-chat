<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiToolControllerTest extends TestCase
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

    public function it_can_list_tools_for_authenticated_user()
    {
        // Crear herramientas para la empresa del usuario
        $toolsForUser = Tool::factory()->count(3)->create([
            'company_id' => $this->company->id,
        ]);

        // Crear herramientas para otra empresa (no deberían aparecer)
        $otherCompany = Company::factory()->create();
        Tool::factory()->count(2)->create([
            'company_id' => $otherCompany->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get('/management/ai-tools');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('management/ai-tools/index')
            ->has('tools.data', 3)
            ->where('tools.data.0.company_id', $this->company->id)
        );
    }

    public function it_can_create_a_new_tool()
    {
        $toolData = [
            'name' => 'Test Tool',
            'type' => 'internal',
            'category' => 'automation',
            'description' => 'A test tool',
            'schema' => json_encode([
                'inputs' => [
                    [
                        'name' => 'message',
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Message to process',
                    ],
                ],
                'outputs' => [
                    [
                        'name' => 'result',
                        'type' => 'string',
                        'description' => 'Processed result',
                    ],
                ],
            ]),
            'config' => json_encode([
                'action' => 'create_ticket',
            ]),
            'enabled' => true,
        ];

        $response = $this->actingAs($this->user)
            ->post('/management/ai-tools', $toolData);

        $response->assertRedirect();

        $this->assertDatabaseHas('tools', [
            'name' => 'Test Tool',
            'company_id' => $this->company->id,
            'type' => 'internal',
            'enabled' => true,
        ]);
    }

    public function it_validates_required_fields_when_creating_tool()
    {
        $response = $this->actingAs($this->user)
            ->post('/management/ai-tools', []);

        $response->assertSessionHasErrors([
            'name', 'type', 'category', 'schema', 'config',
        ]);
    }

    public function it_can_toggle_tool_status()
    {
        $tool = Tool::factory()->create([
            'company_id' => $this->company->id,
            'enabled' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->patch("/management/ai-tools/{$tool->id}/toggle-status");

        $response->assertRedirect();

        $this->assertDatabaseHas('tools', [
            'id' => $tool->id,
            'enabled' => false,
        ]);
    }

    public function it_requires_authentication_for_all_actions()
    {
        $tool = Tool::factory()->create();

        $this->get('/management/ai-tools')
            ->assertRedirect('/login');

        $this->post('/management/ai-tools', [])
            ->assertRedirect('/login');

        $this->delete("/management/ai-tools/{$tool->id}")
            ->assertRedirect('/login');
    }
}
