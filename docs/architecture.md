# Project Architecture

This document records the architectural decisions for the IPTV project. It describes the intended direction, layer boundaries, and directory responsibilities.

The structure is incremental. Create directories only when there is real code to place in them.

## Overview

The repository uses:

- pnpm workspaces;
- Turborepo;
- TypeScript;
- React and Vite for the frontend;
- Fastify for the backend;
- PostgreSQL and Drizzle ORM;
- Zod at application boundaries;
- Biome for linting, formatting, and import organization.

The current frontend is implemented in `apps/web`. ADR 0003 establishes an
incremental migration to two independently built frontend products. Until that
migration is complete, documentation and commands that refer to `apps/web`
describe the current repository state.

Target top-level structure:

```text
.
|-- apps/
|   |-- api/
|   |-- web-app/
|   `-- web-tv/
|-- packages/
|-- docs/
|   |-- architecture.md
|   `-- adr/
|-- specs/
|   `-- index.md
|-- AGENTS.md
|-- README.md
|-- biome.json
|-- package.json
|-- pnpm-workspace.yaml
`-- turbo.json
```

Do not place code in `packages/` preemptively. A shared package should exist only when there is concrete reuse or when a technical boundary justifies its creation.

### Frontend platform separation

`web-app` and `web-tv` are separate products, not two modes of one frontend.
Each application owns its routes, layouts, entry point, environment validation,
build target, assets, deployment or packaging configuration, and direct
dependencies. Neither application may import the other.

Only behavior with demonstrated reuse belongs in a package. Pure domain and
transport code must remain independent of React and browser APIs. Code shared
only by the two browser runtimes must be identified as browser-specific rather
than treated as portable to future native applications.

Platform-specific behavior is selected by application composition and imports.
Do not ship both implementations behind a general runtime device flag. The
browser and TV player may share their playback engine and pure rules, but they
own separate control compositions. In particular, the TV volume button only
toggles mute: focusing it never reveals a slider, and unmuting restores media
volume to 100 percent because system volume is controlled by the television.

See [ADR 0003](adr/0003-separate-web-app-and-web-tv.md) for the complete
decision, migration constraints, alternatives, and consequences.

## Documentation

Each document has a specific purpose:

```text
README.md
```

Introduces the project to people: purpose, technologies, requirements, installation, and commands.

```text
AGENTS.md
```

Contains normative rules that agents and contributors must follow during implementation.

```text
docs/architecture.md
```

Explains architectural decisions, layer boundaries, and directory responsibilities.

```text
docs/adr/
```

May store Architecture Decision Records when an important decision needs to capture context, alternatives, and consequences.

```text
specs/
```

Contains normative application behavior, supported capabilities, platform
requirements, and verifiable acceptance criteria. Specifications describe what
the products must do; ADRs preserve why consequential architectural choices
were made.

All project documentation must be written in English.

Commit messages follow the Conventional Commits specification. Every commit
must include a type and a meaningful description of the alterations. Include a
body separated by a blank line describing the changes, except for small,
self-explanatory changes. See `docs/commit-convention.md` for the complete
rules and examples.

## Naming Conventions

- Use kebab-case for every file and directory name.
- Use camelCase for variables, functions, parameters, properties, and application-controlled object keys.
- Use PascalCase for React components, classes, types, and interfaces.
- Use SCREAMING_SNAKE_CASE only for true constants when appropriate.
- Exceptions are allowed only for names mandated by frameworks or existing external contracts.

## Frontend

### Technologies

The web application uses:

- React;
- Vite;
- TypeScript;
- Tailwind CSS;
- `tailwind-merge`;
- `tailwind-variants`;
- shadcn with Base UI;
- TanStack Router;
- TanStack Query;
- Axios;
- React Hook Form;
- Zod.

### Structure

The frontend is split between application-owned composition and browser-shared
capabilities:

```text
apps/web-app/src/
|-- app-layout.tsx
|-- lib/router.tsx
|-- env.ts
`-- main.tsx

