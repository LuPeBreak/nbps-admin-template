# Data Table Module (src/components/data-table/)

Reusable server-side data table on `@tanstack/react-table` + state sync via `nuqs`. Pagination, sorting, filtering = server-side only.

---

## 💎 Golden Rules

- **Server-Side Only**: Never fetch/load full dataset on client. Paginate, search, sort on DB layer.
- **Canonical Slots**:
  - `toolbar` (left-aligned): Search fields, filters, facets.
  - `tableActions` (right-aligned): Main CTAs ("New User", "Export").
- **Strict Sort validation**: Validate `orderBy` + sort fields against hardcoded string allowlist in Server Action before Prisma query (prevent SQL injection).

---

## 📂 Files

- `data-table.tsx` (client) — Core table renderer.
- `data-table-pagination.tsx` (client) — Page controls (10/15/20/30/40/50 size selector) synced with URL search params.
- `data-table-column-header.tsx` (client) — Sortable headers. Sort state fetched + synced via parsers from `data-table-base-search-params.ts`.
- `data-table-base-search-params.ts` (shared) — Reusable `nuqs` search param defs (`page`, `pageSize`, `search`, `orderBy`, `order`).

---

## 🛠️ Step-by-Step Table Implementation

### 1. Define URL Search Parameters
Create `src/components/<domain>/<name>-search-params.ts` extending base params:
```typescript
import { parseAsString } from "nuqs/server";
import {
  orderByParser,
  orderParser,
  pageParser,
  pageSizeParser,
  searchParser,
} from "@/components/data-table/data-table-base-search-params";

export { pageParser, pageSizeParser, searchParser, orderByParser, orderParser };
export const roleParser = parseAsString.withDefault("");
```

### 2. Define Table Columns
Create `src/components/<domain>/<name>-columns.tsx` using `DataTableColumnHeader`:
```typescript
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

export type UserColumn = { id: string; name: string; email: string };

export const usersColumns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
  },
  {
    accessorKey: "email",
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
import { usersColumns } from "./users-columns";
import {
  orderByParser, orderParser, pageParser, pageSizeParser,
  roleParser, searchParser,
} from "./users-search-params";

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

  if (!result.success) {
    return <div className="text-destructive">{result.error.message}</div>;
  }

  const { items, total, pageCount } = result.data;

  return (
    <DataTable
      columns={usersColumns}
      data={items}
      pageCount={pageCount}
      totalCount={total}
      toolbar={<UsersTableToolbar />}
      tableActions={<CreateUserButton />}
    />
  );
}
```
