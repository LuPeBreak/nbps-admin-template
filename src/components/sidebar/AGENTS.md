# Sidebar Module (src/components/sidebar/)

Main dashboard navigation. Filters links in the Server Component using the validated session role, with no additional DB or HTTP queries per link.

## Rules

- **Destination Capabilities**: Each link may declare a shared `PermissionRequirement`: a simple AND request or `anyOf` across complete AND alternatives. `DashboardSidebar` evaluates it with `hasPermission` and the shared role objects.
- **Optional Requirement**: Links without a requirement remain visible to all authenticated users. A declared empty or malformed requirement is denied.
- **User Management**: The users destination requires `{ user: ["list"] }`, matching its page and query action. There is no separate menu permission catalog or universal `list` requirement for links.
- **Server Authority**: Navigation filtering is UX. Destination pages and server operations must enforce their own authorization, including contextual domain rules where needed.
- **Stable Inputs**: Receive the validated role from the protected layout; keep filtering server-side and delegate interactive rendering to the existing Client Components.
- **Responsive Navigation**: Toggle collapse state via the client-side provider context.

## Files

- `dashboard-sidebar.tsx` (server) — Filters links and renders the sidebar shell.
- `sidebar-config.ts` (shared) — Link configuration and optional capability requirements.
- `sidebar-provider.tsx` (client) — Collapse state context.
- `sidebar-link.tsx` (client) — Active link rendering and collapsed tooltip.
- `sidebar-toggle.tsx` (client) — Collapse button and resize handling.
- `nav-user.tsx` (client) — Profile settings and sign-out dropdown.

## Adding a Link

Register the route, Portuguese label and icon in `sidebarLinks`. If the destination requires a capability, reference that catalog-derived requirement directly, for example:

```typescript
{ href: "/dashboard/admin/users", label: "Usuários", icon: Users, permission: { user: ["list"] } }
```

Keep the destination page's gate aligned. Do not add a separate navigation permission or a database lookup per link.
