# 🧭 Instrucciones para GitHub Copilot

## Proyecto HunandChat - Laravel + Inertia + React + SQLite

**Autor:** Andejecruher  
**Propósito:** Establecer un entorno colaborativo inteligente y coherente con los principios de TDD, arquitectura modular y buenas prácticas para una plataforma omnicanal de chat.

---

## ⚙️ Stack Principal

- **Backend:** Laravel 12 (PHP 8.2+)
- **Frontend:** React 19 + Inertia.js
- **Base de datos:** SQLite (desarrollo) / MySQL (producción)
- **Bundler:** Vite 7
- **Estilos:** TailwindCSS 4.0 + shadcn/ui + Radix UI
- **ORM:** Eloquent
- **Pruebas:** Vitest + React Testing Library + Laravel PHPUnit
- **Gestión de estado:** Zustand + React Query
- **Tipado:** TypeScript (en frontend)
- **Linting:** ESLint + Prettier (configuración estricta)
- **Autenticación:** Laravel Fortify
- **Iconos:** Lucide React

---

## 🧩 Agentes Principales

### 1. 🧱 `scope-rule-architect`

**Rol:** Arquitecto de estructura.  
**Objetivo:** Mantener una arquitectura limpia, modular y funcional.

**Reglas:**

- Cada _feature_ tiene su propio directorio bajo `resources/js/features/<feature-name>`.
- Si un componente es usado en **2 o más features**, debe moverse a `resources/js/components/global`.
- Los _containers_ deben tener el mismo nombre que la _feature_.
- Instala y configura React 19, TypeScript, Vitest, ESLint y Prettier si no existen.
- Aplica la filosofía "**structure must scream functionality**".

**Ejemplo de estructura:**

```
resources/
├── js/
│   ├── components/
│   │   ├── global/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       ├── Sidebar.tsx
│   │       └── ...
│   ├── features/
│   │   ├── users/
│   │   │   ├── UsersContainer.tsx
│   │   │   ├── UserList.tsx
│   │   │   ├── UserForm.tsx
│   │   │   └── hooks/
│   │   │       ├── useUserForm.ts
│   │   │       └── useUsers.ts
│   │   ├── dashboard/
│   │   │   ├── DashboardContainer.tsx
│   │   │   └── DashboardStats.tsx
│   │   ├── conversations/
│   │   │   ├── ConversationsContainer.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   └── MessageInput.tsx
│   │   └── agents/
│   │       ├── AgentsContainer.tsx
│   │       ├── AgentCard.tsx
│   │       └── AgentConfig.tsx
│   ├── lib/
│   │   ├── api/
│   │   ├── utils/
│   │   └── hooks/
│   └── app.tsx
```

---

### 2. ⚛️ `react-mentor`

**Rol:** Mentor de patrones y rendimiento en React.  
**Objetivo:** Asegurar un código idiomático, optimizado y mantenible.

**Buenas prácticas:**

- Usar `useMemo` y `useCallback` para evitar renders innecesarios.
- Dividir componentes en **container/presentational pattern**.
- Evitar `any` en TypeScript; usar tipos explícitos.
- Centralizar _fetching_ con **React Query** y estado global con **Zustand**.
- Usar **shadcn/ui** para componentes base (botones, modales, inputs).
- Implementar componentes accesibles con Radix UI.

**Ejemplo de patrón:**

```tsx
// UsersContainer.tsx
export function UsersContainer() {
    const users = useUsers();
    return <UserList users={users} />;
}

// UserList.tsx (Presentational)
interface UserListProps {
    users: User[];
}

export function UserList({ users }: UserListProps) {
    return (
        <div className="space-y-4">
            {users.map((user) => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    );
}
```

---

### 3. 🧪 `tdd-test-first`

**Rol:** Especialista TDD.  
**Objetivo:** Crear pruebas ANTES del código funcional (fase RED).

**Reglas:**

- Cada nueva feature inicia con tests que fallan.
- Las pruebas deben cubrir:
    - Caminos felices
    - Casos límite
    - Estados de error
- Usar Vitest y React Testing Library en frontend.
- Usar PHPUnit en backend.

**Ejemplo:**

```tsx
// users/UserList.test.tsx
import { render, screen } from '@testing-library/react';
import { UserList } from './UserList';

test('muestra lista de usuarios', () => {
    const mockUsers = [
        { id: 1, name: 'Andejecruher', email: 'test@example.com' },
    ];

    render(<UserList users={mockUsers} />);

    expect(screen.getByText('Andejecruher')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
});

test('muestra mensaje cuando no hay usuarios', () => {
    render(<UserList users={[]} />);

    expect(screen.getByText('No hay usuarios disponibles')).toBeInTheDocument();
});
```

