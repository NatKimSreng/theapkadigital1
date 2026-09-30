<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class GoogleSignInTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.google.client_id' => 'client-id', 'services.google.client_secret' => 'secret']);
    }

    /**
     * @param  array<string, mixed>  $profile
     */
    private function fakeGoogle(array $profile): void
    {
        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(['access_token' => 'token']),
            'openidconnect.googleapis.com/*' => Http::response([
                'sub' => 'google-123',
                'email' => 'dara@gmail.com',
                'email_verified' => true,
                'name' => 'Dara Sok',
                ...$profile,
            ]),
        ]);
    }

    private function returnFromGoogle(string $state = 'good-state'): TestResponse
    {
        return $this->withSession(['google_oauth_state' => 'good-state'])
            ->get(route('google.callback', ['code' => 'abc', 'state' => $state]));
    }

    public function test_redirects_to_google_with_a_state()
    {
        $response = $this->get(route('google.redirect'));

        $response->assertRedirectContains('accounts.google.com');
        $this->assertNotEmpty(session('google_oauth_state'));
        $this->assertStringContainsString('state='.session('google_oauth_state'), $response->headers->get('Location'));
    }

    public function test_new_google_user_gets_an_account_and_is_signed_in()
    {
        $this->fakeGoogle([]);

        $this->returnFromGoogle()->assertRedirect(route('dashboard'));

        $user = User::sole();
        $this->assertAuthenticatedAs($user);
        $this->assertSame('google-123', $user->google_id);
        $this->assertSame('Dara Sok', $user->name);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_existing_account_with_the_same_email_is_linked()
    {
        $user = User::factory()->create(['email' => 'dara@gmail.com']);
        $this->fakeGoogle([]);

        $this->returnFromGoogle();

        $this->assertAuthenticatedAs($user);
        $this->assertSame('google-123', $user->fresh()->google_id);
        $this->assertSame(1, User::count());
    }

    public function test_a_wrong_state_is_rejected()
    {
        $this->fakeGoogle([]);

        $this->returnFromGoogle('forged')->assertRedirect(route('login'));

        $this->assertGuest();
        Http::assertNothingSent();
    }

    public function test_unverified_google_emails_cannot_sign_in()
    {
        User::factory()->create(['email' => 'dara@gmail.com']);
        $this->fakeGoogle(['email_verified' => false]);

        $this->returnFromGoogle()->assertRedirect(route('login'));

        $this->assertGuest();
    }

    public function test_two_factor_accounts_still_need_their_code()
    {
        User::factory()->create(['email' => 'dara@gmail.com', 'two_factor_confirmed_at' => now()]);
        $this->fakeGoogle([]);

        $this->returnFromGoogle()->assertRedirect(route('two-factor.login'));

        $this->assertGuest();
    }

    public function test_disabled_accounts_cannot_sign_in()
    {
        User::factory()->create(['email' => 'dara@gmail.com', 'disabled_at' => now()]);
        $this->fakeGoogle([]);

        $this->returnFromGoogle()->assertRedirect(route('login'));

        $this->assertGuest();
    }

    public function test_button_is_hidden_and_routes_off_when_not_configured()
    {
        config(['services.google.client_id' => null]);

        $this->get(route('login'))->assertInertia(fn ($page) => $page->where('googleSignIn', false));
        $this->get(route('google.redirect'))->assertNotFound();
    }
}
