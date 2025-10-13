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
    Route::resource('/configurations/company', CompaniesController::class);
    // User Routes
    Route::resource('/configurations/users', UserController::class);
   });

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
