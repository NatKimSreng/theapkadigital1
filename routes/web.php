<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\GiftController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [EventController::class, 'dashboard'])->name('dashboard');

    Route::resource('events', EventController::class)->except(['create', 'edit']);

    Route::scopeBindings()->prefix('events/{event}')->name('events.')->group(function () {
        Route::resource('guests', GuestController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('guests/{guest}/sent', [GuestController::class, 'markSent'])->name('guests.sent');
        Route::get('guests/{guest}/qr', [GuestController::class, 'qr'])->name('guests.qr');
        Route::resource('gifts', GiftController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('expenses', ExpenseController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('tasks', TaskController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::get('templates', [InvitationController::class, 'catalog'])->name('templates');
        Route::resource('invitations', InvitationController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('invitations/{invitation}/activate', [InvitationController::class, 'activate'])->name('invitations.activate');
    });
});

Route::get('i/{invitation:public_id}', [InvitationController::class, 'share'])->name('invitations.share');
Route::get('invite/{guest:invite_code}', [InvitationController::class, 'guest'])->name('invitations.guest');

require __DIR__.'/settings.php';
