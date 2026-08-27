# Database Module (src/lib/db/)

Prisma v7 PostgreSQL connection (singleton via `globalThis` to survive Next.js HMR). Configured with `@prisma/adapter-pg` driver adapter.

---

## 💎 Golden Rules

- **Use Generated Enums**: Import generated Prisma enums from `@/lib/db/generated/enums`. No hardcoded string union types.

---

## 📂 Files

- `prisma.ts` — PrismaClient singleton using `PrismaPg` adapter.
- `index.ts` — Barrel file: `export { prisma } from "./prisma"`.
- `generated/client.ts` — Auto-generated client core.
- `generated/enums.ts` — Auto-generated enum types (import enums from here).

---

## 🛠️ Implementation Patterns

### 1. Adapter & Connection Configuration
Prisma v7 in `src/lib/db/prisma.ts` using `PrismaPg` adapter + custom-pathed auto-generated `PrismaClient`:
```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/env";
import { PrismaClient } from "@/lib/db/generated/client";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### 2. Importing the Client
```typescript
import { prisma } from "@/lib/db";
```

### 3. Using Generated Enums
```typescript
// ✅ Correct
import type { Role } from "@/lib/db/generated/enums";
const role: Role = "admin";

// ❌ Incorrect
const role: "admin" | "user" = "admin";
```

---

## 💻 Environment & Commands

### Database Commands
- `pnpm db:seed` — Stateful, local/dev only. Targets `DATABASE_URL`; if no user exists with `ADMIN_EMAIL`, creates the initial admin and marks that new account as verified. Existing accounts are left untouched. Confirm the target and authorization first; never report `DATABASE_URL` or `ADMIN_PASSWORD` values.
- `pnpm db:studio` — Stateful. Opens Prisma Studio against the configured database (defaults to `localhost:5555`); confirm the target and authorization first.
- `pnpm prisma generate` — Artifact-generating. Regenerates the ignored Prisma Client in `src/lib/db/generated/` after schema changes; CI runs the same command.
- `pnpm prisma migrate dev --name <name>` — Stateful and artifact-generating. Creates a migration and applies it to the configured development database; confirm the target and migration name first.

### Database Local Docker Setup
- `docker compose up -d` — Stateful. Starts the local PostgreSQL container on port `5433`.
- `docker compose down` — Stateful. Stops the local PostgreSQL container.
