<?php

namespace Tests\Unit;

use App\Exceptions\ToolExecutionException;
use App\Exceptions\ToolSchemaValidationException;
use App\Models\AiAgent;
use App\Models\Company;
use App\Models\Tool;
use App\Models\ToolExecution;
use App\Models\User;
use App\Services\AI\ToolExecutor;
use App\Services\AI\ToolRegistry;
use App\Services\AI\ToolValidator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ToolExecutorTest extends TestCase
{
    use RefreshDatabase;

    private ToolExecutor $toolExecutor;

    private Company $company;

    private AiAgent $agent;

    private Tool $tool;

    protected function setUp(): void
    {
        parent::setUp();

        Queue::fake();

        // Crear servicios mockeados
        $toolRegistry = $this->createMock(ToolRegistry::class);
        $toolValidator = $this->createMock(ToolValidator::class);

        $this->toolExecutor = new ToolExecutor($toolRegistry, $toolValidator);

        // Crear datos de prueba
        $this->company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $this->company->id]);

        $this->agent = AiAgent::factory()->create([
            'company_id' => $this->company->id,
        ]);

        $this->tool = Tool::factory()->create([
            'company_id' => $this->company->id,
            'enabled' => true,
            'schema' => [
                'inputs' => [
                    [
                        'name' => 'title',
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Título del ticket',
                    ],
                ],
                'outputs' => [
                    [
                        'name' => 'ticket_id',
                        'type' => 'string',
                        'required' => true,
                        'description' => 'ID del ticket creado',
                    ],
                ],
            ],
        ]);

        $this->agent->tools()->attach($this->tool->id);

        // Configurar mocks
        $toolRegistry->method('getToolForAgent')
            ->willReturn($this->tool);

        $toolRegistry->method('canAgentAccessTool')
            ->willReturn(true);

        // El método validatePayload es void, no devuelve nada
        $toolValidator->expects($this->any())
            ->method('validatePayload');
    }

    public function it_can_execute_tool_asynchronously()
    {
        $payload = ['title' => 'Test ticket'];

        $execution = $this->toolExecutor->execute($this->agent, $this->tool->slug, $payload);

        $this->assertInstanceOf(ToolExecution::class, $execution);
        $this->assertEquals('accepted', $execution->status);
        $this->assertEquals($this->tool->id, $execution->tool_id);
        $this->assertEquals($this->agent->id, $execution->ai_agent_id);
        $this->assertEquals($payload, $execution->payload);

        // Verificar que el job fue despachado
        Queue::assertPushed(\App\Jobs\ExecuteToolJob::class);
    }

    public function it_throws_exception_for_nonexistent_tool()
    {
        $toolRegistry = $this->createMock(ToolRegistry::class);
        $toolValidator = $this->createMock(ToolValidator::class);

        $toolRegistry->method('getToolForAgent')
            ->willReturn(null);

        $executor = new ToolExecutor($toolRegistry, $toolValidator);

        $this->expectException(ToolExecutionException::class);
        $this->expectExceptionMessage('Tool with ID nonexistent-tool not found or not accessible');

        $executor->execute($this->agent, 'nonexistent-tool', []);
    }

    public function it_throws_exception_for_disabled_tool()
    {
        $disabledTool = Tool::factory()->create([
            'company_id' => $this->company->id,
            'enabled' => false,
        ]);

        $toolRegistry = $this->createMock(ToolRegistry::class);
        $toolValidator = $this->createMock(ToolValidator::class);

        $toolRegistry->method('getToolForAgent')
            ->willReturn($disabledTool);

        $executor = new ToolExecutor($toolRegistry, $toolValidator);

        $this->expectException(ToolExecutionException::class);
        $this->expectExceptionMessage("Tool '{$disabledTool->name}' is currently disabled");

        $executor->execute($this->agent, $disabledTool->slug, []);
    }

    public function it_throws_exception_for_unauthorized_agent()
    {
        $toolRegistry = $this->createMock(ToolRegistry::class);
        $toolValidator = $this->createMock(ToolValidator::class);

        $toolRegistry->method('getToolForAgent')
            ->willReturn($this->tool);

        $toolRegistry->method('canAgentAccessTool')
            ->willReturn(false);

        $executor = new ToolExecutor($toolRegistry, $toolValidator);

        $this->expectException(ToolExecutionException::class);
        $this->expectExceptionMessage("Agent {$this->agent->id} is not authorized to execute tool '{$this->tool->name}'");

        $executor->execute($this->agent, $this->tool->slug, []);
    }

    public function it_validates_payload_before_execution()
    {
        $toolRegistry = $this->createMock(ToolRegistry::class);
        $toolValidator = $this->createMock(ToolValidator::class);

        $toolRegistry->method('getToolForAgent')
            ->willReturn($this->tool);

        $toolRegistry->method('canAgentAccessTool')
            ->willReturn(true);

        $toolValidator->method('validatePayload')
            ->willThrowException(
                ToolSchemaValidationException::invalidPayload($this->tool->name, ['title is required'])
            );

        $executor = new ToolExecutor($toolRegistry, $toolValidator);

        $this->expectException(ToolSchemaValidationException::class);
        $this->expectExceptionMessage("Invalid payload for tool '{$this->tool->name}': title is required");

        $executor->execute($this->agent, $this->tool->slug, []);
    }

    public function it_can_get_executions_with_filters()
    {
        // Crear algunas ejecuciones de prueba
        $execution1 = ToolExecution::factory()->create([
            'ai_agent_id' => $this->agent->id,
            'tool_id' => $this->tool->id,
            'status' => 'success',
        ]);

        $execution2 = ToolExecution::factory()->create([
            'ai_agent_id' => $this->agent->id,
            'tool_id' => $this->tool->id,
            'status' => 'failed',
        ]);

        // Test sin filtros
        $executions = $this->toolExecutor->getExecutions($this->agent);
        $this->assertCount(2, $executions->items());

        // Test con filtro de status
        $successExecutions = $this->toolExecutor->getExecutions($this->agent, ['status' => 'success']);
        $this->assertCount(1, $successExecutions->items());

        $failedExecutions = $this->toolExecutor->getExecutions($this->agent, ['status' => 'failed']);
        $this->assertCount(1, $failedExecutions->items());
    }

    public function it_can_get_execution_stats()
    {
        // Crear ejecuciones de prueba
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

        ToolExecution::factory()->create([
            'ai_agent_id' => $this->agent->id,
            'tool_id' => $this->tool->id,
            'status' => 'accepted',
        ]);

        $stats = $this->toolExecutor->getExecutionStats($this->agent);

        $this->assertEquals(3, $stats['total_executions']);
        $this->assertEquals(1, $stats['successful_executions']);
        $this->assertEquals(1, $stats['failed_executions']);
        $this->assertEquals(1, $stats['pending_executions']);
        $this->assertEquals(50.0, $stats['success_rate']); // 1 success / 2 completed = 50%
        $this->assertArrayHasKey('most_used_tools', $stats);
    }
}
