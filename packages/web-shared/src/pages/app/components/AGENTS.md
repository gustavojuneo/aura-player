# Application Page Components Guide

This directory is transitional page-local space for components private to the
`/app` route itself. It must not be used as a general shared-component bucket.

- Components shared by catalog, details, live, settings, or player routes must
  live in `src/components/`.
- Generic controls must live in `src/components/ui/`.
- During refactoring, inspect all imports before moving a component and preserve
  its behavior while changing its location.
