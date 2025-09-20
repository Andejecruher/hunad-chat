<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Company, User, Department, Agent, Channel, Customer, Conversation, Message, Ticket, Tool};


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear 3 compañías con todo su ecosistema
        Company::factory(3)
            ->has(User::factory(5))       // usuarios
            ->has(Department::factory(2)) // departamentos
            ->has(Channel::factory(3))    // canales/plataformas
            ->has(Customer::factory(10)   // clientes
            ->has(Conversation::factory(2)
                ->has(Message::factory(5))
            )
            )
            ->has(Tool::factory(2))       // herramientas IA
            ->create();

        // Tickets y ventas adicionales
        Ticket::factory(5)->create();

        // Crar el usuario admin
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'andejecruher@gmail.com',
            'password' => bcrypt('password'), // Cambia esto en producción
            'role' => 'admin',
            'company_id' => 1,
        ]);
    }
}
