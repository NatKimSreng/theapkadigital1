<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelegramSignInTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = '123456:test-bot-token';

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.telegram.bot_token' => self::TOKEN, 'services.telegram.bot_username' => 'theapka_bot']);
    }

    /**
     * What Telegram sends back: the fields, signed as its docs describe.
     *
     * @param  array<string, string>  $fields
     * @return array<string, string>
     */
    private function signed(array $fields = []): array
    {
        $fields = [
            'id' => '987654321',
            'first_name' => 'Dara',
            'last_name' => 'Sok',
            'username' => 'darasok',
            'auth_date' => (string) now()->getTimestamp(),
            ...$fields,
        ];
        ksort($fields);
        $check = collect($fields)->map(fn ($value, $key) => "{$key}={$value}")->implode("\n");
        $fields['hash'] = hash_hmac('sha256', $check, hash('sha256', self::TOKEN, true));

        return $fields;
    }

    public function test_a_new_telegram_user_gets_an_account_without_email()
    {
        $this->get(route('telegram.callback', $this->signed()))
            ->assertRedirect(route('dashboard'));

        $user = User::query()->where('telegram_id', 987654321)->firstOrFail();
        $this->assertSame('Dara Sok', $user->name);
        $this->assertNull($user->email);
        $this->assertAuthenticatedAs($user);
    }

    public function test_a_returning_telegram_user_logs_into_the_same_account()
    {
        $user = User::factory()->create(['telegram_id' => 987654321]);

        $this->get(route('telegram.callback', $this->signed()))->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
        $this->assertSame(1, User::query()->count());
    }

    public function test_a_tampered_or_stale_sign_in_is_refused()
    {
        $tampered = [...$this->signed(), 'id' => '1'];
        $this->get(route('telegram.callback', $tampered))->assertRedirect(route('login'));

        $stale = $this->signed(['auth_date' => (string) now()->subHours(2)->getTimestamp()]);
        $this->get(route('telegram.callback', $stale))->assertRedirect(route('login'));

        $this->assertGuest();
        $this->assertSame(0, User::query()->count());
    }

    public function test_a_signed_in_user_can_connect_telegram()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('telegram.callback', $this->signed()))
            ->assertRedirect(route('profile.edit'));

        $this->assertSame(987654321, $user->refresh()->telegram_id);
    }

    public function test_a_telegram_account_cannot_be_connected_twice()
    {
        User::factory()->create(['telegram_id' => 987654321]);
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('telegram.callback', $this->signed()));

        $this->assertNull($user->refresh()->telegram_id);
    }

    public function test_telegram_users_can_save_their_profile_without_an_email()
    {
        $user = User::factory()->create(['email' => null, 'telegram_id' => 987654321]);

        $this->actingAs($user)
            ->patch(route('profile.update'), ['name' => 'Dara', 'email' => ''])
            ->assertSessionHasNoErrors();

        $this->assertSame('Dara', $user->refresh()->name);
        $this->assertNull($user->email);
    }

    public function test_it_is_off_until_a_bot_is_configured()
    {
        config(['services.telegram.bot_token' => null]);

        $this->get(route('telegram.callback', $this->signed()))->assertNotFound();
    }
}
