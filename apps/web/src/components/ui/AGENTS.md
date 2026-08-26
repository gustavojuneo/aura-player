# UI Components Guide

This directory is the single home for reusable UI elements and primitives used
by the web application, including Button, ProgressBar, ScrollArea, SearchField,
Select, Skeleton, Switch, VirtualizedGrid, and future controls.

- Components must be page-agnostic and independent of catalog, playback,
  provider, or route business rules.
- Do not make HTTP requests or import page modules.
- Encapsulate accessibility, keyboard behavior, variants, and theme tokens at
  this layer.
- Use `cn` for class composition and `tailwind-variants` for reusable variants.
- Export public components through `index.ts` when the existing barrel supports
  the module.
- A composed domain component belongs in `src/components/`, even when it uses
  these primitives internally.
