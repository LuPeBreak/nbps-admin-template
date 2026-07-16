"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useQueryStates } from "nuqs";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pageParser, pageSizeParser } from "./data-table-base-search-params";

interface DataTablePaginationProps {
  totalCount: number;
  pageCount: number;
}

export function DataTablePagination({
  totalCount,
  pageCount,
}: DataTablePaginationProps) {
  const [isPending, startTransition] = useTransition();

  const [{ page, pageSize }, setPagination] = useQueryStates(
    {
      page: pageParser,
      pageSize: pageSizeParser,
    },
    {
      startTransition,
      shallow: false,
    },
  );

  const safePageCount = Math.max(pageCount, 1);
  const currentPage = Math.min(page, safePageCount);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div
      className="flex items-center justify-between px-2"
      data-pending={isPending ? "" : undefined}
    >
      <div className="flex-1 text-sm text-muted-foreground">
        Mostrando {startItem}-{endItem} de {totalCount} registro(s).
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Linhas por página</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPagination({ page: 1, pageSize: Number(value) });
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 15, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Página {currentPage} de {safePageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
            disabled={currentPage <= 1}
          >
            <span className="sr-only">Primeira página</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.max(prev.page - 1, 1),
              }))
            }
            disabled={currentPage <= 1}
          >
            <span className="sr-only">Página anterior</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.min(prev.page + 1, safePageCount),
              }))
            }
            disabled={currentPage >= safePageCount}
          >
            <span className="sr-only">Próxima página</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: safePageCount }))
            }
            disabled={currentPage >= safePageCount}
          >
            <span className="sr-only">Última página</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
