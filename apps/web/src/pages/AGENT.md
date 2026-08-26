# Pages Guide

Pages mirror the URL hierarchy and use `index.tsx` for every route entry:

```text
pages/index.tsx                         /
pages/app/index.tsx                     /app
pages/app/onboarding/index.tsx          /app/onboarding
pages/app/(favorites|movies|series|channels|player)/index.tsx
```

- Keep child routes physically below their parent route.
- A route-level `layout.tsx` wraps that route and its descendants. The `/app`
  shell belongs in `pages/app/layout.tsx`.
- `pages/components/` is only for landing-page components.
- `pages/<route>/components/` is only for components used by that route. Move
  shared components to `src/components/` or `src/components/ui/`.
- Pages compose components and services; they do not contain reusable visual
  primitives, direct Axios calls, or duplicated fixed constants.
