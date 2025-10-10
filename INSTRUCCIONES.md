# 📋 Instrucciones de Instalación y Configuración - HunandChat

## 📖 Descripción del Proyecto

**HunandChat** es una plataforma omnicanal que conecta múltiples canales de comunicación (WhatsApp, Instagram, Facebook, Telegram) en un solo lugar. Permite que las compañías publiquen, respondan, envíen mensajes y gestionen la atención al cliente a través de **agentes humanos o agentes de IA**. Incluye funcionalidades de tickets, ventas, departamentos y herramientas configurables mediante protocolo **MCP**.

## 🛠️ Stack Tecnológico

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19 + TypeScript + Inertia.js
- **Base de datos**: SQLite (desarrollo) / MySQL (producción)
- **Estilos**: TailwindCSS 4.0
- **Build Tool**: Vite 7
- **UI Components**: Radix UI + shadcn/ui
- **Iconos**: Lucide React
- **Autenticación**: Laravel Fortify

## 📋 Requisitos Previos

### Sistema Operativo
- Linux (recomendado)
- macOS
- Windows con WSL2

### Software Requerido
- **PHP** >= 8.2 con extensiones:
  - BCMath
  - Ctype
  - cURL
  - DOM
  - Fileinfo
  - JSON
  - Mbstring
  - OpenSSL
  - PCRE
  - PDO
  - Tokenizer
  - XML
- **Composer** >= 2.0
- **Node.js** >= 18.0
- **npm** o **yarn**
- **Git**

### Base de Datos (Opcional para desarrollo)
- **MySQL** >= 8.0 (para producción)
- **SQLite** (incluido, para desarrollo)

## 🚀 Instalación paso a paso

### 1. Clonar el repositorio
```bash
git clone https://github.com/Andejecruher/hunad-chat.git
cd hunad-chat
```

### 2. Instalar dependencias de PHP
```bash
composer install
```

### 3. Instalar dependencias de Node.js
```bash
npm install
```

### 4. Configurar variables de entorno
```bash
# Copiar archivo de configuración
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate
```

### 5. Configurar base de datos en .env
```env
# Para desarrollo con SQLite (por defecto)
DB_CONNECTION=sqlite
DB_DATABASE=/ruta/absoluta/al/proyecto/database/database.sqlite

# Para producción con MySQL
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=hunad_chat
# DB_USERNAME=tu_usuario
# DB_PASSWORD=tu_contraseña
```

### 6. Crear base de datos SQLite (si usas SQLite)
```bash
touch database/database.sqlite
```

### 7. Ejecutar migraciones
```bash
php artisan migrate
```

### 8. Ejecutar seeders (opcional)
```bash
php artisan db:seed
```

### 9. Crear enlace simbólico para storage
```bash
php artisan storage:link
```

## 🏃‍♂️ Ejecutar el proyecto

### Modo Desarrollo
Necesitas ejecutar 2 comandos en terminales separadas:

**Terminal 1 - Servidor Laravel:**
```bash
php artisan serve
```

**Terminal 2 - Build assets (Vite):**
```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:8000`

### Modo Producción
```bash
# Construir assets para producción
npm run build

# Servir con servidor web (Nginx/Apache)
# o usar el servidor de Laravel
php artisan serve --env=production
```

## 🗂️ Estructura del Proyecto

```
hunad-chat/
├── app/
│   ├── Http/Controllers/       # Controladores Laravel
│   ├── Models/                # Modelos Eloquent
│   │   ├── Agent.php          # Agentes (humanos/IA)
│   │   ├── Channel.php        # Canales de comunicación
│   │   ├── Company.php        # Empresas (multitenant)
│   │   ├── Conversation.php   # Conversaciones
│   │   ├── Customer.php       # Clientes
│   │   ├── Department.php     # Departamentos
│   │   ├── Message.php        # Mensajes
│   │   ├── Sale.php           # Ventas
│   │   ├── Ticket.php         # Tickets de soporte
│   │   ├── Tool.php           # Herramientas MCP
│   │   └── User.php           # Usuarios del sistema
│   └── Providers/             # Proveedores de servicios
├── database/
│   ├── factories/             # Factories para testing
│   ├── migrations/            # Migraciones de BD
│   ├── seeders/               # Datos iniciales
│   └── database.sqlite        # BD SQLite (desarrollo)
├── resources/
│   ├── css/
│   │   └── app.css           # Estilos principales
│   ├── js/
│   │   ├── components/       # Componentes React
│   │   │   ├── ui/          # Componentes UI base
│   │   │   └── configurations/
│   │   │       └── Users/   # Gestión de usuarios
│   │   ├── app.tsx          # App principal React
│   │   └── ssr.tsx          # Server-side rendering
│   └── views/               # Vistas Blade (mínimas)
├── routes/
│   ├── web.php              # Rutas web principales
│   ├── auth.php             # Rutas de autenticación
│   └── settings.php         # Rutas de configuración
├── public/                  # Assets públicos
├── storage/                 # Almacenamiento archivos
└── vendor/                  # Dependencias PHP
```

