# ADR 0003: Separate Web App and Web TV Applications

- Status: Accepted
- Date: 2026-08-27
- Related specification:
  [Frontend platform separation](../../specs/frontend-platform-separation.md)

## Context

The repository currently builds the browser and LG webOS products from the
same `apps/web` React application. The webOS package is produced by rebuilding
that application with TV-specific environment values. As a result, routes,
assets, dependencies, interaction models, compatibility targets, and player
controls for both products coexist in one source and dependency graph.

This arrangement makes platform-specific optimization difficult. Browser-only
features can enter the TV build, TV-only behavior can constrain the browser
build, and runtime device checks obscure which code each product actually
uses. Future Android TV, iOS TV, Android, and mobile products also require a
boundary that does not assume every platform has the same interface or runtime.

## Decision

### Independent applications

The browser and TV products will become independent monorepo applications:

- `apps/web-app` owns the desktop and mobile browser product;
- `apps/web-tv` owns the TV web runtime and the LG webOS package;
- `apps/api` remains an independent backend application.

Each frontend application must own its entry point, router, route tree,
layouts, environment schema, Vite configuration, public assets, deployment or
packaging configuration, and direct dependencies. Applications must not import
from one another.

The current `apps/web` application remains the implementation source until the
incremental migration is complete. This ADR records the target architecture;
it does not claim that the target directories already exist.

### Product-specific source and dependencies

Each application must contain and build only functionality used by that
product. Tree shaking alone is not considered sufficient isolation.

Examples of browser-owned behavior include the public landing page, responsive
desktop and mobile navigation, pointer and touch interactions, browser history,
and Vercel deployment configuration.

Examples of TV-owned behavior include hash history for packaged applications,
spatial focus navigation, remote-control interaction, LG webOS metadata and
packaging, the webOS compatibility target, and TV-specific rendering
optimizations.

Runtime branching through a general device variable such as
`VITE_DEVICE_TYPE` must be removed as the applications are separated. A
platform-specific feature must be selected by the corresponding application's
composition and imports, not by shipping both implementations and choosing one
at runtime.

The final route and feature matrix is a product contract. A route may exist in
both applications only when it is intentionally supported in both; reachability
in the current combined router is not sufficient evidence by itself.

### Shared code

Code will move into `packages/` only after concrete reuse by at least two
consumers is established or when a technical boundary independently justifies
the package. Applications must not duplicate shared catalog rules, playback
rules, hooks, services, utilities, components, or player behavior that are
genuinely equivalent.

Shared code must remain explicit about its runtime:

- pure TypeScript domain rules and transport contracts must not depend on
  React, browser APIs, a frontend application, or a provider implementation;
- browser-specific shared packages may serve `web-app` and `web-tv`, but must
  not be presented as portable to future native applications;
- shared packages must expose public entry points and must not import an
  application's environment module;
- platform configuration must be provided through typed composition,
  factories, providers, or component properties;
- high-level routes and layouts remain application-owned unless identical
  ownership and behavior are demonstrated;
- a broad catch-all `shared` package must not be created.

Candidate boundaries such as domain rules, contracts, browser data access,
shared UI primitives, and the browser playback engine will be introduced only
as real code is migrated into them.

### Player composition

The browser playback engine, media state, source resolution, and pure playback
rules may be shared when their behavior is equivalent. The player control
surface and platform interaction model are application-owned compositions.

The `web-app` player may provide pointer-oriented controls, tooltips, a
variable-volume slider, and other browser-specific interactions. The `web-tv`
player must provide focus and remote-control behavior without importing those
browser-only controls.

### Web TV volume behavior

The `web-tv` player volume control has binary behavior:

1. Focusing the volume button must not display or reveal a volume slider.
2. Activating the button toggles only between muted and unmuted states.
3. Muting sets the media element's muted state.
4. Unmuting sets the media element volume to `1` before clearing its muted
   state, so application playback is always at 100 percent when unmuted.
5. The TV application must not render or import a variable-volume slider and
   must not adjust a variable media volume level.
6. Physical or system volume remains controlled by the television and its
   remote control, outside the application.

This decision does not prescribe whether the binary mute state is persisted
between playback sessions.

### Migration and enforcement

Shared behavior will be extracted before the two application compositions are
completed, avoiding a clone-and-diverge migration. The browser application will
then shed TV-only code, and the TV application will be composed from the shared
boundaries plus TV-owned routes and controls.

The completed separation must be enforced through independent package
manifests, type checking, tests, builds, and bundle assertions. In particular:

- the `web-app` graph must not contain spatial-navigation or webOS packaging
  code;
- the `web-tv` graph must not contain the public landing page, mobile browser
  navigation, Vercel configuration, or the browser volume slider;
- both applications must build without importing from the other application;
- TV player tests must verify that focus does not reveal a slider and that
  unmuting restores media volume to 100 percent.

## Alternatives Considered

### Keep one application with build modes

This preserves the current structure but keeps platform behavior coupled,
continues to rely on runtime or build-time branches, and prevents dependable
source and dependency isolation.

### Duplicate the current application and evolve each copy

This gives immediate physical separation but duplicates catalog, persistence,
service, UI, and player logic. The copies would drift and make fixes more
expensive across every future platform.

### Put the complete frontend into one universal shared package

This moves the coupling instead of removing it. Routes, layouts, focus models,
browser APIs, and player controls would still evolve under incompatible
platform constraints, and future native applications would inherit misleading
or unusable abstractions.

## Consequences

- Browser and TV products can optimize compatibility targets, dependencies,
  interactions, releases, and bundle size independently.
- Product ownership becomes visible in the filesystem and dependency graph.
- Shared business behavior has one implementation when reuse is real.
- Platform-specific player controls can evolve without accumulating device
  conditionals in a single component tree.
- New native applications can reuse pure domain and contract packages without
  being forced to consume browser-specific React or playback code.
- Some visually similar route and layout composition may exist in both
  applications when the interaction models differ; this is intentional
  platform ownership, not automatic duplication of business logic.
- The migration requires temporary coordination while `apps/web` remains the
  current implementation and shared boundaries are extracted incrementally.
- Adding a feature to both products may require separate route and UI
  composition while still reusing the underlying domain, data, and playback
  capabilities.
