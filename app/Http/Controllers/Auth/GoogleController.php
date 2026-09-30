<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * Sign in with Google (OAuth 2.0 authorization-code flow).
 */
class GoogleController extends Controller
{
    private const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';

    private const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

    public static function enabled(): bool
    {
        return filled(config('services.google.client_id')) && filled(config('services.google.client_secret'));
    }

    public function redirect(Request $request): RedirectResponse
    {
        abort_unless(self::enabled(), 404);

        $state = Str::random(40);
        $request->session()->put('google_oauth_state', $state);

        return redirect()->away(self::AUTHORIZE_URL.'?'.http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => route('google.callback'),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'prompt' => 'select_account',
        ]));
    }

    public function callback(Request $request): RedirectResponse
    {
        abort_unless(self::enabled(), 404);

        $expected = $request->session()->pull('google_oauth_state');

        // A missing or wrong state means the request didn't start here.
        if (! is_string($expected) || ! hash_equals($expected, (string) $request->query('state')) || ! $request->filled('code')) {
            return $this->fail();
        }

        try {
            $token = Http::asForm()->post(self::TOKEN_URL, [
                'code' => $request->query('code'),
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'redirect_uri' => route('google.callback'),
                'grant_type' => 'authorization_code',
            ])->throw()->json('access_token');

            $profile = Http::withToken((string) $token)->get(self::USERINFO_URL)->throw()->json();
        } catch (Throwable $e) {
            Log::warning('Google sign-in failed: '.$e->getMessage());

            return $this->fail();
        }

        $googleId = (string) ($profile['sub'] ?? '');
        $email = strtolower((string) ($profile['email'] ?? ''));

        // Only trust addresses Google has verified, or anyone could claim an
        // existing account by its email.
        if ($googleId === '' || $email === '' || ($profile['email_verified'] ?? false) !== true) {
            return $this->fail();
        }

        $user = User::query()->where('google_id', $googleId)->first()
            ?? User::query()->where('email', $email)->first();

        if ($user === null) {
            $user = User::forceCreate([
                'name' => Str::limit((string) ($profile['name'] ?? Str::before($email, '@')), 255, ''),
                'email' => $email,
                'google_id' => $googleId,
                // They can set a real password later with "Forgot password".
                'password' => Str::password(32),
                'email_verified_at' => now(),
            ]);
        } elseif ($user->google_id === null) {
            $user->forceFill(['google_id' => $googleId])->save();
        }

        if ($user->isDisabled()) {
            return redirect()->route('login')->with('status', __('Your account has been disabled. Please contact support.'));
        }

        // Accounts with two-factor authentication still have to pass it.
        if ($user->two_factor_confirmed_at !== null) {
            $request->session()->put(['login.id' => $user->getKey(), 'login.remember' => true]);

            return redirect()->route('two-factor.login');
        }

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    private function fail(): RedirectResponse
    {
        return redirect()->route('login')->with('status', __('Google sign-in did not work. Please try again.'));
    }
}
