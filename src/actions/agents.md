# Server Actions Module (src/actions/)

Server Actions handle data mutations + queries. All `prisma.*` operations must run inside an action — never directly in layouts, pages, components.

---

## 💎 Golden Rules

- **One Action per File**: `[verb]-[resource].action.ts` (e.g., `delete-user.action.ts`).
- **Use Action Helpers**: Never manually format Zod parse errors or write custom try-catch returning DB errors. Use `validateInput` + `actionError`.
- **Don't Duplicate Better Auth**: Never custom Server Actions duplicating Better Auth native client methods (profile updates, password resets, user management). Call Better Auth methods directly.
- **Return Type**: Every action returns `Promise<ActionResponse<T>>`.

---

## 🛠️ Implementation Patterns

### 1. Private Mutation Action (Zod + Permission checks)
Write operations (create, update, delete) requiring auth:

```typescript
"use server";

import { validateInput, actionError } from "@/lib/actions/action-helpers";
import { protectedAction } from "@/lib/auth/protected-action";
import { prisma } from "@/lib/db";
import type { ActionResponse } from "@/lib/errors";
import { UpdateItemSchema } from "@/validations/item.schema";

export const updateItemAction = protectedAction(
  [{ resource: "item", action: ["update"] }],
  async (_session, input: unknown): Promise<ActionResponse<{ id: string }>> => {
    // 1. Validate Input
    const validated = validateInput(UpdateItemSchema, input);
    if (!validated.ok) return validated.error;

    // 2. Business Logic & DB queries
    try {
      const updated = await prisma.item.update({
        where: { id: validated.data.itemId },
        data: { name: validated.data.name },
      });
      return { success: true as const, data: { id: updated.id } };
    } catch (error) {
      // 3. Centralized Error Formatting
      return actionError(error, "updateItemAction:");
    }
  },
);
```

### 2. Private Query List Action (Zod Validation)
Listing with pagination, search, sorting. Every query action validates params with Zod via `validateInput` to coerce types, enforce ordering allowlists, enforce paging limits (e.g. `max(100)` for `pageSize`) — prevents resource exhaustion (DoS/Wallet) attacks:

```typescript
"use server";

import { validateInput, actionError } from "@/lib/actions/action-helpers";
import { protectedAction } from "@/lib/auth/protected-action";
import { prisma } from "@/lib/db";
import type { ActionResponse } from "@/lib/errors";
import { ListItemsSchema } from "@/validations/item.schema";

export const listItemsAction = protectedAction(
  [{ resource: "item", action: ["list"] }],
  async (
    _session,
    input: unknown,
  ): Promise<
    ActionResponse<{ items: unknown[]; total: number; pageCount: number }>
  > => {
    // 1. Validate query parameters using Zod
    const validated = validateInput(ListItemsSchema, input);
    if (!validated.ok) return validated.error;

    const {
      search = "",
      orderBy = "createdAt",
      order = "desc",
      page,
      pageSize,
    } = validated.data;

    try {
      const where = {
        name: { contains: search, mode: "insensitive" as const },
      };
      const [items, total] = await Promise.all([
        prisma.item.findMany({
          where,
          orderBy: { [orderBy]: order },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.item.count({ where }),
      ]);

      const pageCount = Math.ceil(total / pageSize);
      return { success: true as const, data: { items, total, pageCount } };
    } catch (error) {
      return actionError(error, "listItemsAction:");
    }
  },
);
```

> [!IMPORTANT]
> **Defesa contra exaustão de recursos**: A Zod schema para listagens (`ListItemsSchema`) deve obrigatoriamente usar coerção de números (`z.coerce.number()`) para `page` e `pageSize`, além de um teto rígido de segurança para o tamanho da página (ex: `.max(100)`), impedindo que requisições maliciosas com valores gigantes (ex: `take: 9999999`) causem exaustão de memória no banco de dados.

### 3. Public Action
Public access (public forms, email verification callbacks):

```typescript
"use server";

import { validateInput, actionError } from "@/lib/actions/action-helpers";
import { prisma } from "@/lib/db";
import type { ActionResponse } from "@/lib/errors";
import { PublicFormSchema } from "@/validations/public.schema";

export async function submitPublicFormAction(input: unknown): Promise<ActionResponse<void>> {
  const validated = validateInput(PublicFormSchema, input);
  if (!validated.ok) return validated.error;

  try {
    await prisma.publicSubmission.create({ data: validated.data });
    return { success: true as const, data: undefined };
  } catch (error) {
    return actionError(error, "submitPublicFormAction:");
  }
}
```
