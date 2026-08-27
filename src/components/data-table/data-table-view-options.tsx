"use client";

import type { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableColumnMeta } from "./data-table-types";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

function getColumnLabel<TData>(
  column: ReturnType<Table<TData>["getAllLeafColumns"]>[number],
): string | null {
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
  return meta?.label ?? null;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide() && getColumnLabel(column));

  if (columns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({ variant: "outline", className: "h-9" })}
      >
        <Settings2 />
        Colunas
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Mostrar colunas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(checked) => column.toggleVisibility(checked)}
          >
            {getColumnLabel(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
