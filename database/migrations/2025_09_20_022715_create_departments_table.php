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
        // Tabla principal de departamentos (actualizada)
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('color')->default('bg-brand-green');
            $table->text('description')->nullable();
            $table->string('timezone')->default('UTC');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['company_id', 'is_active']);
        });

        // Tabla de horarios regulares por día de la semana
        Schema::create('department_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->integer('day_of_week')->comment('0-6, 0=Sunday, 6=Saturday');
            $table->time('open_time')->nullable();
            $table->time('close_time')->nullable();
            $table->boolean('is_closed')->default(false);
            $table->timestamps();
            $table->index(['department_id', 'day_of_week', 'is_closed']);
        });

        // Tabla de excepciones con todos los comportamientos
        Schema::create('department_exceptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['annual', 'monthly', 'specific']);
            $table->date('start_date');
            $table->date('end_date')->nullable()->comment('Para excepciones de múltiples días');
            $table->json('recurrence_pattern')->nullable()->comment('Patrón de recurrencia en JSON');
            $table->enum('behavior', ['fully_closed', 'partially_closed', 'partially_open'])->default('fully_closed');
            $table->time('special_open_time')->nullable()->comment('Para comportamiento partially_closed');
            $table->time('special_close_time')->nullable()->comment('Para comportamiento partially_closed');
            $table->json('partial_hours')->nullable()->comment('Array de horarios para partially_open');
            $table->timestamps();

            // Índices para búsquedas eficientes
            $table->index(['department_id', 'start_date']);
            $table->index(['department_id', 'type']);
            $table->index(['department_id', 'behavior']);
            $table->index(['start_date', 'end_date']);
        });

        // Tabla para auditoría de cambios en horarios (opcional pero recomendado)
        Schema::create('department_schedule_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->string('change_type')->comment('created, updated, deleted, exception_added');
            $table->json('previous_data')->nullable();
            $table->json('new_data')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->index(['department_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('department_schedule_audits');
        Schema::dropIfExists('department_exceptions');
        Schema::dropIfExists('department_hours');
        Schema::dropIfExists('departments');
    }
};
