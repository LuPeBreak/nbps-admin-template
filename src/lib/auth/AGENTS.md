# Auth Module (src/lib/auth/)

Configures Better Auth (Admin plugin, Prisma adapter, RBAC) + utilities to secure routes, server actions, UI elements.

---

## 💎 Golden Rules

- **Use requireSession**: `requireSession(requirement?)` at top of protected layouts/pages. Handles session validation + auto-redirects.
- **Client-Side UX Checks**: `authClient.admin.checkRolePermission` (sync, in-memory) strictly for show/hide/disable UI. Never call async `hasPermission` on client.
- **Double-Layer Check**: Client checks = UX only. Server validation via `protectedAction` (custom actions) or `requireSession` (pages) mandatory for security. Better Auth native client methods (`authClient.admin.*`) handle own server-side validation.
- **No Direct Fetching**: Never `fetch("/api/auth/...")`. Use Better Auth client methods only.

---

## 📂 Files

- `auth.tsx` — Server-side Better Auth instance. Prisma adapter + Admin plugin + console/SMTP mailer callbacks.
- `auth-client.ts` — Client hooks (`useSession`, `signIn`, `signUp`, `signOut`) + admin client.
- `auth-url.ts` — Shared dynamic base URL policy for authentication and application email links.
- `permissions.ts` — Catalog, shared `ac`/`roles` objects, `isRole` guard and synchronous `hasPermission` capability gate.
- `protected-action.ts` — HOF wrapper: validate sessions + permissions in Server Actions.
- `require-session.ts` — Validates session + role under the current single-role baseline; redirects missing sessions to `/sign-in`, invalid roles to public `/`, and valid roles lacking capabilities to `/dashboard`.
- `translate-auth-error.ts` — Translate Better Auth string errors to Portuguese.
- `password-generator.ts` — Random passwords for new users.

---

## 🌐 Proxy Pattern & Config (`src/proxy.ts`)

Proxy validates session by querying DB (`auth.api.getSession`), not just cookie presence. Prevents redirect loops when cookie exists but session revoked or DB reset.

### Request Origins and Email Links

- `BETTER_AUTH_URL` is the canonical HTTP(S) origin and fallback, including headerless infrastructure calls such as the seed. It no longer overrides an allowed preview request host.
- `createAuthBaseURL` allows the configured canonical host/port. For the canonical NBPS host (`nbps.lupe.dev.br`, without a non-default port), it also allows `*.nbps.lupe.dev.br`. Local development allows only its configured host/port (normally `localhost:3000`); other adopted domains remain exact-host only until their own preview namespace is explicitly configured.
- Better Auth 1.6.23 resolves the forwarded host, Host, then request URL against this allowlist. Unmatched hosts use the canonical fallback; they never become generated link destinations. Protocol is pinned to the canonical URL, not supplied by forwarded headers.
- Keep `advanced.trustedProxyHeaders` and calls to the public `resolveDynamicBaseURL` utility aligned through `authTrustedProxyHeaders`. Application links use that native resolver with `await headers()`; do not concatenate the canonical URL or introduce another host parser.
- Better Auth automatically adds allowed hosts and fallback to trusted origins. This trusts the controlled NBPS subdomain namespace, not arbitrary internet hosts; DNS and proxy ownership of that namespace remains an infrastructure prerequisite. Do not add broad `trustedOrigins`, disable CSRF/origin checks, or enable cross-subdomain cookies. `BETTER_AUTH_TRUSTED_ORIGINS`, if supplied externally, is additive in Better Auth and must remain tightly controlled.
- Reset emails preserve the native `/api/auth/reset-password/<token>` link, which redirects to the relative `/reset-password` UI on the same resolved host. Welcome emails resolve `/sign-in` using the same policy. Cookies remain host-only; HTTPS configuration keeps secure cookies. Secrets and databases remain independent per deployment.
- Native in-memory regression coverage: `pnpm test src/lib/auth/auth-url.test.ts src/lib/auth/auth-wiring.test.ts src/actions/send-welcome-email.action.test.ts`. No real database or SMTP is used.

---

## 🔐 Permission Check Patterns

### 1. Server-Side Protection (Pages & Layouts)
`requireSession` at top of Server Component. Auto-redirects unauthenticated → `/sign-in`, invalid role → public `/`, valid role without permission → `/dashboard`. Public home and Proxy must not redirect `/` back into a protected boundary. Full page recipe: see `src/app/AGENTS.md`.

```typescript
const session = await requireSession({ user: ["list"] });
```

### Shared Capability Contract

- **Current Role Baseline**: NBPS base currently models one role per user (`user | admin`). This is a current baseline limitation, not a permanent architectural prohibition.
- **Requirement-Driven Evolution**: Do not implement multi-role support without a real product requirement. A derived project may expand to multiple roles when needed, provided persistence, session typing, authorization boundaries and tests are adapted consistently with Better Auth.
- **No Partial Multi-Role Support**: Do not partially support comma-separated roles while Prisma still models a single enum role. Under the current baseline, `isRole` accepts only own keys of `roles`. Missing, unknown, multiple, comma-separated and prototype keys are denied; never default an invalid role to `user`.
- `PermissionRequest` derives resources/actions from the catalog and uses nonempty action tuples. `{ user: ["update", "set-role"] }` requires both actions. Multiple resources also use AND.
- `PermissionRequirement` also accepts `{ anyOf: [{ user: ["list"] }, { session: ["revoke"] }] }`: OR across complete AND alternatives. No nesting, native connector objects, or `requireAll` option. Empty or malformed requirements are denied, including an empty alternative inside OR.
- Evaluation uses each configured role object's public `authorize(request).success` API. The shape check does not implement permission matching or the full Admin plugin semantics.
- `protectedAction` and `requireSession` each fetch the session once with request headers, regardless of the number of alternatives. They expose a session with a validated Prisma role. `requireSession()` adds no capability requirement; `requireSession({})` is denied.
- Requirements are chosen by server code, never supplied by a client. A capability gate does not authorize every target object; contextual rules remain in the server domain. See `src/actions/AGENTS.md` for the full own/any condition.

### 2. Client-Side UX Toggle (Buttons & Tabs)
Sync in-memory role check via `authClient.admin.checkRolePermission` — hide/disable when denied, never async network checks. Pass only simple requests to the native client. When UX needs OR, compose `anyOf.some((permissions) => authClient.admin.checkRolePermission({ role, permissions }))`; never send the NBPS wrapper to Better Auth. Full UI patterns (buttons, row-action dropdowns): see `src/components/AGENTS.md`.

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
3. Update the shared `roles` map, exhaustively typed against the Prisma enum. Both Admin plugins receive that same map and `ac`. Preserve `defaultRole: "user"` and `adminRoles: ["admin"]`.

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
