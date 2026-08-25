---
name: iptv-turborepo-architecture
description: Use when deciding where IPTV code belongs, changing workspace packages, imports, Turbo tasks, or application boundaries.
---

# IPTV Turborepo Architecture

`docs/architecture.md` and `AGENT.md` are the normative sources for repository
structure. Read them before creating or moving code; this skill summarizes them
but does not replace them.

- `apps/web`: React pages, routing, browser state, and playback UI.
- `apps/api`: Fastify routes, provider clients, authentication, and database access.
- `packages/domain`: pure catalog, IPTV, and playback rules.
- `packages/contracts`: shared Zod schemas and transport contracts.
- `packages/i18n`: translation resources and locale helpers.
- `packages/config`: shared TypeScript configuration.

Do not import one application from another. Put provider-independent logic in
`packages/domain`, request/response shapes in `packages/contracts`, and expose
package APIs through public entry points.

- Keep HTTP calls in `apps/web/src/http` and React Query hooks in `apps/web/src/services`.
- Keep database and provider credentials in the API.
- Inspect `package.json` and `turbo.json` before inventing tasks or filters.
- Do not move code to a package without a concrete reuse case.

## Web Placement Rules

- Put page composition in `apps/web/src/pages/<page>/index.tsx` or the existing
  page entry convention when a route has a single page entry.
- Put components used only by one page in
  `apps/web/src/pages/<page>/components/`.
- Put genuinely cross-page components in `apps/web/src/components/`.
- Keep reusable visual primitives in `apps/web/src/components/ui/`; they must
  not know page-specific business rules.
- Keep browser-wide configuration and integrations in `src/lib/`.
- Keep reusable behavior in `src/hooks/` and global state in `src/contexts/`
  only when a concrete cross-page need exists.
- Keep HTTP endpoint functions in `src/http/` and query/mutation coordination
  in `src/services/`; pages and presentational components must not call Axios.
- Pages compose components and consume services. They must not become a
  monolithic markup, state, or business-rule container.
- Do not create a parallel `src/app.tsx` page layer when the router already
  composes a page from `src/pages/`.

Use `pnpm check`, `pnpm test`, and the narrowest package command available.
