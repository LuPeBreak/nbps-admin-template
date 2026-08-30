"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import type { Role } from "@/lib/db/generated/enums";
import { CreateUserDialog } from "./create-user-dialog";

interface CreateUsersButtonProps {
  role: Role;
}

export function CreateUsersButton({ role }: CreateUsersButtonProps) {
  const [open, setOpen] = useState(false);

  const canCreate = authClient.admin.checkRolePermission({
    role,
    permissions: { user: ["create"] },
  });

  if (!canCreate) return null;

  return (
    <>
      <Button onClick={() => setOpen(true)}>Novo Usuário</Button>
      <CreateUserDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
