# Components Module (src/components/)

Reusable UI components (Shadcn UI style + Tailwind CSS v4). Uses Base UI primitives instead of Radix (no `asChild` prop).

---

## 💎 Golden Rules

- **Use CSS Variables**: Style via semantic CSS variables in `globals.css` (e.g., `bg-background`, `text-foreground`). No hardcoded hex colors.
- **Use Dialog Helpers**: Modals + admin dialogs executing server mutations → use `useDialogAction` hook. Manages loading, toasts, refresh, modal dismiss.
- **Named Exports**: Named exports for all helper components.
- **Keep Pages Clean**: Components → `src/components/`. `src/app/` strictly Next.js routing.
- **Client-Side Permission Checks**: Action buttons (e.g. create) + table dropdowns (row actions) must verify permissions client-side for solid UX. Sync check via `authClient.admin.checkRolePermission`. Hide/disable unauthorized; hide entire dropdown cell if all actions restricted.

---

## 📂 Directories

- `ui/` — Low-level primitive components via Shadcn UI (excluded from Biome checks).
- `auth/` — Auth forms (e.g., `SignInForm`, `ForgotPasswordForm`).
- `dashboard/` — Server-side dashboard shell, headers, banners.
- `data-table/` — Core DataTable, pagination, URL sync.
- `sidebar/` — Sidebar with server-side in-memory permission filtering.
- `users/` — Admin components (edit/delete/ban dialogs, row actions, columns).

---

## 🛠️ Implementation Patterns

### 1. Dialog Orchestration with `useDialogAction`
Simple buttons or confirmation dialogs invoking Server Actions → use `useDialogAction`:

```typescript
import { deleteUserAction } from "@/actions/delete-user.action";
import { useDialogAction } from "@/lib/use-dialog-action";

interface DeleteUserDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteUserDialog({
  userId,
  open,
  onOpenChange,
  onSuccess,
}: DeleteUserDialogProps) {
  const { loading, execute } = useDialogAction({
    successMessage: "Usuário excluído.",
    onSuccess,
  });

  async function handleDelete() {
    const ok = await execute(() => deleteUserAction({ userId }));
    if (ok) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button onClick={handleDelete} disabled={loading}>
        {loading ? "Excluindo..." : "Excluir"}
      </Button>
    </Dialog>
  );
}
```

### 2. Identity Check helper
```typescript
import { useSession } from "@/lib/auth";
import { isCurrentUser } from "@/lib/user-helpers";

const { data: session } = useSession();
const isMe = isCurrentUser(session, user.id);
```

### 3. Client-Side Permission Checks (UX Toggle)
Actions requiring specific resource permissions → sync client check:

```typescript
import { authClient, useSession } from "@/lib/auth";

export function CreateItemButton() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (!role) return null;

  const canCreate = authClient.admin.checkRolePermission({
    role,
    permissions: { item: ["create"] },
  });

  if (!canCreate) return null;

  return <Button>Criar Item</Button>;
}
```

Table actions (row actions): check individual actions, hide dropdown trigger entirely if user has no permissions:

```typescript
export function ItemRowActions({ item }) {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (!role) return null;

  const canEdit = authClient.admin.checkRolePermission({ role, permissions: { item: ["update"] } });
  const canDelete = authClient.admin.checkRolePermission({ role, permissions: { item: ["delete"] } });

  if (!canEdit && !canDelete) return null; // Hide dropdown trigger completely

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Ações</DropdownMenuTrigger>
      <DropdownMenuContent>
        {canEdit && <DropdownMenuItem>Editar</DropdownMenuItem>}
        {canDelete && <DropdownMenuItem>Excluir</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 🚫 Common AI Anti-Patterns to Avoid
1. **Prisma in UI**: Never `prisma.*` in UI components. Use Server Actions.
2. **Hardcoding Colors**: Avoid `bg-[#001122]`. Use Tailwind theme tokens.
3. **Slow / Async Client Permissions**: Never `authClient.admin.hasPermission` or async network in client components for layout permissions. Always sync in-memory `authClient.admin.checkRolePermission({ role, permissions })`.
