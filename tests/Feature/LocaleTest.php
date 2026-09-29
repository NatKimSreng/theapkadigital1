<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_server_messages_follow_the_language_cookie()
    {
        $user = User::factory()->create();

        $this->withUnencryptedCookie('locale', 'km')
            ->post(route('login.store'), ['email' => $user->email, 'password' => 'wrong-password'])
            ->assertSessionHasErrors(['email' => 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ។']);
    }

    public function test_english_can_be_chosen()
    {
        $user = User::factory()->create();

        $this->withUnencryptedCookie('locale', 'en')
            ->post(route('login.store'), ['email' => $user->email, 'password' => 'wrong-password'])
            ->assertSessionHasErrors(['email' => 'These credentials do not match our records.']);
    }

    public function test_unknown_languages_fall_back_to_khmer()
    {
        $user = User::factory()->create();

        $this->withUnencryptedCookie('locale', 'xx')
            ->post(route('login.store'), ['email' => $user->email, 'password' => 'wrong-password'])
            ->assertSessionHasErrors(['email' => 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ។']);
    }
}
