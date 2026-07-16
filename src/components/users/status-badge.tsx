import { Badge } from "@/components/ui/badge";

export function StatusBadge({ banned }: { banned: boolean | null }) {
  if (banned) {
    return <Badge variant="destructive">Banido</Badge>;
  }
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
    >
      Ativo
    </Badge>
  );
}
