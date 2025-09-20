# HunandChat

Este proyecto es una **plataforma omnicanal** que conecta múltiples canales de comunicación (WhatsApp, Instagram, Facebook, Telegram) en un solo lugar. Permite que las compañías publiquen, respondan, envíen mensajes y gestionen la atención al cliente a través de **agentes humanos o agentes de IA**. Además, incluye funcionalidades de tickets, ventas, departamentos y herramientas configurables mediante protocolo **MCP**.

---

## 🚀 Tecnologías utilizadas

* **Backend**: [Laravel 12](https://laravel.com/) (PHP 8+)
* **Frontend**: React + Inertia.js
* **Base de datos**: MySQL 8
* **IA y agentes**: Integración con protocolo MCP
* **Otros**: TailwindCSS, Vite

---

## 📂 Estructura del proyecto

```
project-root/
├── app/                # Lógica de negocio Laravel
├── database/
│   ├── migrations/     # Migraciones definidas
│   ├── seeders/        # Datos iniciales
│   └── factories/      # Generadores de datos falsos
├── resources/
│   ├── js/             # Frontend React + Inertia
│   └── views/          # Plantillas Blade (si aplica)
├── routes/
│   ├── web.php         # Rutas web
│   └── api.php         # Rutas API REST
└── README.md           # Documentación del proyecto
```

---

## 🗄️ Modelo de Datos

La plataforma está diseñada para ser **multitenant** (multiempresa). Cada entidad principal está asociada a una compañía (`company_id`).

* **Companies** → Gestión de empresas
* **Users** → Usuarios internos (admins, agentes, supervisores)
* **Departments** → Organización de agentes
* **Agents** → Humanos o IA, con configuración propia
* **Channels** → Integraciones con WhatsApp, Instagram, Facebook, Telegram
* **Customers** → Clientes de la empresa
* **Conversations** → Conversaciones por canal
* **Messages** → Mensajes enviados y recibidos
* **Tickets** → Seguimiento de casos o incidencias
* **Sales** → Registro de ventas asociadas a clientes
* **Tools** → Herramientas configurables para agentes IA

El detalle completo del diagrama ER y migraciones se encuentra en [`/docs/ER_and_Migrations.md`](./docs/ER_and_Migrations.md).

---

## 🛠️ Migraciones

Para crear las migraciones:

```bash
php artisan migrate
```

Comandos de ejemplo para crear nuevas migraciones:

```bash
php artisan make:migration create_companies_table --create=companies
php artisan make:migration create_users_table --create=users
```

La lista completa de comandos para este proyecto está documentada en [`/docs/migrations_commands.md`](./docs/migrations_commands.md).

---

## 🌱 Seeders y Factories

Se recomienda usar **seeders** para inicializar:

* Empresa de prueba
* Usuario administrador
* Departamentos base
* Canal de ejemplo (WhatsApp sandbox)

Ejecutar:

```bash
php artisan db:seed
```

---

## 👨‍💻 Autor

**Andejecruher** – Full Stack Developer 🚀

---

## 📜 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Puedes usarlo, modificarlo y distribuirlo libremente.
