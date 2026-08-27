# UI Components Guide

This directory is the single home for reusable UI elements and primitives used
by the web application, including Button, Field, ProgressBar, ScrollArea,
SearchField,
Select, Skeleton, Switch, VirtualizedGrid, and future controls.

- Components must be page-agnostic and independent of catalog, playback,
  provider, or route business rules.
- Do not make HTTP requests or import page modules.
- Encapsulate accessibility, keyboard behavior, variants, and theme tokens at
  this layer.
- Use `cn` for class composition and `tailwind-variants` for reusable variants.
- Use the shadcn `Field` compound components inside every form to group labels,
  controls, descriptions, and validation errors. Use `Input` as the control
  inside `Field`; do not create local field wrappers.
- Use the shadcn `Dialog` components for every dialog or modal. Do not create
  manual overlays, focus traps, Escape handlers, or scroll-lock logic.
- Export public components through `index.ts` when the existing barrel supports
  the module.
- A composed domain component belongs in `src/components/`, even when it uses
  these primitives internally.
