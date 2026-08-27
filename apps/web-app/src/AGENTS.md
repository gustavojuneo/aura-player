# Web Source Guide

This directory contains the frontend source for the IPTV application. Follow
the repository-level `AGENTS.md` and `docs/architecture.md` first.

- Keep route composition in `pages/`, reusable behavior in `hooks/`, remote
  coordination in `services/`, low-level requests in `http/`, and pure helpers
  in `utils/`.
- Do not import Axios from pages or components.
- Keep fixed option collections in `utils/constants.ts` using
  `UPPER_SNAKE_CASE` exports.
- Prefer named exports and keep modules small enough to have one clear reason
  to change.
- Component-family-private hooks belong in `components/<family>/hooks/`; pure
  helpers belong in `components/<family>/utils/`. Keep visual components at the
  family root and expose public components only through `index.tsx`.
