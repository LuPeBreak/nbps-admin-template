# Action Helpers (src/lib/actions/)

Shared utilities for Server Actions — input validation + centralized error handling.

---

## Golden Rules

- **Use validateInput**: Validate raw action inputs via `validateInput(Schema, input)` before business logic. Never `schema.safeParse` directly.
- **Use actionError**: Catch unexpected errors via `actionError(error, context)`. Never return raw DB errors to client.
- **No Barrel Logic**: Module exports helpers only. No business logic.

---

## Files

- `action-helpers.ts` — Exports `validateInput` + `actionError`.

---

## Implementation Patterns

### 1. validateInput
Wraps Zod `safeParse`, returns discriminated union:

```typescript
import { validateInput } from "@/lib/actions/action-helpers";
import { MySchema } from "@/validations/my.schema";

const result = validateInput(MySchema, rawInput);
if (!result.ok) return result.error; // ActionResponse with VALIDATION code

// result.data is fully typed
```

- Returns `{ ok: true, data: T }` on success.
- Returns `{ ok: false, error: ActionResponse }` on failure — ready to return directly from action.

### 2. actionError
Catches unexpected errors, returns safe `ActionResponse`:

```typescript
import { actionError } from "@/lib/actions/action-helpers";

try {
  const item = await prisma.item.create({ data });
  return { success: true as const, data: { id: item.id } };
} catch (error) {
  return actionError(error, "createItemAction:");
}
```

- Logs error to console with provided context prefix.
- Always returns `{ success: false, error: { message: "Erro interno.", code: "INTERNAL" } }`.
- Never exposes stack traces or DB details to client.
