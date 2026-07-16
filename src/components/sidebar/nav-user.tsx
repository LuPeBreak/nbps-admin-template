"use client";

import { LogOut, Moon, Sun, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useSidebar } from "@/components/sidebar/sidebar-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils/get-initials";

interface NavUserProps {
  name: string;
  email: string;
}

export function NavUser({ name, email }: NavUserProps) {
  const { collapsed } = useSidebar();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center rounded-lg outline-none hover:bg-muted transition-colors",
          collapsed ? "justify-center p-1 gap-0" : "gap-3 p-1.5 text-left",
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 truncate text-left">
            <p className="truncate text-xs font-medium">{name}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {email}
            </p>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium truncate">{name}</p>
          <p className="truncate text-[10px] text-muted-foreground">{email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
          <UserCog className="mr-2 h-4 w-4" />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
          {isDark ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Modo Claro
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Modo Escuro
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            await signOut();
            router.push("/sign-in");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
