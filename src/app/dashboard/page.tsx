import Link from "next/link";
import { Suspense } from "react";
import { getAdminStatsAction } from "@/actions/get-admin-stats.action";
import { DashboardPageHeader } from "@/components/dashboard";
import { hasPermission } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/require-session";
import type { Role } from "@/lib/db/generated/enums";

export default async function DashboardPage() {
  const session = await requireSession();
  const role = session.user.role as Role;
  const canManageUsers = hasPermission(role, [
    { resource: "user", action: ["list"] },
  ]);

  return (
    <div>
      <DashboardPageHeader
        title="Visão Geral"
        subtitle="Gerencie sua aplicação pelo painel administrativo."
      />

      {canManageUsers && (
        <Suspense
          fallback={
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[104px] animate-pulse rounded-2xl bg-muted"
                />
              ))}
            </div>
          }
        >
          <StatsSection />
        </Suspense>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {canManageUsers && (
          <Link href="/dashboard/admin/users" className="group">
            <div className="rounded-2xl border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card hover:shadow-lg">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                  />
                </svg>
              </div>
              <p className="font-semibold">Gerenciar Usuários</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Criar, editar e gerenciar contas de usuário
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

async function StatsSection() {
  const result = await getAdminStatsAction();
  if (!result.success || !result.data) return null;
  const stats = result.data;

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border bg-card/50 p-5 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground">Total de Usuários</p>
        <p className="mt-1 text-3xl font-bold">{stats.total}</p>
      </div>
      <div className="rounded-2xl border bg-card/50 p-5 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground">Administradores</p>
        <p className="mt-1 text-3xl font-bold">{stats.admins}</p>
      </div>
      <div className="rounded-2xl border bg-card/50 p-5 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground">Usuários</p>
        <p className="mt-1 text-3xl font-bold">{stats.users}</p>
      </div>
    </div>
  );
}
