<?php

namespace Tests\Feature;

use App\Models\AiAgent;
use App\Models\Company;
use App\Models\Tool;
use App\Models\ToolExecution;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ToolExecutionControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Company $company;

    private AiAgent $agent;

    private Tool $tool;

    protected function setUp(): void
    {
        parent::setUp();

        Queue::fake();

        $this->company = Company::factory()->create();
        $this->user = User::factory()->create(['company_id' => $this->company->id]);

        $this->agent = AiAgent::factory()->create([
            'company_id' => $this->company->id,
        ]);

        $this->tool = Tool::factory()->create([
            'company_id' => $this->company->id,
            'enabled' => true,
            'slug' => 'test-tool',
            'schema' => [
                'inputs' => [
                    [
                        'name' => 'title',
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Título',
                    ],
                ],
                'outputs' => [
                    [
                        'name' => 'result',
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Resultado',
                    ],
                ],
            ],
        ]);

        $this->agent->tools()->attach($this->tool->id);

        $this->actingAs($this->user);
    }

    public function it_can_execute_tool_asynchronously()
    {
        $payload = ['title' => 'Test execution'];

        $response = $this->postJson("/api/ai/agents/{$this->agent->id}/tools/{$this->tool->slug}/execute", [
            'payload' => $payload,
            'sync' => false,
        ]);

        $response->assertStatus(202)
            ->assertJson([
                'success' => true,
                'meta' => [
                    'agent_id' => $this->agent->id,
                    'tool_slug' => $this->tool->slug,
                    'execution_mode' => 'asynchronous',
                ],
            ])
            ->assertJsonStructure([
                'data' => [
                    'execution_id',
                    'status',
                    'created_at',
                ],
            ]);

        $this->assertDatabaseHas('tool_executions', [
            'tool_id' => $this->tool->id,
            'ai_agent_id' => $this->agent->id,
            'status' => 'accepted',
        ]);

        Queue::assertPushed(\App\Jobs\ExecuteToolJob::class);
    }

    public function it_validates_payload_structure()
    {
        $response = $this->postJson("/api/ai/agents/{$this->agent->id}/tools/{$this->tool->slug}/execute", [
            'payload' => 'invalid-payload', // debe ser array
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'error' => 'Validation error',
            ]);
    }

    public function it_rejects_execution_for_nonexistent_tool()
    {
        $response = $this->postJson("/api/ai/agents/{$this->agent->id}/tools/nonexistent-tool/execute", [
            'payload' => ['title' => 'Test'],
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'error' => 'Tool execution error',
            ]);
    }

    public function it_rejects_execution_for_agent_from_different_company()
    {
        $otherCompany = Company::factory()->create();
        $otherAgent = AiAgent::factory()->create(['company_id' => $otherCompany->id]);

        $response = $this->postJson("/api/ai/agents/{$otherAgent->id}/tools/{$this->tool->slug}/execute", [
            'payload' => ['title' => 'Test'],
        ]);

        $response->assertStatus(404)
            ->assertJson([
                'error' => 'Agent not found',
            ]);
    }

    public function it_can_get_execution_details()
    {
        $execution = ToolExecution::factory()->create([
            'tool_id' => $this->tool->id,
            'ai_agent_id' => $this->agent->id,
            'status' => 'success',
            'payload' => ['title' => 'Test'],
            'result' => ['result' => 'Success'],
        ]);

        $response = $this->getJson("/api/ai/agents/{$this->agent->id}/executions/{$execution->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $execution->id,
                    'tool' => [
                        'slug' => $this->tool->slug,
                        'name' => $this->tool->name,
                    ],
                    'payload' => ['title' => 'Test'],
                    'result' => ['result' => 'Success'],
                    'status' => 'success',
                ],
            ]);
    }

    public function it_can_list_agent_executions()
    {
        ToolExecution::factory()->count(3)->create([
            'ai_agent_id' => $this->agent->id,
            'tool_id' => $this->tool->id,
        ]);

        $response = $this->getJson("/api/ai/agents/{$this->agent->id}/executions");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'meta' => [
                    'agent_id' => $this->agent->id,
                    'total' => 3,
                ],
            ])
            ->assertJsonCount(3, 'data');
    }

    public function it_can_filter_executions_by_status()
    {
        ToolExecution::factory()->create([
            'ai_agent_id' => $this->agent->id,
            'tool_id' => $this->tool->id,
            'status' => 'success',
        ]);

        ToolExecution::factory()->create([
            'ai_agent_id' => $this->agent->id,
            'tool_id' => $this->tool->id,
            'status' => 'failed',
        ]);

        $response = $this->getJson("/api/ai/agents/{$this->agent->id}/executions?status=success");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function it_can_get_execution_stats()
    {
        ToolExecution::factory()->create([
            'ai_agent_id' => $this->agent->id,
            'tool_id' => $this->tool->id,
            'status' => 'success',
        ]);

        ToolExecution::factory()->create([
            'ai_agent_id' => $this->agent->id,
            'tool_id' => $this->tool->id,
            'status' => 'failed',
        ]);

        $response = $this->getJson("/api/ai/agents/{$this->agent->id}/executions/stats");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_executions' => 2,
                    'successful_executions' => 1,
                    'failed_executions' => 1,
                    'success_rate' => 50.0,
                ],
            ]);
    }

    public function it_can_cancel_pending_execution()
    {
        $execution = ToolExecution::factory()->create([
            'ai_agent_id' => $this->agent->id,
            'tool_id' => $this->tool->id,
            'status' => 'accepted',
        ]);

        $response = $this->deleteJson("/api/ai/agents/{$this->agent->id}/executions/{$execution->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Execution cancelled successfully',
            ]);

        $execution->refresh();
        $this->assertEquals('cancelled', $execution->status);
    }

    public function it_cannot_cancel_completed_execution()
    {
        $execution = ToolExecution::factory()->create([
            'ai_agent_id' => $this->agent->id,
            'tool_id' => $this->tool->id,
            'status' => 'success',
        ]);

        $response = $this->deleteJson("/api/ai/agents/{$this->agent->id}/executions/{$execution->id}");

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'error' => 'Cannot cancel execution',
            ]);
    }

    public function it_can_retry_failed_execution()
    {
        $failedExecution = ToolExecution::factory()->create([
            'ai_agent_id' => $this->agent->id,
            'tool_id' => $this->tool->id,
            'status' => 'failed',
            'payload' => ['title' => 'Test retry'],
        ]);

        $response = $this->postJson("/api/ai/agents/{$this->agent->id}/executions/{$failedExecution->id}/retry", [
            'sync' => false,
        ]);

        $response->assertStatus(202)
            ->assertJson([
                'success' => true,
                'message' => 'Tool execution retried successfully',
                'data' => [
                    'original_execution_id' => $failedExecution->id,
                    'execution_mode' => 'asynchronous',
                ],
            ]);

        // Verificar que se creó una nueva ejecución
        $this->assertDatabaseHas('tool_executions', [
            'tool_id' => $this->tool->id,
            'ai_agent_id' => $this->agent->id,
            'status' => 'accepted',
        ]);

        Queue::assertPushed(\App\Jobs\ExecuteToolJob::class);
    }
}
