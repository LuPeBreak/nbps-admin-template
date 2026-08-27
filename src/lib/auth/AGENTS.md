# Auth Module (src/lib/auth/)

Configures Better Auth (Admin plugin, Prisma adapter, RBAC) + utilities to secure routes, server actions, UI elements.

---

## 💎 Golden Rules

- **Use requireSession**: `requireSession(permissions?)` at top of protected layouts/pages. Handles session validation + auto-redirects.
- **Client-Side UX Checks**: `authClient.admin.checkRolePermission` (sync, in-memory) strictly for show/hide/disable UI. Never call async `hasPermission` on client.
- **Double-Layer Check**: Client checks = UX only. Server validation via `protectedAction` (custom actions) or `requireSession` (pages) mandatory for security. Better Auth native client methods (`authClient.admin.*`) handle own server-side validation.
- **No Direct Fetching**: Never `fetch("/api/auth/...")`. Use Better Auth client methods only.

---

## 📂 Files

- `auth.tsx` — Server-side Better Auth instance. Prisma adapter + Admin plugin + console/SMTP mailer callbacks.
- `auth-client.ts` — Client hooks (`useSession`, `signIn`, `signUp`, `signOut`) + admin client.
- `permissions.ts` — Single source of truth for RBAC. Roles, permissions, static `hasPermission` helper.
- `protected-action.ts` — HOF wrapper: validate sessions + permissions in Server Actions.
- `require-session.ts` — Server Component helper. Fetch session + redirect to `/sign-in` (or `/dashboard` if permissions fail).
- `translate-auth-error.ts` — Translate Better Auth string errors to Portuguese.
- `password-generator.ts` — Random passwords for new users.

---

## 🌐 Proxy Pattern & Config (`src/proxy.ts`)

Proxy validates session by querying DB (`auth.api.getSession`), not just cookie presence. Prevents redirect loops when cookie exists but session revoked or DB reset.

---

## 🔐 Permission Check Patterns

### 1. Server-Side Protection (Pages & Layouts)
`requireSession` at top of Server Component. Auto-redirects unauthenticated → `/sign-in`, unauthorized → `/dashboard`. Full page recipe: see `src/app/AGENTS.md`.

```typescript
const session = await requireSession([{ resource: "user", action: ["list"] }]);
```

### 2. Client-Side UX Toggle (Buttons & Tabs)
Sync in-memory role check via `authClient.admin.checkRolePermission` — hide/disable when denied, never async network checks. Full UI patterns (buttons, row-action dropdowns): see `src/components/AGENTS.md`.

### 3. Adding a New Permission or Role
Modify `src/lib/auth/permissions.ts`:
1. Add resource + actions to `statement`:
   ```typescript
   const statement = {
     ...defaultStatements,
     posts: ["create", "read", "update", "delete"],
   } as const;
   ```
2. Assign permissions to roles:
   ```typescript
   export const user = ac.newRole({ ...userAc.statements, posts: ["read"] });
   export const admin = ac.newRole({ ...adminAc.statements, posts: ["create", "read", "update", "delete"] });
   ```
3. Update `rolePermissions` map.

---

## 🛡️ Cloudflare IPs & Trusted Proxies

Better Auth resolves client IP via `X-Forwarded-For`. Behind reverse proxies (Cloudflare, Coolify), configure `trustedProxies` in `auth.tsx` so rate-limiting not aggregated under single proxy IP.

Example in `src/lib/auth/auth.tsx`:
```typescript
export const auth = betterAuth({
  advanced: {
    ipAddress: {
      // Cloudflare IP ranges
      trustedProxies: [
        "173.245.48.0/20",
        "103.21.244.0/22",
        "103.22.200.0/22",
        "103.31.4.0/22",
        "141.101.64.0/18",
        // ... see official provider docs
      ],
    },
  },
});
```

Keep IP range list in `auth.tsx` synced when migrating providers.
