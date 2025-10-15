<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UserInvitationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    #[Test]
    public function authenticated_user_can_invite_new_user()
    {
        $company = Company::factory()->create();
        $admin = User::factory()->create([
            'company_id' => $company->id,
            'role' => 'admin'
        ]);

        $this->actingAs($admin);

        // Agrega el header 'Accept: application/json' para evitar redirección
        $response = $this->postJson('/configurations/users', [
            'name' => 'Juan Pérez',
            'email' => 'newuser@example.com',
            'role' => 'agent'
        ], [
            'Accept' => 'application/json'
        ]);


        $response->assertStatus(201);
        $response->assertJson([
            'message' => 'Usuario invitado exitosamente'
        ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Juan Pérez',
            'email' => 'newuser@example.com',
            'role' => 'agent',
            'company_id' => $company->id,
            'email_verified_at' => null
        ]);

        Mail::assertSent(\Illuminate\Mail\Mailable::class);
    }

    #[Test]
    public function invitation_fails_with_missing_name()
    {
        $company = Company::factory()->create();
        $admin = User::factory()->create([
            'company_id' => $company->id,
            'role' => 'admin'
        ]);

        $this->actingAs($admin);

        $response = $this->postJson('/configurations/users', [
            'email' => 'andejecruher@gmail.com',
            'role' => 'agent'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    #[Test]
    public function invitation_fails_with_duplicate_email()
    {
        $company = Company::factory()->create();
        $admin = User::factory()->create([
            'company_id' => $company->id,
            'role' => 'admin'
        ]);

        User::factory()->create([
            'email' => 'existing@example.com',
            'company_id' => $company->id
        ]);

        $this->actingAs($admin);

        $response = $this->postJson('/configurations/users', [
            'name' => 'Juan Pérez',
            'email' => 'existing@example.com',
            'role' => 'agent'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function invitation_fails_with_invalid_role()
    {
        $company = Company::factory()->create();
        $admin = User::factory()->create([
            'company_id' => $company->id,
            'role' => 'admin'
        ]);

        $this->actingAs($admin);

        $response = $this->postJson('/configurations/users', [
            'name' => 'Juan Pérez',
            'email' => 'newuser@example.com',
            'role' => 'invalid_role'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['role']);
    }

    #[Test]
    public function invitation_fails_with_invalid_email()
    {
        $company = Company::factory()->create();
        $admin = User::factory()->create([
            'company_id' => $company->id,
            'role' => 'admin'
        ]);

        $this->actingAs($admin);

        $response = $this->postJson('/configurations/users', [
            'name' => 'Juan Pérez',
            'email' => 'invalid-email',
            'role' => 'agent'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function unauthenticated_user_cannot_invite_users()
    {
        $response = $this->postJson('/configurations/users', [
            'name' => 'Juan Pérez',
            'email' => 'newuser@example.com',
            'role' => 'agent'
        ]);

        $response->assertStatus(401);
    }
}
