<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\GiftController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RsvpController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('pricing', [OrderController::class, 'pricing'])->name('pricing');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [EventController::class, 'dashboard'])->name('dashboard');

    Route::resource('events', EventController::class)->except(['create', 'edit']);

    Route::get('checkout/{package}', [OrderController::class, 'checkout'])->name('checkout');
    Route::post('checkout/{package}', [OrderController::class, 'store'])->name('checkout.store');
    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');

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
        Route::resource('rsvps', RsvpController::class)->only(['index', 'destroy']);
    });
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', Admin\DashboardController::class)->name('dashboard');
    Route::get('orders', [Admin\OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}/receipt', [Admin\OrderController::class, 'receipt'])->name('orders.receipt');
    Route::patch('orders/{order}', [Admin\OrderController::class, 'update'])->name('orders.update');
    Route::resource('packages', Admin\PackageController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('users', Admin\UserController::class)->only(['index', 'show', 'update']);
    Route::patch('events/{event}/package', [Admin\UserController::class, 'updateEventPackage'])->name('events.package');
});

Route::get('i/{invitation:public_id}', [InvitationController::class, 'share'])->name('invitations.share');
Route::get('invite/{guest:invite_code}', [InvitationController::class, 'guest'])->name('invitations.guest');
Route::post('i/{invitation:public_id}/rsvp', [RsvpController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('invitations.rsvp');

require __DIR__.'/settings.php';
