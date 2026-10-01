<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\GiftController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RsvpController;
use App\Http\Controllers\SeoController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TemplateController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('pricing', [OrderController::class, 'pricing'])->name('pricing');
Route::get('templates', [TemplateController::class, 'index'])->name('templates.index');
Route::get('templates/{template}', [TemplateController::class, 'show'])->name('templates.show');
Route::middleware('guest')->group(function () {
    Route::get('auth/google', [GoogleController::class, 'redirect'])->name('google.redirect');
    Route::get('auth/google/callback', [GoogleController::class, 'callback'])->name('google.callback');
});
Route::get('blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('blog/{post:slug}', [BlogController::class, 'show'])->name('blog.show');
Route::get('sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');
Route::get('robots.txt', [SeoController::class, 'robots'])->name('robots');
Route::get('llms.txt', [SeoController::class, 'llms'])->name('llms');

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
    Route::get('analytics', Admin\AnalyticsController::class)->name('analytics');
    Route::get('orders', [Admin\OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}/receipt', [Admin\OrderController::class, 'receipt'])->name('orders.receipt');
    Route::patch('orders/{order}', [Admin\OrderController::class, 'update'])->name('orders.update');
    Route::resource('packages', Admin\PackageController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('users', Admin\UserController::class)->only(['index', 'show', 'update']);
    Route::patch('events/{event}/package', [Admin\UserController::class, 'updateEventPackage'])->name('events.package');
    Route::get('events', [Admin\EventController::class, 'index'])->name('events.index');
    Route::post('posts/images', [Admin\PostController::class, 'image'])->name('posts.image');
    Route::post('posts/preview', [Admin\PostController::class, 'preview'])->name('posts.preview');
    Route::post('posts/import', [Admin\PostController::class, 'import'])->name('posts.import');
    Route::get('posts/import-template', [Admin\PostController::class, 'importTemplate'])->name('posts.template');
    Route::resource('posts', Admin\PostController::class)->except(['show']);
    Route::get('settings', [Admin\SettingController::class, 'edit'])->name('settings.edit');
    Route::post('settings', [Admin\SettingController::class, 'update'])->name('settings.update');
});

Route::get('i/{invitation:public_id}', [InvitationController::class, 'share'])->name('invitations.share');
Route::get('invite/{guest:invite_code}', [InvitationController::class, 'guest'])->name('invitations.guest');
Route::post('i/{invitation:public_id}/rsvp', [RsvpController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('invitations.rsvp');

require __DIR__.'/settings.php';
