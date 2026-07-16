"use server";

import { actionError } from "@/lib/actions/action-helpers";
import { protectedAction } from "@/lib/auth/protected-action";
import { prisma } from "@/lib/db";
import type { ActionResponse } from "@/lib/errors";

export interface AdminStats {
  total: number;
  admins: number;
  users: number;
}

export const getAdminStatsAction = protectedAction(
  [{ resource: "user", action: ["list"] }],
  async (): Promise<ActionResponse<AdminStats>> => {
    try {
      const [total, admins, users] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "admin" } }),
        prisma.user.count({ where: { role: "user" } }),
      ]);
      return { success: true as const, data: { total, admins, users } };
    } catch (error) {
      return actionError(error, "getAdminStatsAction:");
    }
  },
);
