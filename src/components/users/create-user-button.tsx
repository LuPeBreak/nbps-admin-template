"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth";
import type { Role } from "@/lib/db/generated/enums";
import { CreateUserDialog } from "./create-user-dialog";

export function CreateUsersButton() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;

  const canCreate = role
    ? authClient.admin.checkRolePermission({
        role,
        permissions: { user: ["create"] },
      })
    : false;

  if (!canCreate) return null;

  return (
    <>
      <Button onClick={() => setOpen(true)}>Novo Usuário</Button>
      <CreateUserDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
