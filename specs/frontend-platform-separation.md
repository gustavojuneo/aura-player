# Frontend Platform Separation Specification

- Status: Accepted
- Date: 2026-08-27
- Related decision:
  [ADR 0003](../docs/adr/0003-separate-web-app-and-web-tv.md)

## Scope

This specification defines the required separation of the current combined
React frontend into a browser application named `web-app` and a TV web
application named `web-tv`. It also defines code-sharing constraints and the TV
player volume contract.

At acceptance time, the implementation was still in `apps/web`. The migration
now targets `apps/web-app` and `apps/web-tv`; this specification remains the
normative contract for their boundaries and behavior.

The route and feature allocation beyond the confirmed platform-specific
requirements remains a separate product decision. Before a route is removed
from either product, its ownership must be recorded in an accepted
specification.

## Application boundaries

### FPS-APP-001: Independent applications

The monorepo must provide `apps/web-app` and `apps/web-tv` as independently
buildable applications.

### FPS-APP-002: Application ownership

Each application must own its entry point, router, route tree, layouts,
environment schema, Vite configuration, public assets, direct dependencies,
and deployment or packaging configuration.

### FPS-APP-003: No application-to-application imports

Neither frontend application may import source code from the other frontend
application.

### FPS-APP-004: Product-specific content

Each application must contain and build only routes, components, hooks,
services, utilities, integrations, assets, and dependencies intentionally used
by that product. Tree shaking is not sufficient evidence of isolation.

### FPS-APP-005: No general device branch

Platform behavior must be selected through application composition and
imports. The separated applications must not use a general runtime device flag
such as `VITE_DEVICE_TYPE` to choose between browser and TV implementations.

## Platform requirements

### FPS-WEB-001: Browser ownership

`web-app` owns the public landing page, desktop and mobile browser navigation,
pointer and touch interactions, browser history, modern browser build target,
and Vercel deployment configuration.

### FPS-TV-001: TV ownership

`web-tv` owns hash history for packaged applications, spatial focus navigation,
remote-control interaction, TV-specific rendering optimization, the LG webOS
compatibility target, webOS metadata, and webOS packaging.

### FPS-TV-002: Platform dependency isolation

The `web-app` dependency graph must not include spatial-navigation or webOS
packaging code. The `web-tv` source and dependency graph must not include the
public landing page, mobile browser navigation, or Vercel configuration.

## Shared code requirements

### FPS-SHARED-001: Concrete reuse

Code may move into `packages/` only after reuse by at least two consumers is
demonstrated or when a technical boundary independently requires a package.

### FPS-SHARED-002: Equivalent behavior

Catalog rules, playback rules, hooks, services, utilities, components, and
player behavior must not be duplicated when their behavior and runtime
requirements are genuinely equivalent.

### FPS-SHARED-003: Explicit runtime

Pure domain and transport packages must not depend on React, browser APIs, an
application, or a concrete provider implementation. Browser-only shared code
must not be represented as portable to future native applications.

### FPS-SHARED-004: Configuration injection

Shared packages must not import an application's environment module.
Application configuration must enter shared code through typed composition,
factories, providers, or component properties.

### FPS-SHARED-005: Application-owned composition

Routes, layouts, platform navigation, and platform-specific player controls
remain application-owned unless identical ownership and behavior are
demonstrated. A broad catch-all `shared` package must not be introduced.

## Player requirements

### FPS-PLAYER-001: Shared playback capabilities

The browser playback engine, source resolution, media state, and pure playback
rules may be shared when both applications require equivalent behavior.

### FPS-PLAYER-002: Platform-specific controls

`web-app` and `web-tv` must compose their own player control surfaces. The TV
player must not import browser-only pointer controls, tooltips, or a variable
volume slider.

### FPS-TV-VOLUME-001: No TV volume slider

Focusing or activating the `web-tv` volume button must not display, reveal, or
mount a volume slider. A variable-volume slider must not exist in the TV player
DOM or bundle.

### FPS-TV-VOLUME-002: Binary TV volume action

Activating the `web-tv` volume button must toggle only between muted and
unmuted states.

### FPS-TV-VOLUME-003: Unmute at full media volume

When the TV player is unmuted, it must set the media element volume to `1`
before setting its muted state to `false`.

### FPS-TV-VOLUME-004: System volume ownership

The TV application must not provide variable media-volume adjustment. Physical
or system volume is controlled by the television and its remote control.

This specification does not determine whether the binary mute state persists
between playback sessions.

## Migration requirements

### FPS-MIGRATION-001: Extract before divergence

Equivalent shared behavior must be extracted before the two final application
compositions are completed. The migration must not begin by permanently
cloning the complete current frontend.

### FPS-MIGRATION-002: Current-state accuracy

Commands and operational documentation must identify `apps/web-app` and
`apps/web-tv` as the current applications. Historical references to `apps/web`
must be explicitly marked as legacy migration context.

## Acceptance criteria

The specification is satisfied when:

1. `web-app` and `web-tv` have independent package manifests and successful
   type-check, test, and build tasks.
2. Neither application imports the other.
3. Each route is present only in the products that intentionally support it.
4. `VITE_DEVICE_TYPE` and equivalent general platform branches are absent.
5. Browser-only and TV-only dependencies and assets are absent from the other
   product's source and output bundles.
6. Shared packages expose explicit public APIs and have at least two concrete
   consumers or a documented technical-boundary justification.
7. TV player tests prove that focus and activation do not reveal a slider.
8. TV player tests prove that muting changes only the muted state and unmuting
   restores media volume to `1` before clearing the muted state.
9. The webOS package passes validation on the oldest supported TV target, and
   the browser application retains its required desktop and mobile behavior.
