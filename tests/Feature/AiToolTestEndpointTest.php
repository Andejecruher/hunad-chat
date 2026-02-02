<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiToolTestEndpointTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Company $company;

    private Tool $tool;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create();
        $this->user = User::factory()->create([
            'company_id' => $this->company->id,
            'email_verified_at' => now(),
        ]);

        $this->tool = Tool::factory()->create([
            'company_id' => $this->company->id,
            'enabled' => true,
            'schema' => [
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
            ],
        ]);
    }

    public function test_tool_test_endpoint_requires_authentication()
    {
        $response = $this->post("/management/ai-tools/{$this->tool->id}/test", [
            'payload' => ['message' => 'test'],
        ]);

        $response->assertRedirect('/login');
    }

    public function test_tool_test_endpoint_validates_payload()
    {
        $response = $this->actingAs($this->user)
            ->post("/management/ai-tools/{$this->tool->id}/test", [
                // Sin payload
            ]);

        // Debería redirigir de vuelta con errores
        $response->assertRedirect();
        $response->assertSessionHasErrors(['payload']);
    }

    public function test_tool_test_endpoint_only_allows_company_tools()
    {
        $otherCompany = Company::factory()->create();
        $otherTool = Tool::factory()->create([
            'company_id' => $otherCompany->id,
            'enabled' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->post("/management/ai-tools/{$otherTool->id}/test", [
                'payload' => ['message' => 'test'],
            ]);

        $response->assertNotFound();
    }
}
