// TypeScript
// Reemplaza UserType por un genérico para usar con cualquier interfaz
// typescript
// Archivo sugerido: resources/js/utils/form-data-utils.ts
export function toFormData(
    obj: Record<string, unknown>,
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
): FormData {
    const formData = new FormData();

    function appendFormValue(key: string, value: unknown) {
        if (value === undefined || value === null) {
            return; // evita enviar valores nulos/undefined si no quieres
        }
        // Archivos o Blobs se anexan tal cual
        if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
            return;
        }
        // Arrays: anexar con índices o como múltiples keys (ej: tags[])
        if (Array.isArray(value)) {
            value.forEach((v) => {
                // usa key[] para que PHP lo convierta en array
                appendFormValue(`${key}[]`, v);
            });
            return;
        }
        // Objetos: recorrer y usar notación con corchetes
        if (typeof value === 'object' && value !== null) {
            const objectValue = value as Record<string, unknown>;
            Object.keys(objectValue).forEach((subKey) => {
                appendFormValue(`${key}[${subKey}]`, objectValue[subKey]);
            });
            return;
        }
        // Valores primitivos
        formData.append(key, String(value));
    }

    Object.keys(obj).forEach((k) => {
        appendFormValue(k, obj[k]);
    });

    // Para métodos diferentes a POST, Laravel espera _method
    if (method && method !== 'POST') {
        formData.append('_method', method);
    }

    return formData;
}


// Ejemplos de uso:
// 1) Dejar que TypeScript infiera el tipo
// const fd = toFormData(userObj); // userObj tiene tipo inferido

// 2) Pasar la interfaz explícitamente
// interface UserForm { name: string; email?: string; avatar?: File }
// const fd = toFormData<UserForm>(userForm, 'PUT');

// 3) Enviar arrays, archivos y objetos anidados:
// const fd = toFormData<{ tags: string[]; files: File[]; meta: Record<string,unknown> }>(
//   { tags: ['a','b'], files: [file1, file2], meta: { active: true } },
//   'PATCH'
// );
