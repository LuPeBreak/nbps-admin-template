# Validations Module (src/validations/)

Zod Schemas = single source of truth for input validation. Server (Server Actions input) + client (React Hook Form resolvers).

---

## 💎 Golden Rules

- **Strict Validation**: Every Server Action mutation validates raw inputs via Zod using `validateInput(Schema, input)` before business logic.
- **PascalCase & Suffix Casing**: Export schemas PascalCase ending `Schema`.
- **Derived Input Types**: Export inference types with `Input` suffix.
- **Portuguese Validation Messages**: Error messages in PT-BR for user-friendly UI warnings.

---

## 📂 File Structure

- **One File per Domain**: `[domain].schema.ts` (e.g., `user.schema.ts`, `profile.schema.ts`).
- **No Default Exports**: Always named exports.

---

## 🛠️ Implementation Patterns

### 1. Defining a Schema and Derived Input Type
```typescript
import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email("E-mail inválido."),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

### 2. Using on Server (Server Action)
```typescript
import { validateInput } from "@/lib/actions/action-helpers";
import { CreateUserSchema } from "@/validations/user.schema";

export async function createUserAction(input: unknown) {
  const validated = validateInput(CreateUserSchema, input);
  if (!validated.ok) return validated.error; // Returns auto-formatted validation error Response

  // validated.data is now fully validated and typed
  console.log(validated.data.email);
}
```

### 3. Using on Client (React Hook Form)
```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CreateUserSchema, type CreateUserInput } from "@/validations/user.schema";

const form = useForm<CreateUserInput>({
  resolver: zodResolver(CreateUserSchema),
  defaultValues: { email: "", name: "" },
});
```
