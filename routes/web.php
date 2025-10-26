<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CompaniesController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartmentController;

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

});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
