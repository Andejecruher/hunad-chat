<?php

use App\Http\Controllers\AiToolController;
use App\Http\Controllers\ChannelController;
use App\Http\Controllers\CompaniesController;
use App\Http\Controllers\DepartmentController;
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
    Route::resource('/management/ia-tools', AiToolController::class)->except(['create']);
    Route::get('/management/ia-tools/create', function () {
        return inertia('management/ia-tools/create');
    })->name('ia-tools.create');
    Route::patch('/management/ia-tools/{tool}/toggle-status', [AiToolController::class, 'toggleStatus'])->name('ia-tools.toggle-status');
    Route::post('/management/ia-tools/{tool}/test', [AiToolController::class, 'test'])->name('ia-tools.test');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