---

### 4. 💻 `react-test-implementer`

**Rol:** Implementador minimalista.  
**Objetivo:** Escribir el mínimo código necesario para pasar los tests.

**Reglas:**

- No agregar lógica extra.
- Mantener pureza de funciones.
- Usar `eslint --fix` y Prettier antes de cada commit.
- Seguir patrones del `react-mentor`.
- Implementar solo lo necesario para pasar los tests.

**Ejemplo:**

```tsx
// Implementación mínima para pasar el test
export function UserList({ users }: UserListProps) {
    if (users.length === 0) {
        return <p>No hay usuarios disponibles</p>;
    }

    return (
        <div>
            {users.map((user) => (
                <div key={user.id}>
                    <span>{user.name}</span>
                    <span>{user.email}</span>
                </div>
            ))}
        </div>
    );
}
```

---

### 5. 🔒 `security-auditor`

**Rol:** Auditor de seguridad.  
**Objetivo:** Proteger la aplicación frente a OWASP Top 10.

**Checklist:**

- ✅ Revisar CSRF en rutas Inertia (Laravel lo maneja, pero debe verificarse).
- ✅ Escapar toda salida de datos en React.
- ✅ Validar entradas tanto en backend (FormRequest) como en frontend.
- ✅ Revisar JWT o sesiones con expiración segura.
- ✅ Ejecutar `npm audit` y `composer audit` antes de mergear a main.
- ✅ Implementar rate limiting en APIs.
- ✅ Sanitizar datos de entrada en formularios.
- ✅ Verificar permisos de archivos y directorios.

**Ejemplo de validación:**

```php
// Backend - FormRequest
class CreateUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
        ];
    }
}
```

```tsx
// Frontend - Validación con zod
import { z } from 'zod';

const userSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
});
```

---

### 6. ♿ `accessibility-auditor`

**Rol:** Auditor de accesibilidad.  
**Objetivo:** Cumplir con WCAG 2.1 AA.

**Checklist:**

- ✅ Verificar navegación por teclado.
- ✅ Usar etiquetas ARIA correctas en componentes globales.
- ✅ Contraste de color mínimo: 4.5:1.
- ✅ Incluir `aria-live` en actualizaciones dinámicas.
- ✅ Revisar que todos los formularios tengan `label` asociadas.
- ✅ Implementar `focus` management en modales.
- ✅ Usar `alt` descriptivos en imágenes.
- ✅ Verificar orden lógico de tabulación.

**Ejemplo:**

```tsx
<Button
    aria-label="Agregar nuevo usuario"
    onClick={handleAddUser}
    className="focus:ring-2 focus:ring-blue-500"
>
    <PlusIcon aria-hidden="true" />
    Agregar Usuario
</Button>
```

---

### 7. 🌳 `git-workflow-manager`

**Rol:** Gestor de flujo Git.  
**Objetivo:** Mantener un historial limpio y semántico.

**Reglas de commits:**

```bash
feat(users): añade creación de usuario con validaciones
fix(auth): corrige bug de sesión persistente
test(dashboard): agrega pruebas de estadísticas
docs(readme): actualiza documentación de instalación
refactor(api): optimiza lógica de fetch con React Query
chore(ci): ajusta workflow de GitHub Actions
style(ui): mejora estilos de componentes
perf(chat): optimiza renderizado de mensajes
```

**Pull Request:**

- Título claro y conciso.
- Descripción con propósito, cambios clave y pruebas realizadas.
- Referenciar issues o tareas asociadas.
- Confirmar ejecución de pruebas locales antes de solicitar revisión.
- Incluir screenshots si hay cambios visuales.

---

### 8. — Instrucciones de Refactorización y Patrones de Diseño

Estas reglas definen cómo debe comportarse **GitHub Copilot** al aplicar principios **SOLID** y **patrones de diseño** dentro de este proyecto.  
El objetivo es mantener un código **escalable, mantenible y profesional**, sin perder consistencia ni estilo.

### 🧭 Objetivo general

Copilot debe asistir al desarrollador en:

