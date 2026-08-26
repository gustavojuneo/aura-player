# Utilities Guide

Keep utilities pure, small, and classification-specific.

- `constants.ts` is the canonical home for fixed application options and
  values. Export names use `UPPER_SNAKE_CASE`.
- Do not define `sourceOptions`, `aspectRatioOptions`, or equivalent literals
  inside pages/components.
- Keep generic class composition in `cn.ts`; do not turn `utils/` into a home
  for services, HTTP calls, or feature state.
