// TypeScript
// Reemplaza UserType por un genérico para usar con cualquier interfaz
export const toFormData = <
    T extends Record<string, unknown> = Record<string, unknown>,
>(
    obj?: Partial<T>,
    method: string = 'POST',
): FormData => {
    const fd = new FormData();

    if (!obj) {
        if (method && method !== 'POST') fd.append('_method', method);
        return fd;
    }

    Object.entries(obj).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (typeof value === 'boolean') {
            fd.append(key, value ? '1' : '0');
            return;
        }

        if (value instanceof File || value instanceof Blob) {
            fd.append(key, value);
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((v) => {
                if (v === undefined || v === null) return;
                if (v instanceof File || v instanceof Blob) {
                    fd.append(`${key}[]`, v);
                } else if (typeof v === 'object') {
                    fd.append(`${key}[]`, JSON.stringify(v));
                } else {
                    fd.append(`${key}[]`, String(v));
                }
            });
            return;
        }

        if (typeof value === 'object') {
            fd.append(key, JSON.stringify(value));
            return;
        }

        fd.append(key, String(value));
    });

    if (method && method !== 'POST') fd.append('_method', method);
    return fd;
};

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
