# Errors Module (src/lib/errors/)

Return contract for all Server Actions: `ActionResponse<T>` type + `ActionErrorCode` taxonomy.

---

## 💎 Golden Rules

- **Use ActionResponse**: All Server Actions return `Promise<ActionResponse<T>>`. Never throw raw class-based errors (e.g. `AppError`, `NotFoundError`) to client.
- **Enforce Code Taxonomy**: Classify failures via predefined `ActionErrorCode` union.
- **Client Messages in Portuguese**: `error.message` to client in PT-BR (consumed directly by UI toasts).

---

## 📂 Files

- `index.ts` — Defines `ActionResponse<T>` type + `ActionErrorCode` enum/type.

---

## 🛠️ ActionResponse Type

```typescript
export type ActionErrorCode =
  | "VALIDATION"   // Zod validation failures
  | "UNAUTHORIZED" // Missing or expired sessions
  | "FORBIDDEN"    // Permission validation failures
  | "NOT_FOUND"    // Requested resource does not exist
  | "CONFLICT"     // Uniqueness or constraint violations
  | "INTERNAL";    // Uncaught unexpected server exceptions

export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: { message: string; code: ActionErrorCode } };
```

---

## 🛠️ Implementation Patterns

### Standard Error Response Flow
Return structured envelope via early returns. Use `validateInput` + `actionError` helpers for validation + internal error handling:

```typescript
import { validateInput, actionError } from "@/lib/actions/action-helpers";
import type { ActionResponse } from "@/lib/errors";

export async function processItemAction(input: unknown): Promise<ActionResponse<{ id: string }>> {
  const validated = validateInput(MySchema, input);
  if (!validated.ok) return validated.error; // Returns VALIDATION error code

  if (validated.data.quantity <= 0) {
    return {
      success: false,
      error: { message: "A quantidade deve ser maior que zero.", code: "CONFLICT" },
    };
  }

  try {
    const item = await prisma.item.create({ data: validated.data });
    return { success: true as const, data: { id: item.id } };
  } catch (error) {
    return actionError(error, "processItemAction:"); // Logs error and returns INTERNAL error code
  }
}
```
