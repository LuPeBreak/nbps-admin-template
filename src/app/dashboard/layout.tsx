import { DashboardShell, ImpersonationBanner } from "@/components/dashboard";
import { DashboardSidebar } from "@/components/sidebar/dashboard-sidebar";
import { SidebarProvider } from "@/components/sidebar/sidebar-provider";
import { requireSession } from "@/lib/auth/require-session";
import type { Role } from "@/lib/db/generated/enums";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const role = session.user.role as Role;

  return (
    <SidebarProvider>
      <DashboardShell>
        <DashboardSidebar
          role={role}
          name={session.user.name}
          email={session.user.email}
        />

        <div
          className="flex flex-1 flex-col transition-[padding-left] duration-300"
          style={{ paddingLeft: "var(--sidebar-width)" }}
        >
          <ImpersonationBanner />
          <main className="p-6">{children}</main>
        </div>
      </DashboardShell>
    </SidebarProvider>
  );
}