## 🗄️ Modelo de Datos

La aplicación está diseñada como **multitenant**, donde cada empresa tiene sus propios datos aislados:

### Entidades Principales:
- **Companies**: Gestión de empresas
- **Users**: Usuarios internos (admins, managers, agentes)
- **Departments**: Organización por departamentos
- **Agents**: Agentes humanos o IA
- **Channels**: Integraciones (WhatsApp, Instagram, etc.)
- **Customers**: Clientes de cada empresa
- **Conversations**: Conversaciones por canal
- **Messages**: Mensajes enviados/recibidos
- **Tickets**: Sistema de tickets/soporte
- **Sales**: Registro de ventas
- **Tools**: Herramientas configurables (protocolo MCP)

## 🔧 Comandos Útiles

### Laravel Artisan
```bash
# Crear controlador
php artisan make:controller NombreController

# Crear modelo con migración y factory
php artisan make:model NombreModelo -mf

# Crear migración
php artisan make:migration create_tabla_table

# Ejecutar migraciones
php artisan migrate

# Rollback migraciones
php artisan migrate:rollback

# Refrescar migraciones con seeders
php artisan migrate:refresh --seed

# Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

### NPM Scripts
```bash
# Desarrollo (watch mode)
npm run dev

# Build para producción
npm run build

# Build con SSR
npm run build:ssr

# Linter
npm run lint

# Formatear código
npm run format

# Verificar formato
npm run format:check

# Verificar tipos TypeScript
npm run types
```

### Git Workflow
```bash
# Crear nueva rama
git checkout -b feature/nombre-feature

# Agregar cambios
git add .
git commit -m "feat: descripción del cambio"

# Push rama
git push origin feature/nombre-feature
```

## 🎨 Desarrollo Frontend

### Estructura de Componentes
```
resources/js/components/
├── ui/                      # Componentes base (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── configurations/          # Configuraciones
│   ├── Users/
│   │   └── users.tsx       # Gestión de usuarios
│   └── ...
└── layouts/                # Layouts principales
```

### Agregar Nuevos Componentes UI
```bash
# Ejemplo: agregar componente tabla
npx shadcn-ui@latest add table
```

### Convenciones de Código
- **Componentes**: PascalCase (`UserCard.tsx`)
- **Archivos**: kebab-case (`user-settings.tsx`)
- **Props**: camelCase
- **CSS**: Utilizar clases de Tailwind
- **Estados**: usar hooks de React

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests PHP (PHPUnit)
php artisan test

# Tests específicos
php artisan test --filter NombreTest

# Con coverage
php artisan test --coverage
```

### Crear Tests
```bash
# Test unitario
php artisan make:test UserTest --unit

# Test de feature
php artisan make:test UserManagementTest
```

## 🚀 Despliegue

### Preparación para Producción
1. **Configurar variables de entorno de producción**
2. **Construir assets:**
   ```bash
   npm run build
   ```
3. **Optimizar autoload:**
   ```bash
   composer install --optimize-autoloader --no-dev
   ```
4. **Optimizar configuración:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
5. **Ejecutar migraciones:**
   ```bash
   php artisan migrate --force
   ```

### Variables de Entorno Importantes
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com

# Base de datos
DB_CONNECTION=mysql
DB_HOST=tu-host
DB_DATABASE=tu-bd
DB_USERNAME=tu-usuario
DB_PASSWORD=tu-contraseña

# Cache
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Mail
MAIL_MAILER=smtp
MAIL_HOST=tu-smtp
MAIL_PORT=587
MAIL_USERNAME=tu-email
MAIL_PASSWORD=tu-contraseña
```

## 🔒 Seguridad

### Mejores Prácticas
- Nunca commitear `.env` al repositorio
- Usar HTTPS en producción
- Configurar CORS apropiadamente
- Validar todas las entradas de usuario
- Usar middleware de autenticación en rutas protegidas
- Mantener dependencias actualizadas

### Comandos de Seguridad
```bash
# Actualizar dependencias
composer update
npm update

# Auditoría de seguridad
npm audit
npm audit fix
```

## 📚 Recursos Adicionales

### Documentación Oficial
- [Laravel](https://laravel.com/docs)
- [React](https://react.dev/)
- [Inertia.js](https://inertiajs.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

### Componentes UI
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

## 🐛 Solución de Problemas

### Problemas Comunes

**Error: "Class not found"**
```bash
composer dump-autoload
```

**Error: "Mix manifest not found"**
```bash
npm run dev
# o
npm run build
```

**Error de permisos en storage/**
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

**Error de migración**
```bash
php artisan migrate:reset
php artisan migrate
```

### Logs
```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log

# Limpiar logs
echo "" > storage/logs/laravel.log
```

## 🤝 Contribución

### Workflow de Contribución
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Convenciones de Commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Documentación
- `style:` Formato, sin cambios de código
- `refactor:` Refactorización de código
- `test:` Agregar tests
- `chore:` Mantenimiento

---

## 👨‍💻 Autor

**Andejecruher** - Full Stack Developer

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

**¡Feliz desarrollo! 🚀**
