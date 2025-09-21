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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('subscription_type', ['free', 'basic', 'pro', 'enterprise'])->default('free');
            $table->timestamp('subscription_expires_at')->nullable();
            $table->string('slug')->unique();
            $table->json('branding')->nullable(); // Configuración de branding light/dark
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
