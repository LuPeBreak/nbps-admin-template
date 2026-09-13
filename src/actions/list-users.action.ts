"use server";

import { getEffectivePage } from "@/components/data-table/data-table-pagination-utils";
import type { UserTableRow } from "@/components/users/users-table-types";
import { actionError, validateInput } from "@/lib/actions/action-helpers";
import { protectedAction } from "@/lib/auth/protected-action";
import { prisma } from "@/lib/db";
import type { ActionResponse } from "@/lib/errors";
import { ListUsersSchema } from "@/validations/user.schema";

export type { ListUsersInput } from "@/validations/user.schema";

const USER_SORT_FIELDS = ["name", "email", "role", "createdAt"] as const;
type UserSortField = (typeof USER_SORT_FIELDS)[number];

function isValidSortField(field: string): field is UserSortField {
  return (USER_SORT_FIELDS as readonly string[]).includes(field);
}

export interface ListUsersResult {
  users: UserTableRow[];
  total: number;
  pageCount: number;
  page: number;
}

export const listUsersAction = protectedAction(
  { user: ["list"] },
  async (
    _session,
    input: unknown,
  ): Promise<ActionResponse<ListUsersResult>> => {
    const validated = validateInput(ListUsersSchema, input);
    if (!validated.ok) return validated.error;
    const params = validated.data;

    const {
      search = "",
      role,
      orderBy = "createdAt",
      order = "desc",
      page,
      pageSize,
    } = params;

    const sortField: UserSortField = isValidSortField(orderBy)
      ? orderBy
      : "createdAt";

    const where: import("@/lib/db/generated/client").Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) {
      where.role = role;
    }

    try {
      const findUsers = (requestedPage: number) =>
        prisma.user.findMany({
          where,
          orderBy: { [sortField]: order },
          skip: (requestedPage - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            banned: true,
            createdAt: true,
          },
        });

      const [initialUsers, total] = await Promise.all([
        findUsers(page),
        prisma.user.count({ where }),
      ]);
      const pageCount = Math.ceil(total / pageSize);
      const effectivePage = getEffectivePage(page, pageCount);
      let users = initialUsers;

      if (effectivePage !== page) {
        users = await findUsers(effectivePage);
      }

      return {
        success: true as const,
        data: {
          users,
          total,
          pageCount,
          page: effectivePage,
        },
      };
    } catch (error) {
      return actionError(error, "listUsersAction:");
    }
  },
);
