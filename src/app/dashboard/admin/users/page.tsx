import { NuqsAdapter } from "nuqs/adapters/next/app";
import { createSearchParamsCache } from "nuqs/server";
import { Suspense } from "react";
import { listUsersAction } from "@/actions/list-users.action";
import { DashboardPageHeader } from "@/components/dashboard";
import { DataTable } from "@/components/data-table/data-table";
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
import { requireSession } from "@/lib/auth/require-session";

function validRole(
  role: string | null | undefined,
): "admin" | "user" | undefined {
  if (role === "admin" || role === "user") return role;
  return undefined;
}

const searchParamsCache = createSearchParamsCache({
  search: searchParser,
  page: pageParser,
  pageSize: pageSizeParser,
  orderBy: orderByParser,
  order: orderParser,
  role: roleParser,
});

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireSession([{ resource: "user", action: ["list"] }]);

  return (
    <NuqsAdapter>
      <div>
        <DashboardPageHeader
          title="Usuários"
          subtitle="Gerencie contas de usuário e permissões."
        />

        <Suspense
          fallback={<div className="h-96 animate-pulse rounded-md bg-muted" />}
        >
          <UsersTable searchParams={searchParams} />
        </Suspense>
      </div>
    </NuqsAdapter>
  );
}

async function UsersTable({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParamsCache.parse(await searchParams);

  const result = await listUsersAction({
    search: params.search,
    role: validRole(params.role),
    orderBy: params.orderBy,
    order: params.order as "asc" | "desc",
    page: params.page,
    pageSize: params.pageSize,
  });

  if (!result.success || !result.data) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
        {result.success ? "" : result.error.message}
      </div>
    );
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
