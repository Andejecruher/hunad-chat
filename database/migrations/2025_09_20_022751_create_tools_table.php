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
        Schema::create('tools', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');                 // "Crear Ticket"
            $table->string('slug');                 // "ticket.create"
            $table->string('category');             // ticket | whatsapp | external
            $table->string('type');                 // internal | external

            $table->json('schema');                 // input/output esperado
            $table->json('config');                 // config interna o HTTP
            $table->boolean('enabled')->default(true);

            $table->timestamp('last_executed_at')->nullable();
            $table->json('last_error')->nullable();

            $table->foreignId('created_by')->nullable();
            $table->foreignId('updated_by')->nullable();

            $table->timestamps();

            $table->unique(['company_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tools');
    }
};
