import type { Role } from "@/lib/db/generated/enums";

export interface UserTableRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  banned: boolean | null;
  createdAt: Date;
}
