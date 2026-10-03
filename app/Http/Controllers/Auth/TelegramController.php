<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Log in with Telegram (the Telegram Login Widget). Telegram sends the
 * person back here signed with a key derived from the bot's token.
 */
class TelegramController extends Controller
{
    /** How long a Telegram sign-in stays valid, in seconds. */
    private const MAX_AGE = 3600;

    public static function enabled(): bool
    {
        return filled(config('services.telegram.bot_token')) && filled(config('services.telegram.bot_username'));
    }

    public function callback(Request $request): RedirectResponse
    {
        abort_unless(self::enabled(), 404);

        $profile = self::verify($request->query());

        if ($profile === null) {
            return $request->user()
                ? $this->toProfile('error', __('Telegram did not confirm it was you. Please try again.'))
                : $this->fail();
        }

        $telegramId = (int) $profile['id'];
        // Kept fresh on every sign-in, since people change usernames; it is
        // how the admin reaches them on Telegram.
        $username = preg_match('/^[A-Za-z0-9_]{4,64}$/', $profile['username'] ?? '') ? $profile['username'] : null;
        $owner = User::query()->where('telegram_id', $telegramId)->first();

        // Signed in already: this connects Telegram to their account.
        if ($current = $request->user()) {
            if ($owner !== null && ! $owner->is($current)) {
                return $this->toProfile('error', __('This Telegram account is already connected to another account.'));
            }

            $current->forceFill(['telegram_id' => $telegramId, 'telegram_username' => $username])->save();

            return $this->toProfile('success', __('Telegram connected.'));
        }

        $user = $owner ?? User::forceCreate([
            'name' => Str::limit(trim(($profile['first_name'] ?? '').' '.($profile['last_name'] ?? '')) ?: ($profile['username'] ?? 'Telegram'), 255, ''),
            'email' => null,
            'telegram_id' => $telegramId,
            'telegram_username' => $username,
            // They can't use a password without an email; Telegram is their way in.
            'password' => Str::password(32),
        ]);

        if ($user->telegram_username !== $username) {
            $user->forceFill(['telegram_username' => $username])->save();
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

    /**
     * Checks Telegram's signature: an HMAC-SHA256 of the sorted fields,
     * keyed with the SHA-256 of the bot token, and that it is recent.
     *
     * @param  array<array-key, mixed>  $data
     * @return array<string, string>|null
     */
    public static function verify(array $data): ?array
    {
        $hash = $data['hash'] ?? null;
        unset($data['hash']);

        if (! is_string($hash) || $data === []) {
            return null;
        }

        $fields = [];

        foreach ($data as $key => $value) {
            if (! is_string($value)) {
                return null;
            }

            $fields[(string) $key] = $value;
        }

        ksort($fields);
        $check = implode("\n", array_map(fn (string $key, string $value) => "{$key}={$value}", array_keys($fields), $fields));
        $secret = hash('sha256', (string) config('services.telegram.bot_token'), true);

        if (! hash_equals(hash_hmac('sha256', $check, $secret), $hash)) {
            return null;
        }

        $id = $fields['id'] ?? '';
        $age = now()->getTimestamp() - (int) ($fields['auth_date'] ?? 0);

        if (! ctype_digit($id) || $age > self::MAX_AGE || $age < -60) {
            return null;
        }

        return $fields;
    }

    private function toProfile(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return redirect()->route('profile.edit');
    }

    private function fail(): RedirectResponse
    {
        return redirect()->route('login')->with('status', __('Telegram sign-in did not work. Please try again.'));
    }
}
