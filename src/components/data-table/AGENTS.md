# Data Table Module (src/components/data-table/)

Reusable server-side data table on `@tanstack/react-table` + state sync via `nuqs`. Pagination, sorting, filtering = server-side only.

---

## 💎 Golden Rules

- **Server-Side Only**: Never fetch/load full dataset on client. Paginate, search, sort on DB layer.
- **Canonical Slots**:
  - `toolbar` (left-aligned): Search fields, filters, facets.
  - `tableActions` (right-aligned): Main CTAs ("New User", "Export").
- **Atomic URL transitions**: When search, filters, sorting, or page size logically return the result set to its beginning, update the changed keys and `page: 1` together with `useQueryStates`.
- **Canonical Effective Page**: A paginated list action returns the effective page after counting results. If the requested page is outside the result set (including an empty result set), the route canonicalizes the URL with a guarded server `redirect(..., "replace")` before rendering so rows, labels, controls, and URL agree.
- **Navigation History**: Use `history: "push"` for discrete table navigation such as pagination, selects, clearing filters, and sorting. Keep debounced keystrokes on the default `replace` behavior so browser history remains useful.
- **Explicit Search Contract**: Keep searchable fields in the domain query; never derive search semantics from visible columns.
- **Bounded Search**: Keep a domain search length limit in one shared constant, enforce it in the server schema, and normalize the client input (including pasted/manual URL values) before writing URL state. Keep the toolbar available when server validation reports an invalid query.
- **Strict Sort Validation**: Validate direction and supported `orderBy` fields on the server before building the Prisma query.
- **View Options Labels**: Column visibility is generic UI state, but user-facing labels belong to the domain. Opt a column in with explicit `meta.label`; keep technical column IDs stable and disable hiding for action columns.
- **Wide Table Containment**: Keep `min-w-max` on wide tables when readability requires it, but ensure the nearest flex item that owns the content area has `min-w-0`. Horizontal scrolling belongs to the table container, not the document.
- **Hydration-Stable Domain Meta**: Permission-gated table actions and cells must receive request-stable role/current-user context from the protected Server Component, using serializable props and `DataTable`'s `meta` option. Do not derive their initial presence from an asynchronously hydrated client session hook.

---

## 📂 Files

- `data-table.tsx` (client) — Core table renderer.
- `data-table-pagination.tsx` (client) — Page controls (10/15/20/30/40/50 size selector) synced with URL search params.
- `data-table-pagination-utils.ts` (shared) — Pure effective-page/range calculation for zero results and defensive page clamping.
- `data-table-column-header.tsx` (client) — Sortable headers. Sort state fetched + synced via parsers from `data-table-base-search-params.ts`.
- `data-table-view-options.tsx` (client) — Opt-in column visibility using domain labels from column metadata.
- `data-table-base-search-params.ts` (shared) — Reusable `nuqs` search param defs (`page`, `pageSize`, `search`, `orderBy`, `order`).
- `data-table-constants.ts` (shared) — Pagination and search limits reused by URL parsers, client normalization, and server validation.
- `data-table-types.ts` (shared) — Metadata contract for generic table capabilities.

---

## 🛠️ Step-by-Step Table Implementation

### 1. Define URL Search Parameters
Create `src/components/<domain>/<name>-search-params.ts` extending base params:
```typescript
import { parseAsStringEnum } from "nuqs/server";
import {
  orderByParser,
  orderParser,
  pageParser,
  pageSizeParser,
  searchParser,
} from "@/components/data-table/data-table-base-search-params";

export { pageParser, pageSizeParser, searchParser, orderByParser, orderParser };
export const roleParser = parseAsStringEnum(["admin", "user"]);
```

### 2. Define Table Columns
When the row DTO is reused by columns, actions, or dialogs, define it in a neutral domain file such as `<name>-table-types.ts`. Keep columns in `src/components/<domain>/<name>-columns.tsx` and use `DataTableColumnHeader`:
```typescript
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { UserTableRow } from "./users-table-types";

export const usersColumns: ColumnDef<UserTableRow>[] = [
  {
    accessorKey: "name",
    meta: { label: "Nome" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
  },
  {
    accessorKey: "email",
    meta: { label: "E-mail" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="E-mail" />,
  },
];
```

### 3. Create the Server Page
Create `src/app/dashboard/<path>/page.tsx`. Keep page clean. Secure via `requireSession`, use `createSearchParamsCache` to parse search params on server:
```typescript
import { createSearchParamsCache } from "nuqs/server";
import { Suspense } from "react";
import { listUsersAction } from "@/actions/list-users.action";
import { DataTable } from "@/components/data-table/data-table";
import { requireSession } from "@/lib/auth/require-session";
import {
  CreateUsersButton,
  UsersDataTableToolbar,
  usersColumns,
} from "@/components/users";
import {
  orderByParser,
  orderParser,
  pageParser,
  pageSizeParser,
  roleParser,
  searchParser,
} from "@/components/users/users-search-params";

const searchParamsCache = createSearchParamsCache({
  search: searchParser, page: pageParser, pageSize: pageSizeParser,
  orderBy: orderByParser, order: orderParser, role: roleParser,
});

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  // Enforces list user permissions on server route
  await requireSession([{ resource: "user", action: ["list"] }]);

  return (
    <div className="space-y-6">
      <h1>Users Management</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-md bg-muted" />}>
        <UsersTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function UsersTable({ searchParams }: PageProps) {
  const params = searchParamsCache.parse(await searchParams);
  const result = await listUsersAction(params);

  if (!result.success || !result.data) {
    return <div className="text-destructive">{result.success ? "" : result.error.message}</div>;
  }

  const { users, total, pageCount } = result.data;

  return (
    <DataTable
      columns={usersColumns}
      data={users}
      pageCount={pageCount}
      totalCount={total}
      toolbar={<UsersDataTableToolbar />}
      tableActions={<CreateUsersButton />}
    />
  );
}
```
