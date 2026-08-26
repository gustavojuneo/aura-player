# Hooks Guide

Hooks contain reusable browser behavior and state orchestration. Keep them
independent from route composition and visual markup.

- Hooks may consume services and browser APIs, but must not own presentational
  component trees.
- Keep remote state in TanStack Query and avoid duplicating it in contexts or
  local state without a concrete reason.
- Name hooks with the `use-` file convention and keep their public API typed.
