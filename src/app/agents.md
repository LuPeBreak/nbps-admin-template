# App Module (src/app/)

Next.js App Router (pages, layouts, API routes, error boundaries). Strictly **routing shell**. All concrete UI, forms, dialogs, layout compositions → `src/components/`.

---

## 💎 Golden Rules

- **Routing Shell Only**: Never complex UI logic, state, forms inside `src/app/`. Import components from `src/components/` + compose.
- **Default Page Exports**: Export all Page + Layout as `default` of named functions using `Page` or `Layout` suffix (e.g., `export default function DashboardPage()`).
- **Server Components by Default**: All layouts + pages = Server Components. Extract interactive parts (forms, dialogs, button lists) as Client Components (`"use client"`) inside `src/components/`.
- **Use requireSession**: Protect pages + layouts via `requireSession(permissions?)` at top of component.
- **Async Params**: In Next.js 16, `params` and `searchParams` are `Promise` types — always `await` them before use (e.g., `const resolvedParams = await params`).

---

## 📂 File Types Mapping

Only Next.js-recognized files live here:

| File | Type | Purpose |
|:---|:---|:---|
| `layout.tsx` | Next.js | Shared layout wrapper (providers, core shell) |
| `page.tsx` | Next.js | Route entry point |
| `loading.tsx` | Next.js | Suspense loading fallback |
| `error.tsx` | Next.js | Error boundary (must be `"use client"`) |
| `not-found.tsx` | Next.js | 404 handler component |
| `route.ts` | Next.js | Custom API Route Handler (GET, POST, etc.) |

*Note: `proxy.ts` (Next.js Edge Middleware proxy) lives in `src/proxy.ts` (root of `src/`), not `src/app/`.*

---

## 🛡️ Route Protection and Verification Flow

Route security = double-layer protection:

1. **Proxy Layer (`src/proxy.ts`)**: Checks active sessions against DB via `auth.api.getSession`. Unauth → redirect to `/sign-in` from private routes. Logged-in → redirect to `/dashboard` from auth routes.
2. **Page Layer (`page.tsx` / `layout.tsx`)**: Calls `requireSession` helper. Fetches user data, optionally redirects users lacking permissions → `/dashboard`.

---

## 🛠️ Implementation Patterns

### Adding a New Protected Page
Create `src/app/dashboard/reports/page.tsx`, call `requireSession` at top:

```typescript
import { requireSession } from "@/lib/auth/require-session";
import { UserReport } from "@/components/reports/user-report";

export default async function ReportsPage() {
  // Protects the route and enforces permissions
  const session = await requireSession([{ resource: "menu", action: ["users"] }]);

  return (
    <div className="space-y-6">
      <h1>Reports</h1>
      {/* Compose the thin page shell using domain components */}
      <UserReport userId={session.user.id} />
    </div>
  );
}
```
