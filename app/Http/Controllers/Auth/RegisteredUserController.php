<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'company_slug' => 'required|string|max:255|unique:companies,slug',
            'subscription_type' => 'required|in:free,basic,pro,enterprise',
            'user_name' => 'required|string|max:255',
            'user_email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'user_password' => ['required', 'confirmed', Rules\Password::defaults()],
            'branding_theme' => 'nullable|json',
            'branding_default_theme' => 'required|in:light,dark',
            'branding_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        try {
            DB::beginTransaction();

            // Procesar logo si existe
            $logoPath = null;
            if ($request->hasFile('branding_logo')) {
                $logoPath = $request->file('branding_logo')->store('logos', 'public');
            }

            // Preparar datos de branding
            $brandingData = [
                'theme' => $request->branding_theme ? json_decode($request->branding_theme, true) : [
                    'light' => [
                        'colors' => [
                            'primary' => '#1bf5e1',
                            'secondary' => '#64e9c5',
                        ],
                    ],
                    'dark' => [
                        'colors' => [
                            'primary' => '#1bf5e1',
                            'secondary' => '#64e9c5',
                        ],
                    ],
                ],
                'logo_path' => $logoPath,
                'default_theme' => $request->branding_default_theme,
            ];

            // Crear la empresa
            $company = Company::create([
                'name' => $request->company_name,
                'slug' => $request->company_slug,
                'subscription_type' => $request->subscription_type,
                'branding' => $brandingData,
            ]);

            // Crear el usuario administrador
            $user = User::create([
                'name' => $request->user_name,
                'email' => $request->user_email,
                'password' => Hash::make($request->user_password),
                'company_id' => $company->id,
                'role' => 'admin', // El primer usuario siempre es admin
            ]);

            event(new Registered($user));

            Auth::login($user);

            DB::commit();

            return redirect()->route('dashboard')->with('success', '¡Registro completado exitosamente!');

        } catch (\Exception $e) {
            DB::rollBack();

            // Eliminar archivo de logo si se subió pero falló la transacción
            if ($logoPath && Storage::disk('public')->exists($logoPath)) {
                Storage::disk('public')->delete($logoPath);
            }

            return back()->withErrors(['error' => 'Error durante el registro: ' . $e->getMessage()]);
        }
    }
}
