<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class CompaniesController extends Controller
{
    /**
     * Display the specified resource.
     */
    public function show()
    {
        $user = auth()->user();
        return inertia('configurations/company', [
            'user' => $user,
            'company' => $user->company,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Company $company)
    {
        // Verificar que el usuario actual pertenezca a esta empresa
        if (auth()->user()->company_id !== $company->id) {
            abort(403, 'No tienes permisos para editar esta empresa.');
        }

        // Manejar el método spoofing para POST requests
        if ($request->isMethod('post') && $request->has('_method') && $request->input('_method') === 'PUT') {
            $request->setMethod('PUT');
        }
        // validate the request data
        $request->validate([
            'company_name' => 'required|string|max:255',
            'company_slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('companies', 'slug')->ignore($company->id),
            ],
            'subscription_type' => 'required|in:free,basic,pro,enterprise',
            'branding_theme' => 'nullable|string',
            'branding_default_theme' => 'required|in:light,dark',
            'branding_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        try {
            DB::beginTransaction();

            // Procesar logo si existe
            $logoPath = $company->branding['logo_url'] ?? null;
            $oldLogoPath = $logoPath;

            if ($request->hasFile('branding_logo')) {
                // Eliminar logo anterior si existe
                if ($oldLogoPath && Storage::disk('public')->exists($oldLogoPath)) {
                    Storage::disk('public')->delete($oldLogoPath);
                }

                $logoPath = $request->file('branding_logo')->store('logos', 'public');
            }

            // Preparar datos de branding manteniendo la estructura existente o creando nueva
            $existingBranding = $company->branding ?? [];

            // Decodificar el tema si viene como string
            $themeData = $request->branding_theme;
            if (is_string($themeData)) {
                $themeData = json_decode($themeData, true);
            }

            $brandingData = [
                'theme' => $themeData ?:
                    ($existingBranding['theme'] ?? [
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
                    ]),
                'logo_url' => $logoPath,
                'default_theme' => $request->branding_default_theme,
            ];

            // Actualizar la empresa
            $company->update([
                'name' => $request->company_name,
                'slug' => $request->company_slug,
                'subscription_type' => $request->subscription_type,
                'branding' => $brandingData,
            ]);

            DB::commit();

            return back()->with('success', '¡Información de la empresa actualizada exitosamente!');

        } catch (\Exception $e) {
            DB::rollBack();

            // Log del error para debugging
            \Log::error('Error actualizando company:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Eliminar archivo de logo nuevo si se subió pero falló la transacción
            if ($request->hasFile('branding_logo') && $logoPath && Storage::disk('public')->exists($logoPath)) {
                Storage::disk('public')->delete($logoPath);
            }

            return back()->withErrors(['error' => 'Error durante la actualización: ' . $e->getMessage()]);
        }
    }
}
