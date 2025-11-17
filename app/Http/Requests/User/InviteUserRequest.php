<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class InviteUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:admin,agent,supervisor,super-admin',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es requerido',
            'name.string' => 'El nombre debe ser texto válido',
            'name.min' => 'El nombre debe tener al menos 2 caracteres',
            'name.max' => 'El nombre no puede exceder 255 caracteres',
            'email.required' => 'El email es requerido',
            'email.email' => 'El email debe ser una dirección válida',
            'email.unique' => 'Este email ya está registrado',
            'role.required' => 'El rol es requerido',
            'role.in' => 'El rol debe ser admin, agent, supervisor o super-admin',
        ];
    }
}
