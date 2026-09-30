<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        // Server-side rendering is for search engines and link previews, so
        // private pages (the planner, admin, personal invitations) skip it.
        Inertia::withoutSsr([
            'admin*', 'dashboard', 'events*', 'settings*', 'orders*', 'checkout*',
            'i/*', 'invite/*', 'confirm-password', 'two-factor-challenge', 'reset-password*',
        ]);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        // Kept simple on purpose: many users type on a phone in Khmer and
        // strict rules made them give up signing up.
        Password::defaults(fn (): Password => Password::min(6));
    }
}
