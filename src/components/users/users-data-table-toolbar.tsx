"use client";

import { X } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roleParser, searchParser } from "./users-search-params";

export function UsersDataTableToolbar() {
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useQueryState(
    "search",
    searchParser.withOptions({ shallow: false, startTransition }),
  );

  const [role, setRole] = useQueryState(
    "role",
    roleParser.withOptions({ shallow: false, startTransition }),
  );

  const [inputValue, setInputValue] = useState(search ?? "");

  useEffect(() => {
    setInputValue(search ?? "");
  }, [search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== (search ?? "")) {
        setSearch(inputValue || null);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, search, setSearch]);

  const isFiltered = search !== "" || role !== "";

  return (
    <div className="flex flex-1 items-center space-x-2">
      <Input
        type="search"
        autoComplete="off"
        placeholder="Buscar usuários..."
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        className="h-9 w-[150px] lg:w-[250px]"
        data-pending={isPending ? "" : undefined}
      />

      <Select
        value={role || ""}
        onValueChange={(value) => setRole(value === "" ? "" : value)}
      >
        <SelectTrigger className="h-9 w-[150px]">
          <SelectValue placeholder="Todos">
            {role === "admin"
              ? "Administrador"
              : role === "user"
                ? "Usuário"
                : "Todos"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos</SelectItem>
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="user">Usuário</SelectItem>
        </SelectContent>
      </Select>

      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => {
            setSearch("");
            setRole("");
          }}
          className="h-8 px-2 lg:px-3"
        >
          Limpar
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
