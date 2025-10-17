import { User } from '@/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DeleteUserDialog } from './delete-user-dialog';

describe('DeleteUserDialog', () => {
    it('calls onDelete when confirm action is clicked', async () => {
        const onDelete = vi.fn();
        const onOpenChange = vi.fn();
        const user = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
        } as User;

        render(
            <DeleteUserDialog
                user={user}
                open={true}
                onOpenChange={onOpenChange}
                onDelete={onDelete}
            />,
        );

        // Encontrar específicamente el botón por su rol y nombre
        const button = await screen.findByRole('button', {
            name: /Eliminar Usuario/i,
        });
        await userEvent.click(button);

        expect(onDelete).toHaveBeenCalledWith(1);
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});
