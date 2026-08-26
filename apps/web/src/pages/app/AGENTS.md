# Application Routes Guide

All authenticated/application routes live below this directory so their folder
structure mirrors `/app/*` URLs.

- Keep the application-wide shell in `layout.tsx`; do not create a parallel
  `app-shell.tsx` for the route layout.
- Use `index.tsx` for `/app` and for every nested route entry.
- Components used by more than one application route belong in
  `src/components/`. Components used only by one route belong in that route's
  `components/` folder.
- Organize route groups under this directory when grouping does not change the
  URL.
