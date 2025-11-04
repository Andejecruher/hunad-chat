import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/types';
import {
    Edit,
    Eye,
    Mail,
    MoreVertical,
    Power,
    Shield,
    UserX,
} from 'lucide-react';
import { useState } from 'react';
import { ChangeRoleDialog } from './change-role-dialog';
import { ChangeStatusDialog } from './change-status-dialog';
import { DeleteUserDialog } from './delete-user-dialog';
import { EditUserDialog } from './edit-user-dialog';
import { ResendInviteDialog } from './resend-invite-dialog';
import { UserDetailsDialog } from './user-details-dialog';

interface UserActionsProps {
    user: User;
    onUpdate: (userId: number, updates: Partial<User>) => void;
    onDelete: (userId: number) => void;
}

export function UserActions({ user, onUpdate, onDelete }: UserActionsProps) {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [roleOpen, setRoleOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [resendOpen, setResendOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Usuario
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRoleOpen(true)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Cambiar Rol
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusOpen(true)}>
                        <Power className="mr-2 h-4 w-4" />
                        Cambiar Estado
                    </DropdownMenuItem>
                    {user.status === 'pending' && (
                        <DropdownMenuItem onClick={() => setResendOpen(true)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Reenviar Invitación
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <UserX className="mr-2 h-4 w-4" />
                        Eliminar Usuario
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <UserDetailsDialog
                user={user}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />
            <EditUserDialog
                user={user}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSave={onUpdate}
            />
            <ChangeRoleDialog
                user={user}
                open={roleOpen}
                onOpenChange={setRoleOpen}
                onSave={onUpdate}
            />
            <ChangeStatusDialog
                user={user}
                open={statusOpen}
                onOpenChange={setStatusOpen}
                onSave={onUpdate}
            />
            <DeleteUserDialog
                user={user}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onDelete={onDelete}
            />
            <ResendInviteDialog
                user={user}
                open={resendOpen}
                onOpenChange={setResendOpen}
            />
        </>
    );
}
