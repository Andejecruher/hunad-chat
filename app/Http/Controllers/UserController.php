<?php

namespace App\Http\Controllers;

use App\Http\Requests\InviteUserRequest;
use App\Mail\UserInviteMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
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
            $user = auth()->user();

            // Generar contraseña temporal segura
            $tempPassword = Str::random(16);

            // Crear usuario
            $newUser = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => $data['role'],
                'password' => Hash::make($tempPassword),
                'email_verified_at' => null,
                'company_id' => $user->company_id, // Heredar company_id del usuario autenticado

            ]);

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
                'invited_by' => $user->email,
                'role' => $data['role']
            ]);

            return back()->with('success', '¡Usuarion invitado correctamente!');


        } catch (\Exception $e) {
            Log::error('Error invitando usuario: ' . $e->getMessage(), [
                'email' => $data['email'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

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
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
