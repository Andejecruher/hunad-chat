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

## � Tiempo real con Laravel Reverb + Echo

Para habilitar la mensajería en tiempo real debes completar la siguiente configuración:

1. **Variables de entorno**
   * Define `BROADCAST_CONNECTION=reverb` en tu `.env`.
   * Completa las claves `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`, `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME` y los parámetros del servidor (`REVERB_SERVER_HOST`, `REVERB_SERVER_PORT`, `REVERB_SERVER_PATH`). Consulta el archivo `.env.example` para un esquema actualizado @.env.example#47-106.
   * Expón las mismas variables para Vite (`VITE_REVERB_*`) a fin de que el frontend pueda consumirlas @resources/js/app.tsx#9-33.

2. **Eventos y canales**
   * Los eventos que implementan `ShouldBroadcast` (por ejemplo `MessageReceived`) se publican en los canales privados `company.{companyId}` y `conversation.{conversationId}` @app/Events/MessageReceived.php#20-98.
   * Verifica la autorización en `routes/channels.php` para que los usuarios puedan suscribirse correctamente @routes/channels.php#11-29.

3. **Arranque de servicios**

   ```bash
   # Inicia el servidor Reverb
   php artisan reverb:start

   # Lanza el worker de colas si los eventos se despachan de manera asíncrona
   php artisan queue:work

   # Compila assets y arranca Vite/React
    npm run dev
   ```

4. **Frontend**
   * El archivo `resources/js/app.tsx` inicializa `configureEcho` con el broadcaster `reverb` usando las variables de entorno expuestas para Vite; esto crea `window.Echo` para toda la aplicación @resources/js/app.tsx#1-42.
   * El hook `useConversationRealtime` escucha el evento `message.received` en `conversation.{conversationId}` y maneja la normalización del payload @resources/js/hooks/use-conversation-realtime.ts#42-97.

5. **Pruebas locales**
   * Arranca la aplicación (`php artisan serve`) y envía un mensaje que dispare el evento `MessageReceived`.
   * Abre la consola del navegador y confirma que `window.Echo` está definido y que el hook recibe el evento (`useConversationRealtime` registra en consola al suscribirse).
   * Si la conexión falla, revisa los logs de Laravel y la pestaña Network → WS para validar handshakes y autenticación del canal privado.

---

## �👨‍💻 Autor

**Andejecruher** – Full Stack Developer 🚀

---

## 📜 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Puedes usarlo, modificarlo y distribuirlo libremente.
