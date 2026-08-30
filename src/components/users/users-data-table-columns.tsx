"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableColumnMeta } from "@/components/data-table/data-table-types";
import { RoleBadge } from "./role-badge";
import { StatusBadge } from "./status-badge";
import { UsersDataTableRowActions } from "./users-data-table-row-actions";
import type { UsersTableMeta, UserTableRow } from "./users-table-types";

export const usersColumns: ColumnDef<UserTableRow>[] = [
  {
    accessorKey: "name",
    meta: { label: "Nome" } satisfies DataTableColumnMeta,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
  },
  {
    accessorKey: "email",
    meta: { label: "Email" } satisfies DataTableColumnMeta,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "role",
    meta: { label: "Cargo" } satisfies DataTableColumnMeta,
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
    meta: { label: "Status" } satisfies DataTableColumnMeta,
    header: "Status",
    cell: ({ row }) => {
      const banned = row.getValue("banned") as boolean | null;
      return <StatusBadge banned={banned} />;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    size: 50,
    cell: ({ row, table }) => {
      const meta = table.options.meta as UsersTableMeta;

      return (
        <UsersDataTableRowActions
          currentUserId={meta.currentUserId}
          role={meta.role}
          user={row.original}
        />
      );
    },
  },
];
