<?php

namespace Database\Seeders;

use App\Models\Channel;
use App\Models\Company;
use App\Models\Conversation;
use App\Models\Customer;
use App\Models\Department;
use App\Models\Message;
use App\Models\Sale;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear 3 compañías con todo su ecosistema
        Company::factory(3)
            ->has(User::factory(50))       // usuarios
            ->has(Department::factory(2)) // departamentos
            ->has(Channel::factory(3))    // canales/plataformas
            ->has(Customer::factory(10)   // clientes
                ->has(Conversation::factory(2)
                    ->has(Message::factory(5))
                )
            )
            ->create();

        // Tickets y ventas adicionales
        Ticket::factory(5)
            ->has(Sale::factory(2))
            ->create();

        // Crar el usuario admin
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'andejecruher@gmail.com',
            'password' => bcrypt('password'), // Cambia esto en producción
            'role' => 'admin',
            'status' => 'active',
            'status_connection' => false,
            'last_connection' => now(),
            'company_id' => 1,
        ]);

        $this->call([
            ToolSeeder::class,
            AiAgentSeeder::class,
            ToolExecutionSeeder::class,
        ]);
    }
}
