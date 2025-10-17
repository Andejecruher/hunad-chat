<?php

namespace App\Http\Controllers;

use App\Http\Requests\InviteUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Mail\UserInviteMail;
use App\Models\User;
use App\Events\UserUpdated;
use App\Events\UserDeleted;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            abort(403, 'Usuario no autenticado');
        }

        $query = User::query()
            ->where('company_id', $user->company_id)
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->input('search');
                $q->where(function ($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            // Solo filtrar por rol si el valor es distinto de 'all' y no vacío
            ->when($request->filled('role') && $request->input('role') !== 'all', function ($q) use ($request) {
                $role = $request->input('role');
                $q->where('role', $role);
            });

        $limit = $request->input('limit');
        if ($limit === 'all') {
            $users = $query->orderBy('id', 'desc')->get();
            $users = new \Illuminate\Pagination\LengthAwarePaginator(
                $users,
                $users->count(),
                $users->count(),
                1,
                ['path' => $request->url(), 'query' => $request->query()]
            );
        } else {
            $users = $query->orderBy('id', 'desc')->paginate($limit ?? 10)->withQueryString();
        }

        return inertia('configurations/users', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'limit']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(InviteUserRequest $request)
    {
        try {
            $data = $request->validated();
            $authUser = auth()->user();

            // Generar contraseña temporal segura
            $tempPassword = Str::random(16);

            // Crear usuario asignando atributos explícitamente para evitar warnings de "guarded"
            $newUser = new User();
            $newUser->name = $data['name'];
            $newUser->email = $data['email'];
            $newUser->role = $data['role'];
            $newUser->password = Hash::make($tempPassword);
            $newUser->email_verified_at = null;
            $newUser->company_id = $authUser->company_id; // Heredar company_id del usuario autenticado
            $newUser->save();

            // Generar URL de verificación
            $verificationUrl = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                ['id' => $newUser->id, 'hash' => sha1($newUser->email)]
            );

            // Enviar email usando Mailable
            \Mail::to($newUser->email)->send(
                new UserInviteMail(
                    $newUser->name,
                    $newUser->email,
                    $data['role'],
                    $tempPassword,
                    $verificationUrl
                )
            );

            Log::info('Usuario invitado exitosamente', [
                'invited_email' => $newUser->email,
                'invited_by' => $authUser->email,
                'role' => $data['role']
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Usuario invitado exitosamente'
                ], 201);
            }
            return back()->with('success', '¡Usuario invitado correctamente!');
        } catch (\Exception $e) {
            Log::error('Error invitando usuario: ' . $e->getMessage(), [
                'email' => $data['email'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Error al invitar usuario: ' . $e->getMessage()
                ], 500);
            }
            return back()->withErrors(['error' => 'Error al invitar usuario: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, string $id)
    {
        try {
            $data = $request->validated();
            $authUser = auth()->user();

            $user = User::findOrFail($id);

            // Authorization: only same company or admins can update
            if ($user->company_id !== $authUser->company_id && !$authUser->isAdmin()) {
                abort(403, 'No autorizado para actualizar este usuario');
            }

            // Evitar cambios en company_id desde el request
            if (isset($data['company_id'])) {
                unset($data['company_id']);
            }

            // Manejar contraseña: si se envía, hashearla; si viene null/empty, removerla
            if (array_key_exists('password', $data)) {
                if (!empty($data['password'])) {
                    $data['password'] = Hash::make($data['password']);
                } else {
                    unset($data['password']);
                }
            }

            // Registrar cambios en transacción para mantener consistencia
            DB::beginTransaction();

            $original = $user->only(array_keys($data));

            $user->fill($data);
            $user->save();

            $changes = $user->getChanges();

            Log::info('Usuario actualizado', [
                'user_id' => $user->id,
                'updated_by' => $authUser->id,
                'changes' => $changes,
            ]);

            DB::commit();

            // Dispatch broadcast event so clients can refresh in real-time
            event(new UserUpdated($user));

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Usuario actualizado correctamente',
                    'user' => $user->fresh(),
                ], 200);
            }

            return back()->with('success', 'Usuario actualizado correctamente');
        } catch (ModelNotFoundException $e) {
            Log::warning('Usuario no encontrado al intentar actualizar', ['id' => $id]);
            abort(404, 'Usuario no encontrado');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error actualizando usuario: ' . $e->getMessage(), [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            if ($request->expectsJson()) {
                return response()->json(['error' => 'Error al actualizar usuario'], 500);
            }

            return back()->withErrors(['error' => 'Error al actualizar usuario']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        try {
            $authUser = auth()->user();
            $user = User::findOrFail($id);

            // Prevent deleting self
            if ($authUser->id === $user->id) {
                abort(403, 'No puedes eliminar tu propio usuario');
            }

            // Authorization: only same company or admins can delete
            if ($user->company_id !== $authUser->company_id && !$authUser->isAdmin()) {
                abort(403, 'No autorizado para eliminar este usuario');
            }

            DB::beginTransaction();

            // Si se desea implementar borrado suave, usar softDeletes en el modelo
            // Actualmente realiza un delete físico
            $user->delete();

            Log::info('Usuario eliminado', [
                'user_id' => $user->id,
                'deleted_by' => $authUser->id,
            ]);

            DB::commit();

            // Dispatch broadcast event so clients can refresh in real-time
            event(new UserDeleted($user));

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Usuario eliminado correctamente'], 200);
            }

            return back()->with('success', 'Usuario eliminado correctamente');
        } catch (ModelNotFoundException $e) {
            Log::warning('Usuario no encontrado al intentar eliminar', ['id' => $id]);
            abort(404, 'Usuario no encontrado');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error eliminando usuario: ' . $e->getMessage(), [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            if ($request->expectsJson()) {
                return response()->json(['error' => 'Error al eliminar usuario'], 500);
            }

            return back()->withErrors(['error' => 'Error al eliminar usuario']);
        }
    }
}
