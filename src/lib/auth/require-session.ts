import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { hasPermission, type PermissionOption } from "@/lib/auth/permissions";
import type { Role } from "@/lib/db/generated/enums";

type Session = typeof auth.$Infer.Session;

export async function requireSession(
  permissions?: PermissionOption[],
): Promise<Session> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  if (permissions) {
    const role = session.user.role as Role;
    if (!role || !hasPermission(role, permissions)) {
      redirect("/dashboard");
    }
  }

  return session;
}
