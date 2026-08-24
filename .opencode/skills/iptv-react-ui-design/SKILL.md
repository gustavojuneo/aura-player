---
name: iptv-react-ui-design
description: Use when changing visible React UI in catalog, live, details, source management, navigation, or playback screens.
---

# IPTV React UI Design

Read `docs/architecture.md` and `AGENT.md` before changing UI. Follow the
repository's page/component boundaries instead of putting a complete screen in
one file.

Inspect existing pages and shared components before adding markup. Keep data
loading and mutations in services/hooks, not presentational components.

- Put route-level composition in `apps/web/src/pages/<page>/index.tsx`.
- Put page-only UI in `apps/web/src/pages/<page>/components/`.
- Promote a component to `apps/web/src/components/` only after more than one
  page uses it.
- Keep primitives in `apps/web/src/components/ui/`, exported through its barrel,
  and independent from page-specific behavior.
- Split a screen by meaningful responsibilities such as header, hero, dialog,
  list, and empty state; do not accumulate the entire screen in `App` or a page
  entry file.

- Preserve dense, scannable catalog and live layouts.
- Keep loading, empty, error, disabled, hover, selected, focus, and offline states explicit.
- Give each pane one scroll owner and preserve sticky controls where useful.
- Use `min-width: 0` and ellipsis for flexible text; keep logos and actions from shrinking.
- Use named React exports and `type="button"` for non-submit buttons.
- Preserve keyboard and future TV directional navigation.
- Keep user-facing strings in `packages/i18n`.
- Do not combine behavior fixes with unrelated visual redesign.

Consume React Query hooks rather than calling Axios directly. Keep player
lifecycle and progress ownership separate from visual controls. Validate the
closest tests, typecheck, web build, desktop/mobile layout, and keyboard focus.
