<?php

namespace Tests\Feature;

use App\Events\UserDeleted;
use App\Events\UserUpdated;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function admin_can_update_user_in_same_company()
    {
        Event::fake();

        $company = Company::factory()->create();
        $admin = User::factory()->create(['company_id' => $company->id, 'role' => 'admin']);
        $user = User::factory()->create(['company_id' => $company->id, 'role' => 'agent']);

        $this->actingAs($admin);

        $response = $this->patchJson("/configurations/users/{$user->id}", [
            'name' => 'Nombre Actualizado',
            'email' => 'updated-email@example.com',
            'role' => 'agent'
        ], ['Accept' => 'application/json']);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Nombre Actualizado',
            'email' => 'updated-email@example.com',
        ]);

        Event::assertDispatched(UserUpdated::class);
    }

    #[Test]
    public function admin_can_delete_user_in_same_company()
    {
        Event::fake();

        $company = Company::factory()->create();
        $admin = User::factory()->create(['company_id' => $company->id, 'role' => 'admin']);
        $user = User::factory()->create(['company_id' => $company->id, 'role' => 'agent']);

        $this->actingAs($admin);

        $response = $this->deleteJson("/configurations/users/{$user->id}", [], ['Accept' => 'application/json']);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
        ]);

        Event::assertDispatched(UserDeleted::class);
    }

    #[Test]
    public function cannot_update_user_from_different_company()
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();

        $admin = User::factory()->create(['company_id' => $companyA->id, 'role' => 'admin']);
        $user = User::factory()->create(['company_id' => $companyB->id, 'role' => 'agent']);

        $this->actingAs($admin);

        $response = $this->patchJson("/configurations/users/{$user->id}", [
            'name' => 'No permitido'
        ], ['Accept' => 'application/json']);

        $response->assertStatus(403);
    }

    #[Test]
    public function cannot_delete_own_user()
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id, 'role' => 'agent']);

        $this->actingAs($user);

        $response = $this->deleteJson("/configurations/users/{$user->id}", [], ['Accept' => 'application/json']);

        $response->assertStatus(403);
    }

    #[Test]
    public function update_fails_with_duplicate_email()
    {
        $company = Company::factory()->create();
        $admin = User::factory()->create(['company_id' => $company->id, 'role' => 'admin']);
        $user1 = User::factory()->create(['company_id' => $company->id, 'email' => 'user1@example.com']);
        $user2 = User::factory()->create(['company_id' => $company->id, 'email' => 'user2@example.com']);

        $this->actingAs($admin);

        $response = $this->patchJson("/configurations/users/{$user1->id}", [
            'email' => 'user2@example.com'
        ], ['Accept' => 'application/json']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function can_update_password()
    {
        $company = Company::factory()->create();
        $admin = User::factory()->create(['company_id' => $company->id, 'role' => 'admin']);
        $user = User::factory()->create(['company_id' => $company->id, 'password' => Hash::make('oldpassword')]);

        $this->actingAs($admin);

        $response = $this->patchJson("/configurations/users/{$user->id}", [
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ], ['Accept' => 'application/json']);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));
    }

    #[Test]
    public function update_fails_with_invalid_role()
    {
        $company = Company::factory()->create();
        $admin = User::factory()->create(['company_id' => $company->id, 'role' => 'admin']);
        $user = User::factory()->create(['company_id' => $company->id]);

        $this->actingAs($admin);

        $response = $this->patchJson("/configurations/users/{$user->id}", [
            'role' => 'invalid-role'
        ], ['Accept' => 'application/json']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['role']);
    }

    #[Test]
    public function update_user_returns_fresh_data()
    {
        Event::fake();

        $company = Company::factory()->create();
        $admin = User::factory()->create(['company_id' => $company->id, 'role' => 'admin']);
        $user = User::factory()->create(['company_id' => $company->id, 'name' => 'Old Name']);

        $this->actingAs($admin);

        $response = $this->patchJson("/configurations/users/{$user->id}", [
            'name' => 'New Name'
        ], ['Accept' => 'application/json']);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Usuario actualizado correctamente',
            'user' => [
                'id' => $user->id,
                'name' => 'New Name'
            ]
        ]);
    }

    #[Test]
    public function cannot_delete_user_from_different_company()
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();

        $admin = User::factory()->create(['company_id' => $companyA->id, 'role' => 'admin']);
        $user = User::factory()->create(['company_id' => $companyB->id]);

        $this->actingAs($admin);

        $response = $this->deleteJson("/configurations/users/{$user->id}", [], ['Accept' => 'application/json']);

        $response->assertStatus(403);
    }

    #[Test]
    public function unauthenticated_user_cannot_update_user()
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);

        $response = $this->patchJson("/configurations/users/{$user->id}", [
            'name' => 'Hacker'
        ], ['Accept' => 'application/json']);

        $response->assertStatus(401);
    }

    #[Test]
    public function unauthenticated_user_cannot_delete_user()
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);

        $response = $this->deleteJson("/configurations/users/{$user->id}", [], ['Accept' => 'application/json']);

        $response->assertStatus(401);
    }
}
