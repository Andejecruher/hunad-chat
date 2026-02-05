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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->enum('sender_type', ['customer', 'agent', 'ai']);
            $table->text('content');
            $table->enum('type', ['text', 'image', 'video', 'file', 'audio', 'reaction', 'system', 'sticker'])->default('text');
            $table->boolean('is_read')->default(false);
            $table->string('external_id')->nullable(); // ID de cuenta/línea específica
            $table->json('attachments')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
