"use client";

import {
  Ban,
  KeyRound,
  MoreHorizontal,
  PenLine,
  Trash2,
  Unlock,
  UserCheck,
} from "lucide-react";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth";
import type { Role } from "@/lib/db/generated/enums";
import { cn } from "@/lib/utils";
import { BanUserDialog } from "./ban-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { ImpersonateDialog } from "./impersonate-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { UnbanUserDialog } from "./unban-user-dialog";
import type { UserTableRow } from "./users-table-types";

interface UsersDataTableRowActionsProps {
  currentUserId: string;
  role: Role;
  user: UserTableRow;
}

export function UsersDataTableRowActions({
  currentUserId,
  role,
  user,
}: UsersDataTableRowActionsProps) {
  const canEdit = authClient.admin.checkRolePermission({
    role,
    permissions: { user: ["update", "set-role"] },
  });

  const canReset = authClient.admin.checkRolePermission({
    role,
    permissions: { user: ["set-password"] },
  });

  const canImpersonate = authClient.admin.checkRolePermission({
    role,
    permissions: { user: ["impersonate"] },
  });

  const canBan = authClient.admin.checkRolePermission({
    role,
    permissions: { user: ["ban"] },
  });

  const canDelete = authClient.admin.checkRolePermission({
    role,
    permissions: { user: ["delete"] },
  });

  const showDropdown =
    canEdit || canReset || canImpersonate || canBan || canDelete;

  const [showEdit, setShowEdit] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showBan, setShowBan] = useState(false);
  const [showUnban, setShowUnban] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showImpersonate, setShowImpersonate] = useState(false);
  const isBanned = !!user.banned;
  const isMe = user.id === currentUserId;

  if (!showDropdown) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted data-[popup-open]:bg-muted",
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px]">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
          </DropdownMenuGroup>

          {(canEdit || canReset || canImpersonate) && <DropdownMenuSeparator />}

          {canEdit && (
            <DropdownMenuItem onClick={() => setShowEdit(true)}>
              <PenLine className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
          )}
          {canReset && (
            <DropdownMenuItem onClick={() => setShowReset(true)}>
              <KeyRound className="mr-2 h-4 w-4" />
              Redefinir Senha
            </DropdownMenuItem>
          )}
          {canImpersonate && (
            <DropdownMenuItem
              onClick={() => setShowImpersonate(true)}
              disabled={isMe}
              className={
                isMe
                  ? "opacity-50 cursor-not-allowed text-muted-foreground"
                  : ""
              }
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Representar
            </DropdownMenuItem>
          )}

          {(canEdit || canReset || canImpersonate) && (canBan || canDelete) && (
            <DropdownMenuSeparator />
          )}

          {canBan && (
            <DropdownMenuItem
              onClick={() => (isBanned ? setShowUnban(true) : setShowBan(true))}
              disabled={isMe}
              className={cn(
                isMe
                  ? "opacity-50 cursor-not-allowed text-muted-foreground"
                  : isBanned
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive",
              )}
            >
              {isBanned ? (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Desbanir
                </>
              ) : (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  Banir
                </>
              )}
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem
              onClick={() => setShowDelete(true)}
              disabled={isMe}
              className={cn(
                isMe
                  ? "opacity-50 cursor-not-allowed text-muted-foreground"
                  : "text-destructive",
              )}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserDialog user={user} open={showEdit} onOpenChange={setShowEdit} />
      <ResetPasswordDialog
        user={user}
        open={showReset}
        onOpenChange={setShowReset}
      />
      <BanUserDialog
        userId={user.id}
        userName={user.name}
        open={showBan}
        onOpenChange={setShowBan}
      />
      <UnbanUserDialog
        userId={user.id}
        userName={user.name}
        open={showUnban}
        onOpenChange={setShowUnban}
      />
      <DeleteUserDialog
        userId={user.id}
        userName={user.name}
        open={showDelete}
        onOpenChange={setShowDelete}
      />
      <ImpersonateDialog
        userId={user.id}
        userName={user.name}
        open={showImpersonate}
        onOpenChange={setShowImpersonate}
      />
    </>
  );
}
