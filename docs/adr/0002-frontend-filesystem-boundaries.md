# ADR 0002: Frontend Filesystem Boundaries

- Status: Accepted
- Date: 2026-08-26

## Context

The frontend had reusable catalog, player, guide, navigation, and landing
components mixed into page directories. Route files also used a flat structure,
which made ownership and reuse difficult for contributors and agents to infer.

## Decision

The web source follows a Next.js-like cascading route structure while using
TanStack Router:

- every route is represented by `pages/<route>/index.tsx`;
- nested URL segments remain nested in folders;
- `layout.tsx` applies to a route and its descendants;
- the `/app` shell is `pages/app/layout.tsx`;
- `pages/components/` is exclusive to the landing page;
- `pages/<route>/components/` is exclusive to that route;
- `components/` is the home for every shared composed component;
- `components/ui/` is the home for every reusable, page-agnostic UI element;
- coordinated components use the Compound Components Pattern, with meaningful
  child components extracted into their own modules;
- fixed frontend options are exported from `utils/constants.ts` using
  `UPPER_SNAKE_CASE` names.

## Consequences

Agents can determine component ownership from the filesystem and do not need to
guess whether a page-local component is reusable. Shared UI remains available
to all routes, while primitives stay independent of business rules. The existing
flat pages and `app-shell.tsx` require a later refactor to conform to this ADR;
this decision does not perform that refactor.
