# Sidebar Module (src/components/sidebar/)

Main dashboard navigation. Filters links server-side in-memory. Zero extra DB or HTTP queries.

---

## 💎 Golden Rules

- **Server-Side Filtering**: Filter nav links server-side via fast in-memory `hasMenuPermission` helper.
- **Role-Only Lookup**: In-memory permission check = role-only. User-level overrides → revert to `auth.api.userHasPermission`.
- **Responsive Navigation**: Toggle collapse state via client-side provider context.

---

## 📂 Files

- `dashboard-sidebar.tsx` (server) — Sidebar shell. Maps links + renders sections.
- `sidebar-config.ts` (shared) — Configures links, types, `hasMenuPermission` wrapper.
- `sidebar-provider.tsx` (client) — Context API provider managing collapsed state.
- `sidebar-link.tsx` (client) — Active link rendering + tooltip when collapsed.
- `sidebar-toggle.tsx` (client) — Toggle collapse button + resize handling.
- `nav-user.tsx` (client) — User profile settings + sign-out dropdown.

---

## 🛠️ Implementation Patterns

### 1. Permission Flow (Server-Side, In-Memory)
Permissions mapping in `src/lib/auth/permissions.ts`. Thin wrapper in `sidebar-config.ts` validates menu key:

```typescript
import type { Role } from "@/lib/db/generated/enums";
import { hasPermission } from "@/lib/auth/permissions";

export function hasMenuPermission(roleName: Role, key: MenuKey): boolean {
  return hasPermission(roleName, [{ resource: "menu", action: [key] }]);
}
```

### 2. Adding a New Link
1. **Define statement** in `src/lib/auth/permissions.ts` (e.g. add `orders` under `menu: [...]`).
2. **Define type** in `sidebar-config.ts` under `MenuKey` union.
3. **Register link** in `sidebarLinks` config:
   ```typescript
   { href: "/dashboard/admin/orders", label: "Pedidos", icon: Package, permission: "orders" }
   ```
   *Note: Links without permission visible to all authenticated users.*
