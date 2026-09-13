import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import {
  hasPermission,
  isRole,
  type PermissionRequirement,
} from "@/lib/auth/permissions";
import type { Session } from "@/lib/auth/protected-action";

export async function requireSession(
  requirement?: PermissionRequirement,
): Promise<Session> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  if (!isRole(session.user.role)) {
    // Public home never redirects an existing session back to this boundary.
    redirect("/");
  }

  if (
    requirement !== undefined &&
    !hasPermission(session.user.role, requirement)
  ) {
    redirect("/dashboard");
  }

  // Preserve the session object after validating its single configured role.
  return session as Session;
}
