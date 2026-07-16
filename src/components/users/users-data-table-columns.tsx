"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { RoleBadge } from "./role-badge";
import { StatusBadge } from "./status-badge";
import { UsersDataTableRowActions } from "./users-data-table-row-actions";

export type UserColumn = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
  createdAt: Date;
};

export const usersColumns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cargo" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <RoleBadge role={role} />;
    },
  },
  {
    accessorKey: "banned",
    header: "Status",
    cell: ({ row }) => {
      const banned = row.getValue("banned") as boolean | null;
      return <StatusBadge banned={banned} />;
    },
  },
  {
    id: "actions",
    size: 50,
    cell: ({ row }) => <UsersDataTableRowActions user={row.original} />,
  },
];
