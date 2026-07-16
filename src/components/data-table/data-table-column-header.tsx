"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { orderByParser, orderParser } from "./data-table-base-search-params";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

const sortParsers = {
  orderBy: orderByParser,
  order: orderParser,
};

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [isPending, startTransition] = useTransition();

  const [{ orderBy, order }, setSort] = useQueryStates(sortParsers, {
    shallow: false,
    startTransition,
  });

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const isSorted = orderBy === column.id;
  const sortState = isSorted ? order : false;

  const handleSort = (dir: "asc" | "desc") => {
    setSort({ orderBy: column.id, order: dir });
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "-ml-3 flex h-8 items-center gap-1 rounded-md px-3 text-sm hover:bg-accent data-[popup-open]:bg-accent",
            isPending && "opacity-50",
          )}
        >
          <span>{title}</span>
          {sortState === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : sortState === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ChevronsUpDown className="h-4 w-4" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleSort("asc")}>
            <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Crescente
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort("desc")}>
            <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Decrescente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