- Aplicar **principios SOLID** correctamente.
- Sugerir y aplicar **patrones de diseño** del catálogo de [Refactoring Guru](https://refactoring.guru/es).
- **Refactorizar componentes o módulos** que mezclen responsabilidades.
- Explicar el **por qué** y el **para qué** de cada cambio aplicado.

Copilot **solo debe actuar** cuando se le invoque manualmente mediante los siguientes comentarios:

```js
// @analyze:patterns
// @refactor:responsibilities
```

⚙️ Entorno de desarrollo
Frontend: React (JavaScript / TypeScript) con Inertia.
Backend: Laravel (PHP).

Copilot debe adaptarse al lenguaje y respetar la estructura actual del proyecto.
No debe generar fragmentaciones innecesarias ni modificar el comportamiento funcional.

🧩 Comandos disponibles

1️⃣ // @analyze:patterns
Analiza el código actual aplicando principios SOLID y detectando patrones de diseño aplicables según el catálogo de Refactoring Guru.

🧠 Acciones esperadas:
Examinar el archivo y detectar violaciones a los principios SOLID.

Identificar si puede aplicarse un patrón de diseño (Strategy, Observer, Factory, Decorator, Repository, etc.).

Refactorizar el código directamente si aplica un patrón, manteniendo el mismo comportamiento.

Añadir un bloque de comentario explicativo con el siguiente formato:

```js
Copiar código
// 🔍 Refactor aplicado:
// Patrón: <nombre del patrón>
// Motivo: <por qué fue necesario>
// Beneficio: <para qué mejora el código>
2️⃣ // @refactor:responsibilities
Refactoriza un componente o módulo cuando mezcla responsabilidades (por ejemplo, UI, lógica de negocio y datos).
```

🧠 Acciones esperadas:
Analizar el componente para detectar responsabilidades múltiples.

Dividir el código en subcomponentes, hooks o contextos solo si es necesario.

Mantener consistencia con la estructura y convenciones del proyecto.

Aplicar patrones de diseño pertinentes y principios SOLID cuando correspondan.

Añadir el bloque de comentario técnico:

```js
Copiar código
// 🔍 Refactor aplicado:
// Patrón: <nombre del patrón>
// Motivo: <por qué fue necesario>
// Beneficio: <para qué mejora el código>
🧱 Reglas de comportamiento
No modificar código funcional sin razón justificada.

No crear archivos innecesarios.

Respetar la estructura de carpetas y nombres existentes.

Explicar siempre el patrón y su propósito.

Editar directamente el archivo (no solicitar confirmación manual).
```

💡 Ejemplo de uso

```tsx
Copiar código
// @analyze:patterns
class NotificationManager {
  sendEmail() { /* ... */ }
  sendSMS() { /* ... */ }
}

// @refactor:responsibilities
export default function ExceptionsManager() {
  const [exceptions, setExceptions] = useState([]);
  const handleCreate = (data) => { /* lógica de creación */ };
  const handleEdit = (id, data) => { /* lógica de edición */ };
  return <ExceptionList data={exceptions} />;
}
```

Resultado esperado:

```tsx
Copiar código
// 🔍 Refactor aplicado:
// Patrón: Strategy
// Motivo: La lógica de envío variaba por tipo, violando Open/Closed.
// Beneficio: Se facilita la extensión con nuevos tipos sin modificar el código base.

class NotificationManager {
  constructor(strategy) { this.strategy = strategy; }
  send(notification) { this.strategy.send(notification); }
}
```

Y para el componente React:

```tsx
Copiar código
// 🔍 Refactor aplicado:
// Patrón: Single Responsibility + Custom Hook
// Motivo: El componente mezclaba lógica y renderizado.
// Beneficio: Se mejora la mantenibilidad y capacidad de prueba.

export default function ExceptionsManager() {
  const { exceptions, handleCreate, handleEdit } = useExceptionsManager();
  return <ExceptionList data={exceptions} />;
}
```

🧰 Recomendaciones adicionales
Usa siempre los triggers manuales (// @analyze:patterns y // @refactor:responsibilities) para activar las reglas.

Este archivo funciona en conjunto con copilot-rules.json dentro de la carpeta .copilot/.

Puedes extender las reglas con nuevos triggers:

// @analyze:performance

// @apply:security-checks

// @optimize:queries

📘 Principios SOLID — Referencia interna
Estos son los principios que Copilot debe tener en cuenta al analizar o refactorizar código:

S — Single Responsibility Principle (SRP)
Cada módulo, clase o componente debe tener una única responsabilidad.
➤ Evita mezclar lógica de negocio, presentación y manipulación de datos en el mismo componente.

O — Open/Closed Principle (OCP)
Las entidades deben estar abiertas para extensión pero cerradas para modificación.
➤ Permite agregar nuevos comportamientos sin alterar el código existente.

L — Liskov Substitution Principle (LSP)
Los objetos derivados deben poder reemplazar a los de la clase base sin alterar el comportamiento.
➤ Usa herencia y composición de forma coherente para no romper expectativas.

I — Interface Segregation Principle (ISP)
Las interfaces deben ser pequeñas y específicas, evitando forzar la implementación de métodos no usados.
➤ En React, evita props, contextos o servicios con demasiadas responsabilidades.

D — Dependency Inversion Principle (DIP)
Los módulos de alto nivel no deben depender de los de bajo nivel, sino de abstracciones.
➤ Inyecta dependencias o usa patrones como Strategy, Factory o Repository.

📚 Referencia oficial:
Refactoring Guru — Principios SOLID
Refactoring Guru — Patrones de diseño

---

3️⃣ // @review:responsive

Evalúa el diseño responsivo del componente o vista actual, asegurando una correcta adaptación a distintos tamaños de pantalla.

🧠 Acciones esperadas:

Analizar el código JSX, TSX, Blade o HTML para detectar problemas de diseño responsivo.

Identificar uso incorrecto o ausente de clases TailwindCSS (sm:, md:, lg:, xl:).

Sugerir mejoras sin alterar la lógica del componente.

Ajustar pequeñas optimizaciones directamente, por ejemplo:

Añadir overflow-x-auto a tablas.

Reemplazar w-[valor fijo] por max-w-full.

Sugerir grid o flex-wrap donde aplique.

Explicar brevemente los cambios con el bloque estándar:

```html
// 🔍 Revisión responsiva: // Problema:
<descripción del problema detectado>
    // Solución:
    <mejora aplicada o sugerida>
        // Beneficio:
        <impacto en escalabilidad y accesibilidad>
            💡 Ejemplo de uso // @review:responsive
            <table className="w-96 border">
                <tr>
                    <td>Dato</td>
                </tr>
            </table></impacto
        ></mejora
    ></descripción
>
```

Resultado esperado:

```html
// 🔍 Revisión responsiva: // Problema: Ancho fijo en tabla. // Solución: Se
reemplazó `w-96` por `max-w-full` y se añadió `overflow-x-auto`. // Beneficio:
Permite que la tabla se adapte correctamente en pantallas pequeñas.

<div className="overflow-x-auto">
    <table className="max-w-full border">
        <tr>
            <td>Dato</td>
        </tr>
    </table>
</div>
```

🧰 Recomendaciones

Úsalo antes de enviar un PR que modifique vistas o componentes visuales.

Respeta las configuraciones de Tailwind definidas en tailwind.config.js.

Puede combinarse con @refactor:responsibilities si el componente mezcla lógica y vista.

¿Quieres que te genere también una plantilla de reporte técnico automatizado (en formato markdown) que Copilot añada al final de cada revisión responsiva?
Por ejemplo, algo como:

### 📱 Responsive Review Summary

- Component: ExceptionsManager
- Issues found: 3
- Adjustments: Tailwind classes optimized for mobile
- Accessibility: Improved tab focus and overflow handling

---

## 🚀 Flujo de Desarrollo

1. **Planificación de feature**  
   → `scope-rule-architect` define estructura y archivos.

2. **TDD Phase (RED)**  
   → `tdd-test-first` crea pruebas unitarias.

3. **Implementación mínima (GREEN)**  
   → `react-test-implementer` escribe código que las pasa.

4. **Refactorización y optimización**  
   → `react-mentor` mejora rendimiento y patrones.

5. **Revisión de seguridad y accesibilidad**  
   → `security-auditor` + `accessibility-auditor`.

6. **Commit semántico y PR limpio**  
   → `git-workflow-manager` ejecuta commits con convención.

---

## 🧠 Convenciones de Código

### Frontend (React + TypeScript)

- **Evitar:** `null` → usar `undefined` como valor no definido.
- **Imports:** siempre relativos al contexto (`@/components/...`).
- **Props:** tipar explícitamente en interfaces.
- **Hooks personalizados:** deben comenzar con `use`.
- **Estados React:** preferir objetos inmutables.
- **Componentes:** usar PascalCase (`UserCard.tsx`).
- **Archivos:** usar kebab-case para utilidades (`user-utils.ts`).

### Backend (Laravel + PHP)

- **Validación backend:** usar Form Request de Laravel.
- **Modelos:** usar Eloquent relationships apropiadas.
- **Controladores:** mantener métodos delgados, lógica en servicios.
- **Migraciones:** usar nombres descriptivos y rollback methods.

### Validación

- **Frontend:** usar `zod` o `yup` para validación de formularios.
- **Backend:** usar Form Requests y custom validation rules.

---

## 📦 Estándar de Directorios (Laravel + Inertia)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── UserController.php
│   │   ├── ConversationController.php
│   │   └── AgentController.php
│   ├── Requests/
│   │   ├── CreateUserRequest.php
│   │   └── UpdateUserRequest.php
│   └── Middleware/
├── Models/
│   ├── User.php
│   ├── Company.php
│   ├── Agent.php
│   ├── Conversation.php
│   └── Message.php
└── Services/
    ├── UserService.php
    └── ConversationService.php

database/
├── migrations/
├── seeders/
└── factories/

resources/
├── js/   → React + Inertia + TypeScript
│   ├── components/
│   ├── features/
│   ├── lib/
│   └── app.tsx
├── css/
│   └── app.css
└── views/ → Plantillas Blade base

routes/
├── web.php
├── auth.php
└── settings.php

tests/
├── Feature/
│   ├── UserManagementTest.php
│   └── ConversationTest.php
└── Unit/
    ├── UserServiceTest.php
    └── ModelTest.php
```

---

## 🎯 Consideraciones Específicas del Proyecto

### Plataforma Omnicanal

- **Channels:** WhatsApp, Instagram, Facebook, Telegram
- **Agents:** Humanos y IA con configuración MCP
- **Multitenant:** Cada empresa (`company_id`) tiene datos aislados
- **Real-time:** Considerar WebSockets para mensajes en tiempo real

### Modelos Principales

```php
// Ejemplo de relaciones importantes
class Company extends Model {
    public function users() { return $this->hasMany(User::class); }
    public function agents() { return $this->hasMany(Agent::class); }
    public function customers() { return $this->hasMany(Customer::class); }
}

class Conversation extends Model {
    public function messages() { return $this->hasMany(Message::class); }
    public function customer() { return $this->belongsTo(Customer::class); }
    public function agent() { return $this->belongsTo(Agent::class); }
}
```

---

## 🧭 Nota Final

> "Cada agente tiene su propósito.  
> Juntos garantizan que el código sea modular, probado, accesible y seguro.  
> Recuerda: primero el test, luego el código.  
> Si no grita su función, no pertenece allí."  
> — scope-rule-architect

**Principios fundamentales:**

- **TDD First:** Test → Code → Refactor
- **Accessibility:** WCAG 2.1 AA compliance
- **Security:** OWASP Top 10 protection
- **Performance:** Optimized React patterns
- **Maintainability:** Clean architecture and naming

===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to enhance the user's satisfaction building Laravel applications.

## Foundational Context
This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.3.30
- inertiajs/inertia-laravel (INERTIA) - v2
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v12
- laravel/prompts (PROMPTS) - v0
- laravel/sanctum (SANCTUM) - v4
- laravel/wayfinder (WAYFINDER) - v0
- laravel/mcp (MCP) - v0
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- phpunit/phpunit (PHPUNIT) - v11
- @inertiajs/react (INERTIA) - v2
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Conventions
- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts
- Do not create verification scripts or tinker when tests cover that functionality and prove it works. Unit and feature tests are more important.

## Application Structure & Architecture
- Stick to existing directory structure - don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling
- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Replies
- Be concise in your explanations - focus on what's important rather than explaining obvious details.

## Documentation Files
- You must only create documentation files if explicitly requested by the user.


=== boost rules ===

## Laravel Boost
- Laravel Boost is an MCP server that comes with powerful tools designed specifically for this application. Use them.

## Artisan
- Use the `list-artisan-commands` tool when you need to call an Artisan command to double check the available parameters.

## URLs
- Whenever you share a project URL with the user you should use the `get-absolute-url` tool to ensure you're using the correct scheme, domain / IP, and port.

## Tinker / Debugging
- You should use the `tinker` tool when you need to execute PHP to debug code or query Eloquent models directly.
- Use the `database-query` tool when you only need to read from the database.

## Reading Browser Logs With the `browser-logs` Tool
- You can read browser logs, errors, and exceptions using the `browser-logs` tool from Boost.
- Only recent browser logs will be useful - ignore old logs.

## Searching Documentation (Critically Important)
- Boost comes with a powerful `search-docs` tool you should use before any other approaches. This tool automatically passes a list of installed packages and their versions to the remote Boost API, so it returns only version-specific documentation specific for the user's circumstance. You should pass an array of packages to filter on if you know you need docs for particular packages.
- The 'search-docs' tool is perfect for all Laravel related packages, including Laravel, Inertia, Livewire, Filament, Tailwind, Pest, Nova, Nightwatch, etc.
- You must use this tool to search for Laravel-ecosystem documentation before falling back to other approaches.
- Search the documentation before making code changes to ensure we are taking the correct approach.
- Use multiple, broad, simple, topic based queries to start. For example: `['rate limiting', 'routing rate limiting', 'routing']`.
- Do not add package names to queries - package information is already shared. For example, use `test resource table`, not `filament 4 test resource table`.

### Available Search Syntax
- You can and should pass multiple queries at once. The most relevant results will be returned first.

1. Simple Word Searches with auto-stemming - query=authentication - finds 'authenticate' and 'auth'
2. Multiple Words (AND Logic) - query=rate limit - finds knowledge containing both "rate" AND "limit"
3. Quoted Phrases (Exact Position) - query="infinite scroll" - Words must be adjacent and in that order
4. Mixed Queries - query=middleware "rate limit" - "middleware" AND exact phrase "rate limit"
5. Multiple Queries - queries=["authentication", "middleware"] - ANY of these terms


=== php rules ===

## PHP

- Always use curly braces for control structures, even if it has one line.

### Constructors
- Use PHP 8 constructor property promotion in `__construct()`.
    - <code-snippet>public function __construct(public GitHub $github) { }</code-snippet>
- Do not allow empty `__construct()` methods with zero parameters.

### Type Declarations
- Always use explicit return type declarations for methods and functions.
- Use appropriate PHP type hints for method parameters.

<code-snippet name="Explicit Return Types and Method Params" lang="php">
protected function isAccessible(User $user, ?string $path = null): bool
{
    ...
}
</code-snippet>

## Comments
- Prefer PHPDoc blocks over comments. Never use comments within the code itself unless there is something _very_ complex going on.

## PHPDoc Blocks
- Add useful array shape type definitions for arrays when appropriate.

## Enums
- Typically, keys in an Enum should be TitleCase. For example: `FavoritePerson`, `BestLake`, `Monthly`.


=== inertia-laravel/core rules ===

## Inertia Core

- Inertia.js components should be placed in the `resources/js/Pages` directory unless specified differently in the JS bundler (vite.config.js).
- Use `Inertia::render()` for server-side routing instead of traditional Blade views.
- Use `search-docs` for accurate guidance on all things Inertia.

<code-snippet lang="php" name="Inertia::render Example">
// routes/web.php example
Route::get('/users', function () {
    return Inertia::render('Users/Index', [
        'users' => User::all()
    ]);
});
</code-snippet>


=== inertia-laravel/v2 rules ===

## Inertia v2

- Make use of all Inertia features from v1 & v2. Check the documentation before making any changes to ensure we are taking the correct approach.

### Inertia v2 New Features
- Polling
- Prefetching
- Deferred props
- Infinite scrolling using merging props and `WhenVisible`
- Lazy loading data on scroll

### Deferred Props & Empty States
- When using deferred props on the frontend, you should add a nice empty state with pulsing / animated skeleton.

### Inertia Form General Guidance
- The recommended way to build forms when using Inertia is with the `<Form>` component - a useful example is below. Use `search-docs` with a query of `form component` for guidance.
- Forms can also be built using the `useForm` helper for more programmatic control, or to follow existing conventions. Use `search-docs` with a query of `useForm helper` for guidance.
- `resetOnError`, `resetOnSuccess`, and `setDefaultsOnSuccess` are available on the `<Form>` component. Use `search-docs` with a query of 'form component resetting' for guidance.


=== laravel/core rules ===

## Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using the `list-artisan-commands` tool.
- If you're creating a generic PHP class, use `artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Database
- Always use proper Eloquent relationship methods with return type hints. Prefer relationship methods over raw queries or manual joins.
- Use Eloquent models and relationships before suggesting raw database queries
- Avoid `DB::`; prefer `Model::query()`. Generate code that leverages Laravel's ORM capabilities rather than bypassing them.
- Generate code that prevents N+1 query problems by using eager loading.
- Use Laravel's query builder for very complex database operations.

### Model Creation
- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `list-artisan-commands` to check the available options to `php artisan make:model`.

### APIs & Eloquent Resources
- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

### Controllers & Validation
- Always create Form Request classes for validation rather than inline validation in controllers. Include both validation rules and custom error messages.
- Check sibling Form Requests to see if the application uses array or string based validation rules.

### Queues
- Use queued jobs for time-consuming operations with the `ShouldQueue` interface.

### Authentication & Authorization
- Use Laravel's built-in authentication and authorization features (gates, policies, Sanctum, etc.).

### URL Generation
- When generating links to other pages, prefer named routes and the `route()` function.

### Configuration
- Use environment variables only in configuration files - never use the `env()` function directly outside of config files. Always use `config('app.name')`, not `env('APP_NAME')`.

### Testing
- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] <name>` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

### Vite Error
- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.


=== laravel/v12 rules ===

## Laravel 12

- Use the `search-docs` tool to get version specific documentation.
- Since Laravel 11, Laravel has a new streamlined file structure which this project uses.

### Laravel 12 Structure
- No middleware files in `app/Http/Middleware/`.
- `bootstrap/app.php` is the file to register middleware, exceptions, and routing files.
- `bootstrap/providers.php` contains application specific service providers.
- **No app\Console\Kernel.php** - use `bootstrap/app.php` or `routes/console.php` for console configuration.
- **Commands auto-register** - files in `app/Console/Commands/` are automatically available and do not require manual registration.

### Database
- When modifying a column, the migration must include all of the attributes that were previously defined on the column. Otherwise, they will be dropped and lost.
- Laravel 11 allows limiting eagerly loaded records natively, without external packages: `$query->latest()->limit(10);`.

### Models
- Casts can and likely should be set in a `casts()` method on a model rather than the `$casts` property. Follow existing conventions from other models.


=== wayfinder/core rules ===

## Laravel Wayfinder

Wayfinder generates TypeScript functions and types for Laravel controllers and routes which you can import into your client side code. It provides type safety and automatic synchronization between backend routes and frontend code.

### Development Guidelines
- Always use `search-docs` to check wayfinder correct usage before implementing any features.
- Always Prefer named imports for tree-shaking (e.g., `import { show } from '@/actions/...'`)
- Avoid default controller imports (prevents tree-shaking)
- Run `php artisan wayfinder:generate` after route changes if Vite plugin isn't installed

### Feature Overview
- Form Support: Use `.form()` with `--with-form` flag for HTML form attributes — `<form {...store.form()}>` → `action="/posts" method="post"`
- HTTP Methods: Call `.get()`, `.post()`, `.patch()`, `.put()`, `.delete()` for specific methods — `show.head(1)` → `{ url: "/posts/1", method: "head" }`
- Invokable Controllers: Import and invoke directly as functions. For example, `import StorePost from '@/actions/.../StorePostController'; StorePost()`
- Named Routes: Import from `@/routes/` for non-controller routes. For example, `import { show } from '@/routes/post'; show(1)` for route name `post.show`
- Parameter Binding: Detects route keys (e.g., `{post:slug}`) and accepts matching object properties — `show("my-post")` or `show({ slug: "my-post" })`
- Query Merging: Use `mergeQuery` to merge with `window.location.search`, set values to `null` to remove — `show(1, { mergeQuery: { page: 2, sort: null } })`
- Query Parameters: Pass `{ query: {...} }` in options to append params — `show(1, { query: { page: 1 } })` → `"/posts/1?page=1"`
- Route Objects: Functions return `{ url, method }` shaped objects — `show(1)` → `{ url: "/posts/1", method: "get" }`
- URL Extraction: Use `.url()` to get URL string — `show.url(1)` → `"/posts/1"`

### Example Usage

<code-snippet name="Wayfinder Basic Usage" lang="typescript">
    // Import controller methods (tree-shakable)
    import { show, store, update } from '@/actions/App/Http/Controllers/PostController'

    // Get route object with URL and method...
    show(1) // { url: "/posts/1", method: "get" }

    // Get just the URL...
    show.url(1) // "/posts/1"

    // Use specific HTTP methods...
    show.get(1) // { url: "/posts/1", method: "get" }
    show.head(1) // { url: "/posts/1", method: "head" }

    // Import named routes...
    import { show as postShow } from '@/routes/post' // For route name 'post.show'
    postShow(1) // { url: "/posts/1", method: "get" }
</code-snippet>


### Wayfinder + Inertia
If your application uses the `<Form>` component from Inertia, you can use Wayfinder to generate form action and method automatically.
<code-snippet name="Wayfinder Form Component (React)" lang="typescript">

<Form {...store.form()}><input name="title" /></Form>

</code-snippet>


=== pint/core rules ===

## Laravel Pint Code Formatter

- You must run `vendor/bin/pint --dirty` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test`, simply run `vendor/bin/pint` to fix any formatting issues.


=== phpunit/core rules ===

## PHPUnit Core

- This application uses PHPUnit for testing. All tests must be written as PHPUnit classes. Use `php artisan make:test --phpunit <name>` to create a new test.
- If you see a test using "Pest", convert it to PHPUnit.
- Every time a test has been updated, run that singular test.
- When the tests relating to your feature are passing, ask the user if they would like to also run the entire test suite to make sure everything is still passing.
- Tests should test all of the happy paths, failure paths, and weird paths.
- You must not remove any tests or test files from the tests directory without approval. These are not temporary or helper files, these are core to the application.

### Running Tests
- Run the minimal number of tests, using an appropriate filter, before finalizing.
- To run all tests: `php artisan test`.
- To run all tests in a file: `php artisan test tests/Feature/ExampleTest.php`.
- To filter on a particular test name: `php artisan test --filter=testName` (recommended after making a change to a related file).


=== inertia-react/core rules ===

## Inertia + React

- Use `router.visit()` or `<Link>` for navigation instead of traditional links.

<code-snippet name="Inertia Client Navigation" lang="react">

import { Link } from '@inertiajs/react'
<Link href="/">Home</Link>

</code-snippet>


=== inertia-react/v2/forms rules ===

## Inertia + React Forms

<code-snippet name="`<Form>` Component Example" lang="react">

import { Form } from '@inertiajs/react'

export default () => (
    <Form action="/users" method="post">
        {({
            errors,
            hasErrors,
            processing,
            wasSuccessful,
            recentlySuccessful,
            clearErrors,
            resetAndClearErrors,
            defaults
        }) => (
        <>
        <input type="text" name="name" />

        {errors.name && <div>{errors.name}</div>}

        <button type="submit" disabled={processing}>
            {processing ? 'Creating...' : 'Create User'}
        </button>

        {wasSuccessful && <div>User created successfully!</div>}
        </>
    )}
    </Form>
)

</code-snippet>


=== tailwindcss/core rules ===

## Tailwind Core

- Use Tailwind CSS classes to style HTML, check and use existing tailwind conventions within the project before writing your own.
- Offer to extract repeated patterns into components that match the project's conventions (i.e. Blade, JSX, Vue, etc..)
- Think through class placement, order, priority, and defaults - remove redundant classes, add classes to parent or child carefully to limit repetition, group elements logically
- You can use the `search-docs` tool to get exact examples from the official documentation when needed.

### Spacing
- When listing items, use gap utilities for spacing, don't use margins.

    <code-snippet name="Valid Flex Gap Spacing Example" lang="html">
        <div class="flex gap-8">
            <div>Superior</div>
            <div>Michigan</div>
            <div>Erie</div>
        </div>
    </code-snippet>


### Dark Mode
- If existing pages and components support dark mode, new pages and components must support dark mode in a similar way, typically using `dark:`.


=== tailwindcss/v4 rules ===

## Tailwind 4

- Always use Tailwind CSS v4 - do not use the deprecated utilities.
- `corePlugins` is not supported in Tailwind v4.
- In Tailwind v4, configuration is CSS-first using the `@theme` directive — no separate `tailwind.config.js` file is needed.
<code-snippet name="Extending Theme in CSS" lang="css">
@theme {
  --color-brand: oklch(0.72 0.11 178);
}
</code-snippet>

- In Tailwind v4, you import Tailwind using a regular CSS `@import` statement, not using the `@tailwind` directives used in v3:

<code-snippet name="Tailwind v4 Import Tailwind Diff" lang="diff">
   - @tailwind base;
   - @tailwind components;
   - @tailwind utilities;
   + @import "tailwindcss";
</code-snippet>


### Replaced Utilities
- Tailwind v4 removed deprecated utilities. Do not use the deprecated option - use the replacement.
- Opacity values are still numeric.

| Deprecated |	Replacement |
|------------+--------------|
| bg-opacity-* | bg-black/* |
| text-opacity-* | text-black/* |
| border-opacity-* | border-black/* |
| divide-opacity-* | divide-black/* |
| ring-opacity-* | ring-black/* |
| placeholder-opacity-* | placeholder-black/* |
| flex-shrink-* | shrink-* |
| flex-grow-* | grow-* |
| overflow-ellipsis | text-ellipsis |
| decoration-slice | box-decoration-slice |
| decoration-clone | box-decoration-clone |


=== tests rules ===

## Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test` with a specific filename or filter.
</laravel-boost-guidelines>
