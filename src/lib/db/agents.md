# Database Module (src/lib/db/)

Prisma v7 PostgreSQL connection (singleton via `globalThis` to survive Next.js HMR). Configured with `@prisma/adapter-pg` driver adapter.

---

## 💎 Golden Rules

- **Actions-Only Access**: `prisma.*` operations strictly restricted to Server Actions (`.action.ts`). Never call in pages, layouts, components.
- **Use Generated Enums**: Import generated Prisma enums from `@/lib/db/generated/enums`. No hardcoded string union types.
- **Always Validate OrderBy**: Apply allowlist validation to any `orderBy` query param before Prisma.

---

## 📂 Files

- `prisma.ts` — PrismaClient singleton using `PrismaPg` adapter.
- `index.ts` — Barrel file: `export { prisma } from "./prisma"`.
- `generated/client` — Auto-generated client core.
- `generated/enums` — Auto-generated enum types (import enums from here).

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

### Setup Commands
- `pnpm prisma db seed` (or `npm run db:seed`) — Seeds DB with initial admin user.
- `npm run db:studio` — Opens Prisma Studio (defaults `localhost:5555`).
- `npx prisma generate` — Regenerates Prisma Client after schema changes.
- `npx prisma migrate dev --name <name>` — Generates + applies new migration.

### Database Local Docker Setup
- `docker compose up -d` — Starts PostgreSQL local container on port `5433`.
- `docker compose down` — Stops the PostgreSQL container.
