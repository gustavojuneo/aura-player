---
name: iptv-xtream-catalog-playback
description: Use when changing Xtream catalog routes, provider normalization, series episodes, content identity, or Xtream playback.
---

# Xtream Catalog And Playback

Read `docs/architecture.md` and `AGENTS.md` before Xtream changes. Provider
communication and credentials remain in the API; pages render results through
web services and page-local components.

Read `apps/api/src/catalog/xtream.ts`, provider-client code, shared contracts,
and the closest tests before changing behavior.

- Identify content by source + normalized type + provider ID.
- Keep Xtream credentials inside API/provider code; never return or log them.
- Normalize provider URLs and handle irregular or missing fields safely.
- Distinguish `stream_id`, `series_id`, episode IDs, and local database IDs.
- A VOD URL requires a complete valid ID and extension pair; never invent one.
- Preserve series, season, and episode identity through detail and playback.
- Keep provider fetching and normalization separate from shared UI.
- Guard async updates against a changed source or route.
- Use explicit capability checks instead of generic runtime detection.
- Keep Xtream provider clients and route adapters in `apps/api` infrastructure,
  domain-independent rules in `packages/domain` only when concretely shared,
  and transport schemas in `packages/contracts`.
- Keep web HTTP functions in `apps/web/src/http/`, TanStack Query coordination
  in `apps/web/src/services/`, and page-specific UI in
  `apps/web/src/pages/<page>/components/`.

Update parser, route, domain, and UI tests as applicable. Run focused API tests,
web typecheck/build for consumer changes, and package tests when contracts change.
