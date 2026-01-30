<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('ai_agent_tool')) {
            Schema::create('ai_agent_tool', function (Blueprint $table) {
                $table->id();

                $table->foreignId('agent_id')
                    ->constrained('ai_agents')
                    ->cascadeOnDelete();

                $table->foreignId('tool_id')
                    ->constrained()
                    ->cascadeOnDelete();

                $table->timestamps();

                $table->unique(['agent_id', 'tool_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_agent_tool');
    }
};
