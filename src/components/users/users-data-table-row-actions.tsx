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

import { useRouter } from "next/navigation";
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
import { authClient, useSession } from "@/lib/auth";
import type { Role } from "@/lib/db/generated/enums";
import { isCurrentUser } from "@/lib/user-helpers";
import { cn } from "@/lib/utils";
import { BanUserDialog } from "./ban-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { ImpersonateDialog } from "./impersonate-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { UnbanUserDialog } from "./unban-user-dialog";
import type { UserColumn } from "./users-data-table-columns";

interface UsersDataTableRowActionsProps {
  user: UserColumn;
}

export function UsersDataTableRowActions({
  user,
}: UsersDataTableRowActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;

  const canEdit = role
    ? authClient.admin.checkRolePermission({
        role,
        permissions: { user: ["update", "set-role"] },
      })
    : false;

  const canReset = role
    ? authClient.admin.checkRolePermission({
        role,
        permissions: { user: ["set-password"] },
      })
    : false;

  const canImpersonate = role
    ? authClient.admin.checkRolePermission({
        role,
        permissions: { user: ["impersonate"] },
      })
    : false;

  const canBan = role
    ? authClient.admin.checkRolePermission({
        role,
        permissions: { user: ["ban"] },
      })
    : false;

  const canDelete = role
    ? authClient.admin.checkRolePermission({
        role,
        permissions: { user: ["delete"] },
      })
    : false;

  const showDropdown =
    canEdit || canReset || canImpersonate || canBan || canDelete;

  const [showEdit, setShowEdit] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showBan, setShowBan] = useState(false);
  const [showUnban, setShowUnban] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showImpersonate, setShowImpersonate] = useState(false);
  const isBanned = !!user.banned;
  const isMe = isCurrentUser(session, user.id);

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

      <EditUserDialog
        user={user}
        open={showEdit}
        onOpenChange={setShowEdit}
        onSuccess={() => router.refresh()}
      />
      <ResetPasswordDialog
        user={user}
        open={showReset}
        onOpenChange={setShowReset}
        onSuccess={() => router.refresh()}
      />
      <BanUserDialog
        userId={user.id}
        userName={user.name}
        open={showBan}
        onOpenChange={setShowBan}
        onSuccess={() => router.refresh()}
      />
      <UnbanUserDialog
        userId={user.id}
        userName={user.name}
        open={showUnban}
        onOpenChange={setShowUnban}
        onSuccess={() => router.refresh()}
      />
      <DeleteUserDialog
        userId={user.id}
        userName={user.name}
        open={showDelete}
        onOpenChange={setShowDelete}
        onSuccess={() => router.refresh()}
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
