<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\InviteUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Mail\UserInviteMail;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        if (! $user) {
            abort(403, 'User not authenticated');
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
                // Only filter by role if the value is different than 'all' and not empty
            ->when($request->filled('role') && $request->input('role') !== 'all', function ($q) use ($request) {
                $role = $request->input('role');
                $q->where('role', $role);
            })
            ->when($request->filled('status') && $request->input('status') !== 'all', function ($q) use ($request) {
                $q->where('status', $request->input('status'));
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
            'filters' => $request->only(['search', 'role', 'status', 'limit']),
        ]);
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
            $newUser = new User;
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

            Log::info('User invited successfully', [
                'invited_email' => $newUser->email,
                'invited_by' => $authUser->email,
                'role' => $data['role'],
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'User invited successfully',
                ], 201);
            }

            return back()->with('success', 'User invited successfully!');
        } catch (\Exception $e) {
            Log::error('Error inviting user: '.$e->getMessage(), [
                'email' => $data['email'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Error inviting user: '.$e->getMessage(),
                ], 500);
            }

            return back()->withErrors(['error' => 'Error inviting user: '.$e->getMessage()]);
        }
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

            Log::info('User data update', [
                'auth_user' => $authUser->only(['id', 'name', 'company_id']),
                'user' => $user->only(['id', 'name', 'company_id']),
            ]);

            // Authorization: only same company or admins can update
            if ($user->company_id !== $authUser->company_id) {
                if ($request->expectsJson()) {
                    return response()->json([
                        // Generate secure temporary password
                        'message' => 'Not authorized to update this user',
                        'user' => $user->fresh(),
                    ], 403);
                    // Create user by assigning attributes explicitly to avoid "guarded" warnings
                }
                abort(403, 'Not authorized to update this user');
            }

            // Evitar cambios en company_id desde el request
            if (isset($data['company_id'])) {
                unset($data['company_id']);
            }

            // Manejar contraseña: si se envía, hashearla; si viene null/empty, removerla
            // Generate verification URL
            if (array_key_exists('password', $data)) {
                if (! empty($data['password'])) {
                    $data['password'] = Hash::make($data['password']);
                } else {
                    unset($data['password']);
                }
            }
            // Send email using Mailable

            // Registrar cambios en transacción para mantener consistencia
            DB::beginTransaction();

            $original = $user->only(array_keys($data));

            $user->fill($data);
            $user->save();

            $changes = $user->getChanges();

            Log::info('User updated', [
                'user_id' => $user->id,
                'updated_by' => $authUser->id,
                'changes' => $changes,
                'data' => $data,
                'user' => $user->only(['id', 'name', 'email', 'role', 'status', 'company_id']),
            ]);

            DB::commit();

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'User updated successfully',
                    'user' => $user->fresh(),
                ], 200);
            }

            return back()->with('success', 'User updated successfully');
        } catch (ModelNotFoundException $e) {
            Log::warning('User not found when attempting update', ['id' => $id]);
            abort(404, 'User not found');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating user: '.$e->getMessage(), [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            if ($request->expectsJson()) {
                return response()->json(['error' => 'Error updating user'], 500);
            }

            return back()->withErrors(['error' => 'Error updating user']);
        }
    }

    /**
     * Resend invitation email to user.
     */
    public function resendInvite(Request $request, string $id)
    {
        try {
            $authUser = auth()->user();
            $user = User::findOrFail($id);

            // Authorization: only same company can resend invites
            if ($user->company_id !== $authUser->company_id) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Not authorized to resend invitation for this user',
                    ], 403);
                }
                abort(403, 'Not authorized to resend invitation for this user');
            }

            // Prevent changes to company_id from the request
            // Check if user already verified their email
            if ($user->email_verified_at) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'User has already verified their email',
                        // Handle password: if provided, hash it; if null/empty, remove it
                    ], 400);
                }

                return back()->withErrors(['error' => 'User has already verified their email']);
            }

            // Generate new temporary password
            $tempPassword = Str::random(16);
            $user->password = Hash::make($tempPassword);
            // Record changes inside a transaction to maintain consistency
            $user->save();

            // Generate new verification URL
            $verificationUrl = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                ['id' => $user->id, 'hash' => sha1($user->email)]
            );

            // Send invitation email
            Mail::to($user->email)->send(
                new UserInviteMail(
                    $user->name,
                    $user->email,
                    $user->role,
                    $tempPassword,
                    $verificationUrl
                )
            );

            Log::info('Invitation resent successfully', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'resent_by' => $authUser->email,
                'role' => $user->role,
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Invitation resent successfully',
                ], 200);
            }

            return back()->with('success', 'Invitation resent successfully');
        } catch (ModelNotFoundException $e) {
            Log::warning('User not found when resending invitation', ['id' => $id]);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'User not found',
                ], 404);
            }
            abort(404, 'User not found');
        } catch (\Exception $e) {
            Log::error('Error resending invitation: '.$e->getMessage(), [
                'user_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Error resending invitation: '.$e->getMessage(),
                ], 500);
            }

            return back()->withErrors(['error' => 'Error resending invitation: '.$e->getMessage()]);
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
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'You cannot delete your own user',
                        'user' => $user->fresh(),
                    ], 403);
                }
                abort(403, 'You cannot delete your own user');
            }

            // Authorization: only same company or admins can delete
            // If soft deletes are desired, enable SoftDeletes on the model
            // Currently performs a physical delete
            if ($user->company_id !== $authUser->company_id) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Not authorized to delete this user',
                        'user' => $user->fresh(),
                    ], 403);
                }
                abort(403, 'Not authorized to delete this user');
            }

            DB::beginTransaction();

            // Si se desea implementar borrado suave, usar softDeletes en el modelo
            // Actualmente realiza un delete físico
            $user->delete();

            Log::info('User deleted', [
                'user_id' => $user->id,
                'deleted_by' => $authUser->id,
            ]);

            DB::commit();

            if ($request->expectsJson()) {
                return response()->json(['message' => 'User deleted successfully'], 200);
            }

            return back()->with('success', 'User deleted successfully');
        } catch (ModelNotFoundException $e) {
            Log::warning('User not found when attempting to delete', ['id' => $id]);
            abort(404, 'User not found');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting user: '.$e->getMessage(), [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            if ($request->expectsJson()) {
                return response()->json(['error' => 'Error deleting user'], 500);
            }

            return back()->withErrors(['error' => 'Error deleting user']);
        }
    }
}
