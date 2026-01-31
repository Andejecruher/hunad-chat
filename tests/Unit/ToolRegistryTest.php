<?php

namespace Tests\Unit;

use App\Models\AiAgent;
use App\Models\Company;
use App\Models\Tool;
use App\Models\User;
use App\Services\AI\ToolRegistry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToolRegistryTest extends TestCase
{
    use RefreshDatabase;

    private ToolRegistry $toolRegistry;

    private Company $company;

    private AiAgent $agent;

    private Tool $internalTool;

    private Tool $externalTool;

    private Tool $disabledTool;

    protected function setUp(): void
    {
        parent::setUp();

        $this->toolRegistry = new ToolRegistry;

        // Crear datos de prueba
        $this->company = Company::factory()->create();

        $user = User::factory()->create(['company_id' => $this->company->id]);

        $this->agent = AiAgent::factory()->create([
            'company_id' => $this->company->id,
        ]);

        $this->internalTool = Tool::factory()->create([
            'company_id' => $this->company->id,
            'type' => 'internal',
            'enabled' => true,
        ]);

        $this->externalTool = Tool::factory()->create([
            'company_id' => $this->company->id,
            'type' => 'external',
            'enabled' => true,
        ]);

        $this->disabledTool = Tool::factory()->create([
            'company_id' => $this->company->id,
            'enabled' => false,
        ]);

        // Asociar herramientas al agente
        $this->agent->tools()->attach([
            $this->internalTool->id,
            $this->externalTool->id,
            $this->disabledTool->id,
        ]);
    }

    public function it_can_get_available_tools_for_agent()
    {
        $tools = $this->toolRegistry->getAvailableToolsForAgent($this->agent);

        // Solo debe retornar herramientas habilitadas
        $this->assertCount(2, $tools);
        $this->assertTrue($tools->contains($this->internalTool));
        $this->assertTrue($tools->contains($this->externalTool));
        $this->assertFalse($tools->contains($this->disabledTool));
    }

    public function it_filters_tools_by_company()
    {
        $otherCompany = Company::factory()->create();
        $otherAgent = AiAgent::factory()->create(['company_id' => $otherCompany->id]);

        $otherTool = Tool::factory()->create([
            'company_id' => $otherCompany->id,
            'enabled' => true,
        ]);

        $otherAgent->tools()->attach($otherTool->id);

        $tools = $this->toolRegistry->getAvailableToolsForAgent($this->agent);

        $this->assertFalse($tools->contains($otherTool));
    }

    public function it_can_get_specific_tool_for_agent()
    {
        $tool = $this->toolRegistry->getToolForAgent($this->agent, $this->internalTool->slug);

        $this->assertNotNull($tool);
        $this->assertEquals($this->internalTool->id, $tool->id);
    }

    public function it_returns_null_for_disabled_tool()
    {
        $tool = $this->toolRegistry->getToolForAgent($this->agent, $this->disabledTool->slug);

        $this->assertNull($tool);
    }

    public function it_returns_null_for_unassigned_tool()
    {
        $unassignedTool = Tool::factory()->create([
            'company_id' => $this->company->id,
            'enabled' => true,
        ]);

        $tool = $this->toolRegistry->getToolForAgent($this->agent, $unassignedTool->slug);

        $this->assertNull($tool);
    }

    public function it_can_check_agent_access_to_tool()
    {
        $this->assertTrue($this->toolRegistry->canAgentAccessTool($this->agent, $this->internalTool));
        $this->assertFalse($this->toolRegistry->canAgentAccessTool($this->agent, $this->disabledTool));
    }

    public function it_denies_access_to_tools_from_different_companies()
    {
        $otherCompany = Company::factory()->create();
        $otherTool = Tool::factory()->create([
            'company_id' => $otherCompany->id,
            'enabled' => true,
        ]);

        $this->assertFalse($this->toolRegistry->canAgentAccessTool($this->agent, $otherTool));
    }

    public function it_can_normalize_tools_for_ai()
    {
        $tools = $this->agent->tools()
            ->where('enabled', true)
            ->where('company_id', $this->company->id)
            ->get();

        $normalized = $this->toolRegistry->normalizeToolsForAI($tools);

        $this->assertCount(2, $normalized);

        $firstTool = $normalized[0];
        $this->assertArrayHasKey('name', $firstTool);
        $this->assertArrayHasKey('description', $firstTool);
        $this->assertArrayHasKey('input_schema', $firstTool);
        $this->assertArrayHasKey('output_schema', $firstTool);
        $this->assertArrayHasKey('category', $firstTool);
        $this->assertArrayHasKey('type', $firstTool);
    }

    public function it_can_get_tools_by_category()
    {
        $this->internalTool->update(['category' => 'tickets']);
        $this->externalTool->update(['category' => 'external']);

        $ticketTools = $this->toolRegistry->getToolsByCategory($this->agent, 'tickets');
        $externalTools = $this->toolRegistry->getToolsByCategory($this->agent, 'external');

        $this->assertCount(1, $ticketTools);
        $this->assertTrue($ticketTools->contains($this->internalTool));

        $this->assertCount(1, $externalTools);
        $this->assertTrue($externalTools->contains($this->externalTool));
    }

    public function it_can_get_tool_stats()
    {
        $stats = $this->toolRegistry->getToolStats($this->agent);

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('total_tools', $stats);
        $this->assertArrayHasKey('internal_tools', $stats);
        $this->assertArrayHasKey('external_tools', $stats);
        $this->assertArrayHasKey('categories', $stats);

        $this->assertEquals(2, $stats['total_tools']); // Solo habilitadas
        $this->assertEquals(1, $stats['internal_tools']);
        $this->assertEquals(1, $stats['external_tools']);
    }
}
