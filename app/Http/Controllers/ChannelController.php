<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Http\Requests\Channel\StoreChannelRequest;
use App\Http\Requests\Channel\UpdateChannelRequest;

class ChannelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        // Seguridad: asegurar que el usuario y su company existen
        if (! $user || ! $user->company_id) {
            abort(403, 'Unauthorized.');
        }

        $filters = request()->only(['search', 'type', 'status', 'limit']);

        // Base query: solo canales de la empresa del usuario
        $query = Channel::query()->where('company_id', $user->company_id);

        // Filtro: búsqueda en name y description
        if (! empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filtro por tipo
        if (! empty($filters['type']) && $filters['type'] !== 'all') {
            $query->where('type', $filters['type']);
        }

        // Filtro por estado/status
        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        // Normalizar 'limit' que puede llegar como string (ej. "all", "  ALL ", "10")
        $rawLimit = $filters['limit'] ?? null;
        $limit = is_string($rawLimit) ? strtolower(trim($rawLimit)) : $rawLimit;

        if ($limit === 'all') {
            // devolver todos pero con estructura de paginación
            $items = $query->orderBy('created_at', 'desc')->get()->values();
            $total = $items->count();
            $perPage = $total > 0 ? $total : 1;
            $currentPage = max(1, (int) request()->input('page', 1));

            $channels = new LengthAwarePaginator(
                $items,
                $total,
                $perPage,
                $currentPage,
                [
                    'path' => request()->url(),
                    'query' => request()->query(),
                ]
            );
        } else {
            // sanitizar limit numérico (puede venir como string) y aplicar tope (máx 100)
            $perPage = is_numeric($limit) ? max(1, min((int) $limit, 100)) : 10;
            $channels = $query->orderBy('created_at', 'desc')->paginate($perPage)->withQueryString();
        }

        return Inertia::render('channels/channels', [
            'channels' => $channels,
            'filters' => $filters,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreChannelRequest $request)
    {
        $user = auth()->user();

        if (! $user || ! $user->company_id) {
            abort(403, 'Unauthorized.');
        }

        Log::info('Creating channel (raw config)', ['data' => $request->all()]);

        $data = $request->validated();

        try {
            DB::beginTransaction();

            // Normalizar y encriptar secretos dentro de config si vienen presentes
            $config = $data['config'] ?? [];

            if (isset($config['access_token']) && $config['access_token'] !== '') {
                $config['access_token'] = Crypt::encryptString($config['access_token']);
            }

            $channel = Channel::create([
                'company_id' => $user->company_id,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'type' => $data['type'],
                'config' => $config,
                'status' => 'inactive',
                'external_id' => Str::uuid()->toString(),
            ]);

            DB::commit();

            Log::info('Channel created', ['channel_id' => $channel->id, 'company_id' => $user->company_id]);

            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json($channel, 201);
            }

            return back()->with('success', 'Channel created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating channel', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return back()->withInput()->withErrors(['error' => 'Error creating channel: '.$e->getMessage()]);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = auth()->user();
        $channel = Channel::findOrFail($id);

        // Verificar pertenencia a la misma empresa
        if ($channel->company_id !== $user->company_id) {
            abort(403, 'Unauthorized.');
        }

        // decrypt config values for display
        $config = $channel->config ?? [];
        if (isset($config['access_token'])) {
            try {
                $config['access_token'] = Crypt::decryptString($config['access_token']);
            } catch (\Exception $e) {
                $config['access_token'] = null;
            }
        }

        // construct channel with decrypted config
        $channel->config = $config;

        Log::info('channel show', ['channel' => $channel]);

        return Inertia::render('channels/channel', [
            'channel' => $channel,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = auth()->user();
        $channel = Channel::findOrFail($id);

        // Verificar pertenencia a la misma empresa
        if ($channel->company_id !== $user->company_id) {
            abort(403, 'Unauthorized.');
        }

        // decrypt config values for display
        $config = $channel->config ?? [];
        if (isset($config['access_token'])) {
            try {
                $config['access_token'] = Crypt::decryptString($config['access_token']);
            } catch (\Exception $e) {
                $config['access_token'] = null;
            }
        }

        // construct channel with decrypted config
        $channel->config = $config;

        return Inertia::render('channels/channel', [
            'channel' => $channel,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateChannelRequest $request, Channel $channel)
    {
        $user = auth()->user();
        $data = $request->validated();

        Log::info('Updating channel (raw config)', ['data' => $data]);

        // Recuperar config actual (asegura que sea array)
        $existingConfig = $channel->config ?? [];
        if (is_string($existingConfig)) {
            $decoded = json_decode($existingConfig, true);
            $existingConfig = is_array($decoded) ? $decoded : $existingConfig;
        }

        // Intentar obtener token existente desencriptado (si existe)
        $existingTokenEncrypted = $existingConfig['access_token'] ?? null;
        $existingTokenPlain = null;
        if (! empty($existingTokenEncrypted) && is_string($existingTokenEncrypted)) {
            try {
                $existingTokenPlain = Crypt::decryptString($existingTokenEncrypted);
            } catch (\Exception $e) {
                $existingTokenPlain = null; // no se pudo desencriptar
            }
        }

        // Config enviada explícitamente como objeto/array
        $incomingConfig = $data['config'] ?? [];

        // Mapear campos top-level hacia config (compatibilidad)
        $topLevelKeys = [
            'access_token',
            'phone_number_id',
            'whatsapp_business_id',
            'whatsapp_phone_number_id',
            'business_id',
            'app_secret',
            'api_key',
            'webhook_secret',
        ];

        foreach ($topLevelKeys as $key) {
            if (array_key_exists($key, $data) && $data[$key] !== null) {
                $incomingConfig[$key] = $data[$key];
            }
        }

        // Merge preservando valores existentes cuando no se envían
        $finalConfig = array_merge(is_array($existingConfig) ? $existingConfig : [], is_array($incomingConfig) ? $incomingConfig : []);

        // Manejo específico de access_token:
        if (array_key_exists('access_token', $data) || array_key_exists('access_token', $incomingConfig)) {
            // Preferir valor top-level si existe, sino el enviado dentro de config
            $incomingAccessToken = array_key_exists('access_token', $data) ? $data['access_token'] : ($incomingConfig['access_token'] ?? null);

            if ($incomingAccessToken === null || $incomingAccessToken === '') {
                // Si se envía explicitamente vacío o null, eliminamos el token (borrar)
                unset($finalConfig['access_token']);
            } else {
                // Si existe token previo desencriptado y es igual al entrante, conservar el encriptado existente
                if ($existingTokenPlain !== null && $incomingAccessToken === $existingTokenPlain) {
                    $finalConfig['access_token'] = $existingTokenEncrypted;
                } else {
                    // Cambio real: encriptar el nuevo token
                    $finalConfig['access_token'] = Crypt::encryptString((string) $incomingAccessToken);
                }
            }
        }
        // Si no se envió access_token en la request, dejamos el valor existente tal cual (ya quedó en $finalConfig)

        // Campos updatable (solo los permitidos)
        $updates = [];
        if (array_key_exists('name', $data)) {
            $updates['name'] = $data['name'];
        }
        if (array_key_exists('description', $data)) {
            $updates['description'] = $data['description'];
        }
        if (array_key_exists('type', $data)) {
            $updates['type'] = $data['type'];
        }
        if (array_key_exists('status', $data)) {
            $updates['status'] = $data['status'];
        }
        // Siempre setear config si hay cambios detectables
        if (! empty($finalConfig)) {
            $updates['config'] = $finalConfig;
        }

        try {
            DB::beginTransaction();

            if (! empty($updates)) {
                $channel->update($updates);
            }

            DB::commit();

            Log::info('Channel updated', ['channel_id' => $channel->id, 'company_id' => $user->company_id]);

            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json($channel->fresh(), 200);
            }

            return back()->with('success', 'Canal actualizado correctamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Error updating channel', ['error' => $e->getMessage(), 'channel_id' => $channel->id]);

            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['error' => 'Error al actualizar el canal'], 500);
            }

            return back()->withInput()->withErrors(['error' => 'Error al actualizar el canal.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = auth()->user();
        $channel = Channel::findOrFail($id);

        if ($channel->company_id !== $user->company_id) {
            abort(403, 'Unauthorized.');
        }

        try {
            $channel->delete();
            Log::info('Channel deleted', ['channel_id' => $channel->id, 'company_id' => $user->company_id]);

            return back()->with('success', 'Channel deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting channel', ['error' => $e->getMessage()]);

            return back()->withErrors(['error' => 'Could not delete channel: '.$e->getMessage()]);
        }
    }
}
