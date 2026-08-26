---
name: iptv-local-first-playback
description: Use when changing playback progress, IndexedDB persistence, sync queues, resume behavior, completion, or episode advancement.
---

# IPTV Local-First Playback

Read `docs/architecture.md` and `AGENTS.md` before playback changes. Follow the
layer boundaries: pure playback rules in `packages/domain`, shared contracts in
`packages/contracts`, browser persistence and synchronization orchestration in
the owning app, and rendering in page/component layers.

Playback progress is immediate local state with authenticated server
synchronization as a durable retry process.

- Persist snapshots locally while playing; do not wait for the API to update UI.
- Enqueue idempotent events and retain them until confirmed.
- Flush periodically and on pause, route change, visibility change, player exit, and completion.
- Resolve conflicts using the latest valid timestamp; reject future timestamps on the server.
- Movies remove active progress on completion.
- Series keep exactly one active episode per series.
- Completion advances atomically or removes progress after the final episode.
- Keep media type, media ID, series ID, and episode identity explicit.
- Never let stale player events overwrite a newer media session.
- Keep IndexedDB adapters, sync queues, and browser coordination in the web
  application services/hooks layer rather than in presentational components.
- Keep route/page composition in `apps/web/src/pages/` and page-only player UI in
  `src/pages/<page>/components/`; promote controls to `src/components/` only
  after concrete reuse across pages.

Keep pure rules in `packages/domain`, contracts in `packages/contracts`, and
persistence/sync orchestration in the owning app. Update tests for conflict or
completion rule changes.