apps/web-tv/src/
|-- app-layout.tsx
|-- hooks/use-tv-directional-navigation.ts
|-- lib/router.tsx
|-- env.ts
`-- main.tsx

packages/web-shared/src/
|-- components/
|-- features/
|-- hooks/
|-- http/
|-- pages/                         route modules used by both products
|-- services/
|-- stores/
|-- utils/
|-- workers/
|-- env.ts
`-- styles.css
```

This tree is a reference. Create files and directories as the application requires them.

Routes are represented as a cascading filesystem hierarchy. `pages/index.tsx`
maps to `/`; `pages/app/index.tsx` maps to `/app`; and
`pages/app/onboarding/index.tsx` maps to `/app/onboarding`. Route groups may be
used for organization without changing the URL. Every route page is named
`index.tsx`. A `layout.tsx` in a route directory wraps that route and all child
routes; the app shell belongs at `pages/app/layout.tsx`.

### `components/ui`

Contains all reusable UI elements and primitives used by the application,
including shadcn components based on Base UI. Examples include `Button`,
`ProgressBar`, `ScrollArea`, `SearchField`, `Select`, `Skeleton`, `Switch`, and
`VirtualizedGrid`.

Examples:

```text
components/ui/button.tsx
components/ui/dialog.tsx
components/ui/input.tsx
components/ui/select.tsx
components/ui/card.tsx
```

Responsibilities:

- encapsulate accessible primitives;
- expose visual variants;
- use theme tokens;
- remain independent of business rules;
- make no HTTP requests;
- have no knowledge of specific pages.

All dialogs and modals must use the shadcn/Base UI dialog primitives from
`components/ui/dialog.tsx`. Manual overlays, focus traps, Escape handlers, and
scroll-lock implementations are not permitted.

Use `tailwind-variants` when there are multiple visual variant combinations. Use `cn` for conditional classes.

### `components`

Contains all composed components shared across pages or application areas.

Examples:

```text
components/header.tsx
components/footer.tsx
components/sidebar.tsx
components/app-navigation.tsx
components/user-menu.tsx
components/carousel.tsx
components/catalog.tsx
components/hero.tsx
components/favorite-button.tsx
components/player-content-list.tsx
components/player-live-guide.tsx
components/player-next-episode.tsx
components/program-guide.tsx
components/icon.tsx
components/source-selector.tsx
components/media-player/index.tsx
components/media-player/player-content-list.tsx
components/media-player/player-live-guide.tsx
components/media-player/player-next-episode.tsx
```

A component belongs here when:

- more than one page uses it;
- it represents a shared part of the application structure;
- it does not belong to a single local visual feature.

Do not place page-specific components here in advance.

Shared means used by more than one page or by a stable application area. A
component that is duplicated or clearly reusable should be promoted during the
refactor. Do not define meaningful child components inside a parent component's
file; extract them into named modules. Use the Compound Components Pattern for
coordinated subparts such as `Catalog.Root`, `Catalog.Header`, and
`Catalog.Grid`.

Playback UI is a shared component family, not a page. Keep its public entry
point and coordinated subcomponents under `components/media-player/`. Watch
routes under `pages/app/*/watch/` should remain thin route entries that compose
the shared player with the appropriate content type.

Each Compound Component family must expose its complete public API from its
`index.tsx` entry point. The barrel may delegate implementation to internal
files, but consumers import every root component and composed part from the
entry point; imports from internal implementation files are not allowed.
Internal files may be reorganized without changing consumer imports.

### `pages`

Contains route entries and components exclusive to each route. The landing page
has its own `pages/components/` directory. Nested routes must remain nested
under their URL parent; do not flatten `/app/*` pages beside `/app`.

Example:

```text
pages/
`-- app/
    |-- components/
    |   |-- continue-watching.tsx
    |   `-- featured-content.tsx
    `-- index.tsx
```

`pages/app/index.tsx` composes the page. `pages/app/components/` is reserved
for components used only by that route; shared application components belong in
`src/components/`.

### React composition patterns

The frontend adopts three React patterns from the
[Patterns.dev React patterns](https://www.patterns.dev/react/) documentation.
They are complementary and must be selected according to the responsibility of
the code.

#### Hooks Pattern

Use custom hooks to extract reusable stateful behavior, subscriptions, browser
APIs, side effects, and remote-state coordination from components. Hooks must
be named with the `use` prefix, called only at the top level of React functions,
and must not be called from ordinary utility functions. Prefer hooks for pure
logic/data sharing; avoid effects for derived values or event handling when a
calculation or event handler is sufficient. Keep hooks in `src/hooks/`, or in a
component family's `hooks/` directory only when the behavior is private to that
family. Keep that family's pure helpers in its `utils/` directory; visual
components stay at the family root.

#### Compound Pattern

Use compound components for a coordinated family of parts that shares state or
behavior. The root owns the shared state/context and exposes named subparts,
for example `MediaPlayer.Root`, `MediaPlayer.LiveGuide`, and
`MediaPlayer.NextEpisode`. Subparts must remain composable and should not embed
page-specific business rules. Use React context when subparts need access to
root state without prop drilling.

#### Render Props Pattern

Use render props (including the children-as-a-function form) when a component
must own a subtree, context, ref, portal, accessibility boundary, drag/drop
boundary, or animation boundary while allowing the consumer to define the
rendered markup. Type render functions explicitly and keep the data passed to
them minimal. Do not use render props merely to share data; use a custom hook
instead. Prefer one consistent render-prop style per component family.

These patterns must not be applied mechanically: hooks are the default for
shared behavior, compound components are for coordinated component families,
and render props are for behavior that must wrap consumer-owned JSX.

When multiple pages use a local component, it must be promoted to
`src/components/` or `src/components/ui/` according to its responsibility.

Pages should:

- compose components;
- consume hooks, queries, and services;
- handle visual loading, error, and empty states;
- avoid implementing Axios details;
- avoid concentrating complex business rules.

### Loading states

Skeletons are the application's standard loading treatment. Use them whenever
the expected content structure is known, keeping the placeholder dimensions and
layout close to the loaded view to minimize layout shift. Use a spinner,
progress indicator, or another status treatment only when a skeleton is not
feasible or would not make sense, such as for an isolated action, an
indeterminate operation without a stable content layout, or media buffering.

### `utils`

Contains small, pure, generic functions.

`utils/cn.ts` should expose the class composition function:

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Do not use `utils/` as a generic destination for code without a clear classification.

Fixed application constants and option collections belong in
`src/utils/constants.ts`. Export them with `UPPER_SNAKE_CASE` names, such as
`SOURCE_OPTIONS` and `ASPECT_RATIO_OPTIONS`; pages and components must consume
these exports instead of declaring duplicate literals.

### `lib`

Contains configuration and integration for libraries used across the application.

Possible examples:

```text
lib/query-client.ts
lib/router.ts
```

`lib/` must not contain business rules.

### `http`

Contains the low-level HTTP layer.

```text
http/
|-- client.ts
|-- auth/
|   `-- login.ts
`-- users/
    `-- fetch-user-profile.ts
```

`http/client.ts` configures the Axios instance:

- base URL;
- common headers;
- credential transmission when necessary;
- cross-cutting authentication interception;
- minimal error normalization.

Each endpoint file:

- represents one HTTP operation;
- accepts typed parameters;
- sends the request;
- validates external responses when necessary;
- returns typed data;
- does not manage the TanStack Query cache;
- contains no visual behavior.

Conceptual example:

```ts
export async function fetchUserProfile() {
  const response = await httpClient.get("/users/profile")

  return userProfileSchema.parse(response.data)
}
```

### `services`

Contains frontend use-case coordination and TanStack Query integration.

```text
services/
|-- auth/
|   `-- login.ts
`-- users/
    `-- load-user-profile.ts
```

Responsibilities:

- declare query and mutation options;
- use functions from `http/`;
- define query keys;
- update the cache;
- implement optimistic UI;
- coordinate effects resulting from remote operations;
- expose APIs suitable for pages and hooks.

Expected separation:

```text
Page or component
        |
        v
Service, query, or mutation
        |
        v
HTTP function
        |
        v
API
```

`http/` knows Axios and endpoints. `services/` knows TanStack Query and application behavior.

### `contexts`

Contains genuinely global React contexts.

Possible cases:

- session state beyond what a query provides;
- global preferences;
- theme;
- integration with a browser API that requires a provider.

Do not duplicate data already managed by TanStack Query in a context. Do not use context indiscriminately as a state management replacement.

### `hooks`

Contains reusable hooks.

Place a hook here when it is shared and encapsulates relevant React behavior. Hooks exclusive to a page may remain close to that page.

### `env.ts`

Validates the application's public environment variables with Zod.

Conceptual example:

```ts
import { z } from "zod"

const envSchema = z.object({
  VITE_API_URL: z.url(),
})

export const env = envSchema.parse(import.meta.env)
```

Only public and safe variables may be exposed through Vite. Everything else remains in the backend.

### TanStack Router

The router is responsible for:

- representing the navigation tree;
- validating route and search parameters;
- running loads that must complete before rendering;
- applying authentication boundaries;
- integrating route loading with TanStack Query when appropriate.

Route files must not contain extensive business rules. Pages remain responsible for visual composition.

### TanStack Query

The QueryClient should follow these rules:

```ts
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchInterval: false,
      refetchOnReconnect: true,
    },
  },
})
```

Choose `staleTime` by data category. There must be no periodic time-based refetch.

General rules:

- do not use polling;
- do not use `refetchInterval`;
- allow refetch when the window regains focus;
- allow explicit user-triggered updates;
- update or invalidate the cache after mutations;
- avoid duplicating API responses in local state;
- use stable query keys centralized by domain.

Query key example:

```ts
export const userKeys = {
  all: ["users"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
}
```

### Optimistic UI

The optimistic strategy should follow this pattern:

```ts
const mutation = useMutation({
  mutationFn: updateItem,
  onMutate: async (input) => {
    await queryClient.cancelQueries({ queryKey })

    const previousData = queryClient.getQueryData(queryKey)

    queryClient.setQueryData(queryKey, (current) => {
      return applyOptimisticChange(current, input)
    })

    return { previousData }
  },
  onError: (_error, _input, context) => {
    queryClient.setQueryData(queryKey, context?.previousData)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey })
  },
})
```

The actual implementation must remain typed and handle the possibility that no previous cache entry exists.

Do not use optimistic updates when:

- the result cannot be predicted;
- the operation has security implications;
- the interface may lead users to believe an irreversible action has completed;
- there is no reliable way to restore the previous state.

### Forms

Forms use React Hook Form, Zod, and `zodResolver`.

Conceptual example:

```ts
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

type LoginInput = z.infer<typeof loginSchema>

const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
})
```

The frontend provides immediate feedback, but the API must validate the input again.

## Backend

### Architectural Reference

The backend organization is inspired by Umbriel:

<https://github.com/diego3g/umbriel>

Umbriel organizes code into four main areas:

```text
src/
|-- config/
|-- core/
|-- infra/
`-- modules/
```

In the original reference:

- `core/domain` contains general domain abstractions;
- `core/logic` contains shared logical structures;
- `core/infra` contains framework-independent contracts;
- `modules` organizes rules by functional domain;
- `infra/http` contains the server, routes, middleware, and factories;
- `infra/prisma` contains mappers and repository implementations;
- `infra/providers` contains external integrations;
- queues and messaging live in dedicated infrastructure areas.

This project adapts those ideas to Fastify, Drizzle, and Zod.

Do not copy these elements automatically:

- Express;
- Prisma;
- Joi;
- generic controllers;
- Express adapters;
- `Either`;
- base entities;
- factories for every use case;
- queues, Kafka, or SNS without a concrete need.

### Planned Structure

```text
apps/api/src/
|-- config/
|-- core/
|   |-- domain/
|   |   `-- errors/
|   |-- infra/
|   `-- logic/
|-- infra/
|   |-- database/
|   |   `-- drizzle/
|   |       |-- mappers/
|   |       `-- repositories/
|   |-- http/
|   |   |-- errors/
|   |   |-- factories/
|   |   |-- middlewares/
|   |   |-- routes/
|   |   |-- app.ts
|   |   `-- server.ts
|   `-- providers/
|-- modules/
|   |-- auth/
|   |   |-- domain/
|   |   |-- errors/
|   |   |-- repositories/
|   |   |-- schemas/
|   |   `-- use-cases/
|   `-- users/
|       |-- domain/
|       |-- errors/
|       |-- repositories/
|       |-- schemas/
|       `-- use-cases/
|-- shared/
|-- env.ts
`-- main.ts
```

Do not create empty directories without a current need.

### `config`

Contains application configuration built from the validated environment.

Examples:

```text
config/auth.ts
config/database.ts
config/cors.ts
```

No module should read environment variables directly. It should consume `env` or derived configuration.

### `core`

Contains genuinely cross-cutting abstractions independent of the IPTV domain.

Possible responsibilities:

```text
core/domain/
```

Types or concepts shared by multiple modules.

```text
core/infra/
```

Technical contracts independent of Fastify and Drizzle, when genuinely necessary.

```text
core/logic/
```

Generic logical structures justified by concrete use.

Keep `core/` small. Do not create abstractions merely to reproduce Umbriel.

### `modules`

Organizes the system by functional domain.

Possible future modules:

```text
modules/
|-- auth/
|-- users/
|-- sources/
|-- catalog/
`-- playback/
```

Each module may contain:

```text
domain/
errors/
repositories/
schemas/
use-cases/
```

Not every module needs every directory.

#### `domain`

Contains entities, value objects, and domain rules.

It must not import:

- Fastify;
- Drizzle;
- Axios;
- request or response objects;
- concrete infrastructure implementations.

#### `repositories`

Contains contracts required by use cases.

Conceptual example:

```ts
export interface UsersRepository {
  findById(id: string): Promise<User | null>
  save(user: User): Promise<void>
}
```

Concrete implementations belong in `infra/database/drizzle/repositories`.

#### `schemas`

Contains Zod schemas associated with module inputs, outputs, or concepts when they are not exclusive to the HTTP layer.

Schemas strictly related to HTTP transport may remain close to routes.

#### `errors`

Contains expected module and use-case errors.

Domain errors must not know HTTP status codes. The HTTP layer translates them into appropriate responses.

#### `use-cases`

Contains application operations.

Examples:

```text
modules/users/use-cases/load-user-profile.ts
modules/auth/use-cases/authenticate-user.ts
```

A use case:

- receives validated input;
- applies business rules;
- uses repository or provider contracts;
- returns an application result;
- does not know Fastify;
- does not know Drizzle;
- does not directly manipulate request or reply objects.

### `infra/database/drizzle`

Contains concrete persistence details:

- client and connection;
- database schema;
- migrations;
- mappers;
- repository implementations;
- transactions.

Possible structure:

```text
infra/database/
`-- drizzle/
    |-- schema/
    |-- mappers/
    |-- repositories/
    `-- client.ts
```

Mappers convert between database representations and domain objects when that separation is necessary.

Use cases must depend on contracts, not Drizzle implementations.

### `infra/http`

Contains the Fastify adaptation.

#### `app.ts`

Creates and configures the Fastify instance:

- plugins;
- CORS;
- cookies or sessions;
- serialization;
- global error handling;
- route registration.

#### `server.ts`

Starts the server after validating the environment and dependencies.

#### `routes`

Defines endpoints and adapts HTTP input.

A route should:

1. Validate the input.
2. Obtain request identity and context.
3. Call the use case.
4. Translate the result into an HTTP response.
5. Avoid implementing business rules directly.

#### `middlewares`

Contains authentication and cross-cutting HTTP concerns.

Authentication and authorization are distinct. An authenticated user must still be authorized to access or change a resource.

#### `factories`

Composes dependencies when necessary.

Example:

```text
infra/http/factories/make-authenticate-user.ts
```

A factory may:

- create the concrete repository;
- create required providers;
- inject them into the use case;
- return the configured handler or use case.

Factories are unnecessary for trivial operations when composition remains clear without them.

### `infra/providers`

Contains external integration implementations.

Possible future examples:

```text
infra/providers/
|-- hashing/
|-- storage/
|-- cache/
`-- queue/
```

Contracts consumed by the domain remain outside the concrete implementation.

Do not add providers without a current need.

### Request Flow

The expected flow is:

```text
HTTP request
     |
     v
Fastify route
     |
     v
Zod validation
     |
     v
Use case
     |
     v
Repository or provider contract
     |
     v
Drizzle implementation or external integration
     |
     v
Use case
     |
     v
Safe HTTP response
```

Dependencies point inward:

```text
infrastructure -> application/domain
```

The domain does not depend on infrastructure.

### Errors

Represent expected errors explicitly.

Examples:

- invalid credentials;
- user not found;
- resource not owned by the user;
- invalid source;
- state conflict.

The HTTP layer translates expected errors into appropriate status codes. Unexpected errors must be logged and return a safe message without stack traces or internal details.

### Environment

The backend validates its environment before startup.

Conceptual example:

```ts
import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.url(),
})

export const env = envSchema.parse(process.env)
```

Every module must import `env` or derived configuration instead of accessing `process.env`.

### Persistence

Persistence rules:

- use PostgreSQL;
- use Drizzle ORM;
- create migrations for schema changes;
- do not edit migrations that have already been applied;
- use transactions for atomic operations;
- verify record ownership;
- avoid unscoped queries when a resource is private to a user;
- keep database credentials and URLs in the backend only.

### Security

The API must:

- validate all input;
- limit exposure of internal details;
- protect provider credentials;
- enforce per-resource authorization;
- configure CORS explicitly;
- configure cookies with secure options when used;
- never log tokens or passwords;
- define payload limits;
- normalize external provider failures;
- use timeouts for external requests.

## Typing And Validation

TypeScript provides static safety but does not validate data at runtime.

Use Zod for:

- environment variables;
- HTTP request bodies;
- route parameters;
- query strings;
- form data;
- untrusted external responses;
- imported configuration;
- event payloads, when they exist.

Infer types from schemas when possible:

```ts
const schema = z.object({
  name: z.string().min(1),
})

type Input = z.infer<typeof schema>
```

Avoid maintaining an equivalent type and schema manually.

## Biome

Biome is the official tool for:

- formatting;
- linting;
- import organization.

The project must not add ESLint or Prettier.

Scripts should converge on commands equivalent to:

```json
{
  "scripts": {
    "format": "biome format --write .",
    "lint": "biome check .",
    "lint:fix": "biome check --write ."
  }
}
```

The exact configuration must respect the installed version and monorepo structure.

## Tests

The testing strategy should prioritize:

- domain rules;
- use cases;
- validation;
- authorization;
- persistence mapping;
- optimistic operations and rollback;
- relevant integrations.

Use in-memory implementations for use-case tests when that keeps tests fast and clear.

Infrastructure tests should use real dependencies or controlled environments when database or framework behavior matters.

## Future Decisions

Create an ADR when a decision has meaningful alternatives or lasting consequences.

Suggested format:

```text
docs/adr/
`-- 0001-decision-title.md
```

Minimum content:

```md
# Title

## Context

## Decision

## Alternatives Considered

## Consequences
```

Examples of topics that may require an ADR:

- authentication strategy;
- local playback persistence;
- synchronization model;
- queue selection;
- credential storage strategy;
- adoption of a shared package;
- significant changes to module boundaries.
