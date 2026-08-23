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
- **Database Boundary**: Restrict application runtime `prisma.*` queries to Server Actions (`.action.ts`). Never call them in pages, layouts, route UI, or components. Dedicated server-only infrastructure files such as seeds, migrations, and framework adapter configuration are explicit exceptions.
- **Environment Safety**: Never expose server-side secret keys (DB credentials, API tokens, SMTP credentials) in client-side config block of `src/env.ts` or in logs and reports.

### 2. Double-Layer Protection Principles
- **Double-Layer Validation**: Strict Zod schema validation server-side for all custom Server Actions, paired with React Hook Form client-side for feedback. Note: Better Auth native client methods (`authClient.admin.*`) handle own validation internally — no duplicate.
- **Double-Layer Permissions**: Enforce authorization checks in both layers. Server-side checks are mandatory for security. Client-side checks strictly hide or disable UI for UX.

### 3. Code Cleanliness & Modularity
- **Clean Exports**: Named exports for helper components, actions, services. Default exports only for Next.js file-convention entrypoints (`page`, `layout`, `error`, `not-found`, `loading`); `route.ts` exports named HTTP method handlers.
- **No Barrel Logic**: Never place business logic in barrel/index files (`index.ts`). Re-export symbols only.

### 4. Developer Protocol & Git
- **Step-by-Step Execution**: Implement + test one small feature slice at a time. No mass code updates across modules. A cross-module documentation-only consistency pass counts as its own slice.
- **Doc Pass**: A material code change updates the owning module's `AGENTS.md` in the same PR. Before editing, walk root `AGENTS.md` → nearest nested `AGENTS.md` → actual code.
- **Instruction Precedence**: Nested `AGENTS.md` files specialize the root; they never weaken it. Conflicts are declared exceptions with reason, never silent overrides.
- **Git Workflow**: One feature branch per PR. Integration happens exclusively via squash merge into `main`. One PR = one complete, tested, approved feature slice; the squash commit message describes the delivered slice concisely (single-line subject preferred) and never concatenates checkpoint commit messages. Concise English Conventional Commits.
- **Checkpoint Commits**: On a feature branch, intermediate commits are reversible work checkpoints (implementation, tests, fixes, cleanup). Each checkpoint must stay coherent enough for revert, diagnosis and review; never use them to hide broken tests or known debt as "commit now, fix later".
- **Atomicity at Integration**: Quality gates concentrate before the squash merge: green CI, relevant verification executed, and human approval of the full branch diff.
- **Separate Capabilities**: Commit, push and merge have independent gates. Never assume one grants another. Never rewrite published/shared history (force-push) without explicit authorization.
- **Human Approval**: Pushing a branch/opening its PR, marking the PR ready, and squash-merging are separate gates, each requiring explicit human approval of the current full branch diff. Checkpoint commits inside a feature branch need no per-commit approval during an authorized task; they are reviewed collectively at these gates.
- **Command Classification** (source of truth: `package.json`; never invent scripts):
  - **Read-only checks** (never write tracked source; may refresh gitignored caches such as `.tsbuildinfo`): `pnpm lint` (`biome check`), `pnpm typecheck` (`tsc --noEmit`), `pnpm test` (`vitest run`).
  - **Mutants** (rewrite any file selected by `biome.json`, including configs outside `src/`; `src/components/ui` stays excluded): `pnpm check` (= `biome check --write` + typecheck) and `pnpm format`. Never treat them as verification; run only when the rewrite is intended, then inspect the resulting diff.
  - **Artifact-generating**: `pnpm build` writes gitignored output only; run when routes, config, or bundling are affected.
  - **Stateful**: `db:studio`, `db:seed` touch database/dev services; require explicit environment and authorization. `db:seed` targets the `DATABASE_URL` database and creates the initial admin account only when no user exists with `ADMIN_EMAIL`; the created account gets `emailVerified: true` and existing accounts are left untouched — local/dev only; never log or report credentials.
- **Pre-commit Verification**: Before review, run the read-only checks relevant to the change plus tests covering changed behavior. Never `--no-verify`.
- **Evidence Reporting**: Report verification honestly: exact command + directory + result; relevant tests chosen; manual checks performed; omissions with reason; files auto-modified by tools; final working-tree state; anything outside scope. Never claim verification that did not run.
- **Test Scope**:
  - Run existing relevant tests for every behavior change.
  - Add or update tests for business rules, permissions, validation, bug fixes when test infrastructure exists.
  - Doc-only or visual-only changes require no new automated tests unless they alter behavior.
  - If no relevant test command or infrastructure exists, state that explicitly instead of claiming the change is fully tested.

