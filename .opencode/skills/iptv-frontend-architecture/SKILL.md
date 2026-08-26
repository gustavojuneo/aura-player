---
name: iptv-frontend-architecture
description: Use when creating or refactoring IPTV frontend routes, components, UI primitives, constants, hooks, HTTP modules, or services.
---

# IPTV Frontend Architecture

Read `AGENT.md`, `apps/web/src/AGENT.md`, and `docs/architecture.md` before
changing frontend structure. Keep the matching local `AGENT.md` in mind for
the directory being edited.

## Placement

- Mirror URLs under `apps/web/src/pages/`; every route entry is `index.tsx`.
- Keep nested routes under their parent (`app/onboarding`, not beside `app`).
- Use `layout.tsx` for a route and its descendants. The `/app` shell belongs at
  `pages/app/layout.tsx`.
- Put all reusable UI elements in `components/ui/`.
- Put all composed components shared by pages/areas in `components/`.
- Put components used only by one route in that route's `components/` folder.
- Keep landing-only components in `pages/components/`.

## Composition

Never define meaningful child components inside a parent component file.
Extract them into named modules. Use Compound Components for coordinated parts
(`Catalog.Root`, `Catalog.Header`, `Catalog.Grid`) and keep primitives free of
page or business rules.

## Constants and boundaries

Put fixed option collections in `src/utils/constants.ts` and export them as
`UPPER_SNAKE_CASE` (`SOURCE_OPTIONS`, `ASPECT_RATIO_OPTIONS`). Keep HTTP in
`src/http/`, query/use-case coordination in `src/services/`, and reusable
behavior in `src/hooks/`. Pages and components do not call Axios directly.

When refactoring, inspect imports and usages first, move shared modules before
removing page-local copies, and preserve public APIs where practical. Update
both `.codex/skills/` and `.opencode/skills/` copies when this skill changes.
