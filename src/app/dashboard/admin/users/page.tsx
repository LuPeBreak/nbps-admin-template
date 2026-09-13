import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { createSearchParamsCache, createSerializer } from "nuqs/server";
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
import type { Role } from "@/lib/db/generated/enums";

const usersSearchParams = {
  search: searchParser,
  page: pageParser,
  pageSize: pageSizeParser,
  orderBy: orderByParser,
  order: orderParser,
  role: roleParser,
};
const searchParamsCache = createSearchParamsCache(usersSearchParams);
const serializeUsersSearchParams = createSerializer(usersSearchParams);

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await requireSession({ user: ["list"] });
  const role = session.user.role;

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
          <UsersTable
            currentUserId={session.user.id}
            role={role}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </NuqsAdapter>
  );
}

async function UsersTable({
  currentUserId,
  role,
  searchParams,
}: {
  currentUserId: string;
  role: Role;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearchParams = await searchParams;
  const params = searchParamsCache.parse(rawSearchParams);

  const result = await listUsersAction({
    search: params.search,
    role: params.role ?? undefined,
    orderBy: params.orderBy,
    order: params.order,
    page: params.page,
    pageSize: params.pageSize,
  });

  if (!result.success || !result.data) {
    return (
      <div className="space-y-4">
        <UsersDataTableToolbar />
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {result.success ? "" : result.error.message}
        </div>
      </div>
    );
  }

  const { users, total, pageCount, page: effectivePage } = result.data;
  const rawPage = rawSearchParams.page;
  const rawPageIsCanonical =
    rawPage === undefined ||
    (typeof rawPage === "string" && rawPage === String(params.page));

  if (effectivePage !== params.page || !rawPageIsCanonical) {
    const baseSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(rawSearchParams)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const item of value) baseSearchParams.append(key, item);
      } else {
        baseSearchParams.append(key, value);
      }
    }

    const canonicalQuery = serializeUsersSearchParams(baseSearchParams, {
      page: effectivePage,
    });
    redirect(`/dashboard/admin/users${canonicalQuery}`, "replace");
  }

  return (
    <DataTable
      columns={usersColumns}
      data={users}
      meta={{ currentUserId, role }}
      pageCount={pageCount}
      totalCount={total}
      toolbar={<UsersDataTableToolbar />}
      tableActions={<CreateUsersButton role={role} />}
    />
  );
}
