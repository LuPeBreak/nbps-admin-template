import { Badge } from "@/components/ui/badge";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  user: "Usuário",
};

export function RoleBadge({ role }: { role: string }) {
  const label = roleLabels[role] ?? role;
  const isAdmin = role === "admin";

  return (
    <Badge
      variant="outline"
      className={
        isAdmin
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-transparent bg-secondary text-secondary-foreground"
      }
    >
      {label}
    </Badge>
  );
}
