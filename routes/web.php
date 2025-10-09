<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CompaniesController;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Company Routes
    Route::get('/configurations/company', [CompaniesController::class, 'show'])->name('configurations.company');
    Route::put('/configurations/company/{company}', [CompaniesController::class, 'update'])->name('configurations.company.update');
    Route::post('/configurations/company/{company}', [CompaniesController::class, 'update'])->name('configurations.company.update.post');

    // User Routes
    Route::get('/configurations/users', [UserController::class, 'index'])->name('configurations.users');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
