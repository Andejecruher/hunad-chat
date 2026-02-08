<?php

use App\Http\Controllers\AiToolController;
use App\Http\Controllers\ChannelController;
use App\Http\Controllers\CompaniesController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Company Routes
    Route::resource('/configurations/company', CompaniesController::class);
    // User Routes
    Route::resource('/configurations/users', UserController::class)->except(['create', 'edit', 'show']);
    Route::post('/configurations/users/{id}/resend-invite', [UserController::class, 'resendInvite'])->name('users.resend-invite');
    // Department Routes
    Route::resource('/management/departments', DepartmentController::class);
    Route::get('/management/departments/stats', [DepartmentController::class, 'stats'])->name('departments.stats');
    Route::patch('/management/departments/{department}/toggle-status', [DepartmentController::class, 'toggleStatus'])->name('departments.toggle-status');
    // Channels Routes
    Route::resource('/channels', ChannelController::class)->except(['create']);
    // IA Tools Routes
    Route::resource('/management/ai-tools', AiToolController::class);
    Route::patch('/management/ai-tools/{tool}/toggle-status', [AiToolController::class, 'toggleStatus'])->name('ai-tools.toggle-status');
    Route::post('/management/ai-tools/{tool}/test', [AiToolController::class, 'test'])->name('ai-tools.test');
    // Conversations Routes
    Route::resource('/conversations', ConversationController::class);
    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index'])->name('conversations.messages.index');
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store'])->name('conversations.messages.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
