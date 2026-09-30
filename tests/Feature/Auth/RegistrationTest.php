<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Features;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::registration());
    }

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_a_simple_six_character_password_is_enough_in_production()
    {
        $this->app['env'] = 'production';

        $this->post(route('register.store'), [
            'name' => 'Dara',
            'email' => 'dara@example.com',
            'password' => 'abc123',
            'password_confirmation' => 'abc123',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', ['email' => 'dara@example.com']);
    }

    public function test_passwords_shorter_than_six_characters_are_rejected()
    {
        $this->post(route('register.store'), [
            'name' => 'Dara',
            'email' => 'dara@example.com',
            'password' => 'abc12',
            'password_confirmation' => 'abc12',
        ])->assertSessionHasErrors('password');

        $this->assertGuest();
    }
}
