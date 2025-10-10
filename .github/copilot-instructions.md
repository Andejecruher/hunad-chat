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
- Cada *feature* tiene su propio directorio bajo `resources/js/features/<feature-name>`.
- Si un componente es usado en **2 o más features**, debe moverse a `resources/js/components/global`.
- Los *containers* deben tener el mismo nombre que la *feature*.
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
- Centralizar *fetching* con **React Query** y estado global con **Zustand**.
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
    { id: 1, name: 'Andejecruher', email: 'test@example.com' }
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
