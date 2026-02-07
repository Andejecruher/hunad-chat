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
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear 2 compañías con todo su ecosistema
        Company::factory(2)
            ->has(User::factory(2))       // usuarios
            ->has(Department::factory(2)) // departamentos
            ->has(Channel::factory(1))    // canales/plataformas
            ->has(Customer::factory(2)   // clientes
                ->has(Conversation::factory(1)
                    ->has(Message::factory(1))
                )
            )
            ->create();

        // Tickets y ventas adicionales
        Ticket::factory(2)
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

        // Generar configuraciones específicas por tipo siguiendo las interfaces TypeScript
        $acces_token_ms = 'EAARPtZC97UEgBQuCIRfZC4ADJbtZC71c2kZCmyOmGDhDBqZCIfuCrSFglmh0YfWINkXCDiMw4TOj3ZC2vZATPdKWczSMf5ZBqYPS1cTxGSzpR2SZAAL5WBQKxn1q0FbKPrCreVeONhl7KTB9qDeiZApZAHO8JxWRiGeSRfkaPeZAhSEHpbV92AJM7jt4ZAfTZBqIdCggZDZD';
        $acces_token_ad = 'EAAUZCR4DiUqcBQgrrfSNEkzGQnJf7j7lo6FgZCuS2uix4hne70fIXYVZBYokIYTKIZCAh59VLo54vFUjzyrW9YyzZBy13aZCZAf9vxuil6zh9o2y9ciZBmm9Y3Mj7qWZAyztzAZAuFhPUJyXi735Ix9ZCPINgJBMuCeDgMdnNwgnYZCe8Tmh8fG04jh59PUPZBpMORQZDZD';

        $config_ms = [
            // Campos compatibles con backend (legacy/service expectations)
            'access_token' => Crypt::encryptString($acces_token_ms),
            'phone_number_id' => '15551691937',
            'whatsapp_business_id' => '1909216603301480',
            'whatsapp_phone_number_id' => '987804451079567',
        ];

        $config_ad = [
            // Campos compatibles con backend (legacy/service expectations)
            'access_token' => Crypt::encryptString($acces_token_ad),
            'phone_number_id' => '15551468932',
            'whatsapp_business_id' => '1272467594757096',
            'whatsapp_phone_number_id' => '1037917856060821',
        ];

        // create Channel for company 1
        Channel::factory()->create([
            'company_id' => 1,
            'name' => 'Mas Servicio WhatsApp Channel',
            'type' => 'whatsapp',
            'status' => 'active',
            'description' => 'Primary WhatsApp channel for company 1',
            'external_id' => Str::uuid(),
            'config' => $config_ms,
        ]);

        Channel::factory()->create([
            'company_id' => 1,
            'name' => 'Andejecruher WhatsApp Channel',
            'type' => 'whatsapp',
            'status' => 'active',
            'description' => 'Primary WhatsApp channel for company 2',
            'external_id' => Str::uuid(),
            'config' => $config_ad,
        ]);

        $this->call([
            ToolSeeder::class,
            AiAgentSeeder::class,
            ToolExecutionSeeder::class,
        ]);
    }
}
