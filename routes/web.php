<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\GiftController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [EventController::class, 'dashboard'])->name('dashboard');

    Route::resource('events', EventController::class)->except(['create', 'edit']);

    Route::scopeBindings()->prefix('events/{event}')->name('events.')->group(function () {
        Route::resource('guests', GuestController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('gifts', GiftController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('expenses', ExpenseController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('tasks', TaskController::class)->only(['index', 'store', 'update', 'destroy']);
    });
});

require __DIR__.'/settings.php';
