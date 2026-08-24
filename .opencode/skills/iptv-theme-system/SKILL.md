---
name: iptv-theme-system
description: Use when changing Tailwind styling, CSS variables, shared visual tokens, responsive layouts, or cross-screen visual consistency.
---

# IPTV Theme System

Read `docs/architecture.md` and `AGENT.md` before styling changes. The
architecture requires Tailwind utilities in page/component markup and reserves
the global stylesheet for tokens and truly global rules.

The canonical global style entry point is `apps/web/src/styles.css`. Use
semantic tokens for surfaces, text, borders, focus, selection, provider accents,
and status states.

- Prefer Tailwind utilities, `tailwind-merge`, and `tailwind-variants`.
- Extend shared patterns instead of copying large page-specific blocks.
- Do not create page-specific CSS classes or component styling blocks in
  `apps/web/src/styles.css`; use Tailwind utilities and shared primitives.
- Do not use inline `style` objects for layout, colors, gradients, spacing, or
  responsive behavior when Tailwind can express the same result.
- Keep `apps/web/src/styles.css` focused on `@theme`, semantic tokens, reset,
  and unavoidable global browser rules.
- Use `cn` for conditional utility classes and `tailwind-variants` for reusable
  variants; do not hand-build variant systems with large string concatenations.
- Do not treat existing hard-coded colors as design precedent.
- Check contrast on selection and provider accent backgrounds.
- Preserve responsive behavior from 320px through desktop widths.
- Keep focus indicators visible and do not use color as the only state signal.
- Define scroll ownership deliberately for grids, lists, and player panels.

Check catalog, live, details, source dialogs, and player consumers after shared
style changes. Run formatting, typecheck, and the web build.
