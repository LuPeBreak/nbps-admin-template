<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Quick reference for Next.js 16:
- Middleware now called **Proxy** (`proxy.ts`, not `middleware.ts`). API identical.
- `cookies()` and `headers()` now **async** — always `await` them.
- `params` and `searchParams` in pages/layouts **async**.
- Turbopack default dev bundler.
- Server Actions canonical mutation pattern.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nbps-stack-rules -->
# NBPS Admin Template Golden Rules

Canonical source of truth: global architectural rules, conventions, developer protocol in NBPS Admin Template project.

---

## 💎 Golden Rules

### 1. Data Access & Environment Safety
- **Database Boundary**: `prisma.*` queries restricted **strictly** to Server Actions (`.action.ts`). Never call `prisma.*` inside pages, layouts, UI components.
- **Environment Safety**: Never expose server-side secret keys (e.g. DB credentials, API tokens) in client-side config block of `src/env.ts`.

### 2. Double-Layer Protection Principles
- **Double-Layer Validation**: Enforce strict Zod schema validation server-side for all custom Server Actions, paired with React Hook Form client-side for feedback. Note: Better Auth native client methods (`authClient.admin.*`) handle own validation internally — no duplicate.
- **Double-Layer Permissions**: Enforce authorization checks both layers. Server-side permission check mandatory for real security. Client-side checks strictly to hide/disable UI for UX.

### 3. Code Cleanliness & Modularity
- **Clean Exports**: Named exports for helper components, actions, services. Default exports only for Page + Layout files (Next.js entrypoints).
- **No Barrel Logic**: Never write business logic in barrel/index files (`index.ts`). Strictly re-export only.

### 4. Developer Protocol & Git
- **Step-by-Step Execution**: Implement + test one small feature slice at a time. No mass updates across modules.
- **Clean Commits**: Commit to local branches, merge into `development` fast-forward only (`git merge --ff-only`). Concise English Conventional Commits.
- **No "Fix" Commits**: No quick "fix" messages for bugs introduced same session. Squash, get it right in single atomic commit.
- **Atomic Commits**: One commit = one complete, tested, approved feature slice (Action + UI).
- **After Commit = Done**: Commit = production quality. No "commit now, fix later."
- **Human Approval**: Never commit without explicit human approval of diff.
- **Pre-commit Verification**: Run `pnpm check` (or `npm run check`) (Biome format/lint + TypeScript check) before review. Code clean, type-safe. Never `--no-verify`.

---

## 🚫 Common AI Anti-Patterns to Avoid
1. **Renaming Proxy**: Never rename `src/proxy.ts` to `middleware.ts` or create traditional middleware.
2. **Components in App Folder**: `src/app/` folder exclusively for routing (Page/Layout files). All UI components live in `src/components/`.
3. **Full-Page Client Components**: Never mark entire pages/layouts `"use client"`. Keep Server Components, extract interactive nodes as small client components. The only exception is `error.tsx`, which must be a Client Component.
4. **Hardcoded Hex Colors**: Never custom hex colors (e.g. `bg-[#ff0000]`) in Tailwind/JSX. Always semantic CSS variables in `globals.css`.
5. **Overengineering & Complexity**: Simple, readable code. No complex abstractions when direct native solutions exist.
6. **Duplicated Logic**: No duplicate utility functions/helpers. If shared, extract to utility file (e.g. `src/lib/utils/`).
7. **Outdated API Patterns**: Respect configured versions: Next.js 16, Prisma 7, Better Auth 1.x, Tailwind CSS v4. No legacy patterns.

---

## 🗺️ Module agents.md Index

When editing code in specific folders, **MUST** read local `agents.md` in that directory for design patterns + details:

| Module | Path | Description & Focus |
|:---|:---|:---|
| **App Routing** | `src/app/agents.md` | Layouts, Pages structure, proxy routing rules |
| **Database** | `src/lib/db/agents.md` | Prisma setup, adapter client, seeds, migrations |
| **Authentication** | `src/lib/auth/agents.md` | Better Auth configuration, RBAC permissions, requireSession |
| **Email Service** | `src/lib/email/agents.md` | SMTP setup, templates using React Email |
| **Error Contract** | `src/lib/errors/agents.md` | Response contracts, action error code taxonomy |
| **Action Helpers** | `src/lib/actions/agents.md` | validateInput, actionError shared utilities |
| **Validations** | `src/validations/agents.md` | Zod schema patterns, Single Source of Truth |
| **Server Actions** | `src/actions/agents.md` | Action templates, validateInput, actionError wrappers |
| **UI Components** | `src/components/agents.md` | General components, hooks (useActionDialog), styling |
| ↳ **Sidebar** | `src/components/sidebar/agents.md` | Navigation rendering and permission checks |
| ↳ **Data Table** | `src/components/data-table/agents.md` | Sorting/Filtering, Nuqs URL synchronization |
<!-- END:nbps-stack-rules -->
