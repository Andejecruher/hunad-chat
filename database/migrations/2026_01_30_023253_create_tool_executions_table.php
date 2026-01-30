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
        Schema::create('tool_executions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tool_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('ai_agent_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->json('payload');
            $table->string('status'); // accepted | success | failed
            $table->json('result')->nullable();
            $table->json('error')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_executions');
    }
};
