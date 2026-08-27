"use client";

import { X } from "lucide-react";
import { debounce, defaultRateLimit, useQueryStates } from "nuqs";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pageParser, roleParser, searchParser } from "./users-search-params";

const usersFilterParsers = {
  page: pageParser,
  role: roleParser,
  search: searchParser,
};

export function UsersDataTableToolbar() {
  const [isPending, startTransition] = useTransition();

  const [{ role, search }, setFilters] = useQueryStates(usersFilterParsers, {
    shallow: false,
    startTransition,
  });

  const isFiltered = search !== "" || role !== null;

  return (
    <div
      className="flex w-full flex-wrap items-center gap-2 transition-opacity data-[pending]:opacity-60"
      data-pending={isPending ? "" : undefined}
      aria-busy={isPending}
    >
      <Input
        type="search"
        autoComplete="off"
        aria-label="Buscar usuários por nome ou email"
        placeholder="Buscar por nome ou email..."
        value={search}
        onChange={(event) => {
          const nextSearch = event.target.value;
          setFilters(
            { page: 1, search: nextSearch || null },
            {
              limitUrlUpdates:
                nextSearch === "" ? defaultRateLimit : debounce(300),
            },
          );
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            setFilters(
              { page: 1, search: event.currentTarget.value || null },
              { history: "push", limitUrlUpdates: defaultRateLimit },
            );
          }
        }}
        className="h-9 w-full sm:w-[250px]"
      />

      <Select
        value={role ?? "all"}
        onValueChange={(value) => {
          setFilters(
            {
              page: 1,
              role: value === "admin" || value === "user" ? value : null,
            },
            { history: "push", limitUrlUpdates: defaultRateLimit },
          );
        }}
      >
        <SelectTrigger
          aria-label="Filtrar por cargo"
          className="h-9 w-full sm:w-[170px]"
        >
          <SelectValue placeholder="Todos os cargos">
            {role === "admin"
              ? "Administrador"
              : role === "user"
                ? "Usuário"
                : "Todos os cargos"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os cargos</SelectItem>
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="user">Usuário</SelectItem>
        </SelectContent>
      </Select>

      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => {
            setFilters(
              { page: 1, role: null, search: null },
              { history: "push", limitUrlUpdates: defaultRateLimit },
            );
          }}
          className="h-9 px-2 lg:px-3"
        >
          Limpar
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
