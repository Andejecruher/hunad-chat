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
        Schema::create('channels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['whatsapp', 'instagram', 'facebook', 'telegram']);
            $table->string('external_id')->nullable(); // ID de cuenta/línea específica
            $table->json('config')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'type', 'external_id']); // Permite múltiples cuentas por tipo, sin duplicados
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('channels');
    }
};
