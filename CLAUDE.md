# NBPS Admin Template Development Guide

## Build & Development Commands
- **Dev Server**: `npm run dev`
- **Full Quality Check**: `npm run check` (runs Biome check & tsc typecheck)
- **Format Code**: `npm run format` (Biome format)
- **Prisma Studio**: `npm run db:studio`
- **Prisma Seed**: `npm run db:seed`

## Development Guidelines
All development rules, architectural decisions, naming conventions, and file structures are defined in [AGENTS.md](./AGENTS.md) at the root.

> [!IMPORTANT]
> You **MUST** read [AGENTS.md](./AGENTS.md) and the local `agents.md` inside any module before modifying or writing code in this repository.
