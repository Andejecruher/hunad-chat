<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

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
    public function store(Request $request)
    {
        //
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
