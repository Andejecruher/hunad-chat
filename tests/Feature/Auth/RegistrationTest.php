<?php

namespace Tests\Feature\Auth;

use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertStatus(200);
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'company_name' => 'Test Company',
            'company_slug' => 'test-company',
            'subscription_type' => 'free',
            'user_name' => 'Test User',
            'user_email' => 'test@example.com',
            'user_password' => 'password',
            'user_password_confirmation' => 'password',
            'branding_default_theme' => 'light',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