### 5. Efficient Agent Communication
- No repeating user request, generic intros, praise, filler.
- During implementation, communicate only material info:
  - decisions affecting solution;
  - blockers or unresolved ambiguity;
  - relevant risks or assumptions;
  - files or behavior changed;
  - verification performed + failures found.
- Concise by default, but explain tradeoffs, security concerns, architecture decisions, non-obvious behavior when they affect correctness.
- No hiding uncertainty, skipped verification, test failures, implementation risks to keep response short.
- No file-by-file narration when grouped summary sufficient.

### 6. Ambiguity & Blockers
- First inspect relevant code, docs, and local `AGENTS.md`; do not ask questions the repository already answers.
- Stop and ask one focused question before proceeding when ambiguity could materially affect:
  - security or permissions;
  - user-visible behavior or acceptance criteria;
  - database schema, migrations, or data loss;
  - irreversible operations;
  - production dependency choices;
  - architectural direction;
  - scope beyond requested feature slice.
- For minor implementation details, choose the smallest conservative interpretation that does not introduce new behavior, state the assumption briefly, and continue.
- If verification is blocked by the environment, report what could not be run and why.

### 7. Minimal Complete Implementation
Before writing new code:

1. Identify exact requirement or acceptance criterion requiring change.
2. Read relevant local `AGENTS.md` + inspect existing implementation.
3. Reuse existing project pattern when already satisfies requirement.
4. Prefer native framework/platform capabilities + dependencies already installed.
5. Avoid new dependencies, wrappers, layers, abstractions unless they solve current, demonstrated need.
6. Implement smallest clear solution that fully satisfies requirement.
7. Keep change limited to requested feature slice.

Minimal code must never weaken or omit:

- server-side authorization;
- server-side validation;
- error handling;
- data consistency + required transactions;
- environment and secret safety;
- accessibility;
- type safety;
- required tests and verification;
- established architectural rules.

When simplicity conflicts with correctness, security, or project conventions, correctness and project conventions take precedence.

Before concluding:

- remove code made unnecessary by final solution;
- check for duplicated logic introduced by change;
- confirm no speculative abstraction/dependency added;
- confirm change did not expand requested scope.

---

## 🚫 Common AI Anti-Patterns to Avoid
1. **Renaming Proxy**: Never rename `src/proxy.ts` to `middleware.ts`, create traditional middleware, or assume Edge runtime for Proxy (it defaults to Node.js in Next.js 16).
2. **Components in App Folder**: `src/app/` exclusively for routing (Page/Layout). All reusable UI components → `src/components/`.
3. **Full-Page Client Components**: Never mark entire pages/layouts `"use client"`. Keep Server Components, extract interactive nodes as small Client Components. Only exception: `error.tsx` must be Client Component.
4. **Hardcoded Hex Colors**: Never custom hex (e.g. `bg-[#ff0000]`) in Tailwind/JSX. Use semantic CSS variables in `globals.css`.
5. **Outdated API Patterns**: Respect configured versions: Next.js 16, Prisma 7, Better Auth 1.x, Tailwind CSS v4, Base UI. No legacy patterns.

---

## 🗺️ Module AGENTS.md Index

When editing code in specific folders, **MUST** read local `AGENTS.md` in that directory for design patterns + details (nested files inherit the root guide and may only make rules stricter):

| Module | Path | Description & Focus |
|:---|:---|:---|
| **App Routing** | `src/app/AGENTS.md` | Layouts, Pages structure, proxy routing rules |
| **Database** | `src/lib/db/AGENTS.md` | Prisma setup, adapter client, seeds, migrations |
| **Authentication** | `src/lib/auth/AGENTS.md` | Better Auth configuration, RBAC permissions, requireSession |
| **Email Service** | `src/lib/email/AGENTS.md` | SMTP setup, templates using React Email |
| **Error Contract** | `src/lib/errors/AGENTS.md` | Response contracts, action error code taxonomy |
| **Action Helpers** | `src/lib/actions/AGENTS.md` | validateInput, actionError shared utilities |
| **Validations** | `src/validations/AGENTS.md` | Zod schema patterns, Single Source of Truth |
| **Server Actions** | `src/actions/AGENTS.md` | Action templates, validateInput, actionError wrappers |
| **UI Components** | `src/components/AGENTS.md` | General components, hooks (`useDialogAction`), styling |
| ↳ **Sidebar** | `src/components/sidebar/AGENTS.md` | Navigation rendering and permission checks |
| ↳ **Data Table** | `src/components/data-table/AGENTS.md` | Sorting/Filtering, Nuqs URL synchronization |
<!-- END:nbps-stack-rules -->
