# IPTV Agent Guide

This repository is being rebuilt incrementally. All implementations must follow the architectural decisions described in this file and in `docs/architecture.md`.

Before changing code, inspect the current repository structure. Do not assume that planned applications, packages, routes, tables, or features already exist.

## General Principles

- Use TypeScript in every application and package.
- Keep TypeScript in strict mode.
- Avoid `any`; validate external data before using it.
- Implement only the requested stage or feature.
- Prefer small, clear changes directly related to the task.
- Do not create abstractions before there is a concrete need.
- Do not add backward compatibility without a demonstrated need.
- Keep documentation, scripts, and commands aligned with the repository's actual state.
- Follow the commit rules in `docs/commit-convention.md`. Every commit must
  use Conventional Commits and include a meaningful description of the
  alterations. Add a body separated by a blank line describing the changes;
  omit it only for small changes whose subject is already fully explicit.
- Do not expose credentials, provider configuration, or database access in the frontend.
- Use Zod to validate data at application boundaries.
- Keep the web and API applications independent.
- Create shared packages only when there is concrete reuse across applications.

## Monorepo

- Use pnpm workspaces.
- Use Turborepo to coordinate tasks.
- Keep applications in `apps/`.
- Keep genuinely shared packages in `packages/`.
- Do not move code into a shared package merely for convenience.
- Respect the boundaries between frontend, backend, and shared packages.

## Code Quality

Use Biome as the only tool for:

- linting;
- formatting;
- import organization.

Do not add ESLint or Prettier.

Before completing a change, run the following commands when available:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If a command cannot be run, clearly state why.

## Naming Conventions

- Use kebab-case for every file and directory name.
- Use camelCase for variables, functions, parameters, properties, and application-controlled object keys.
- Use PascalCase for React components, classes, types, and interfaces.
- Use SCREAMING_SNAKE_CASE only for true constants when appropriate.
- Follow framework-mandated names only when a tool requires a different convention.
- Preserve external API and database field names when changing them would break an existing contract.

## Clarification And Assumptions

- Never assume requirements, behavior, architecture, naming, or implementation details.
- When information is missing, ambiguous, or contradictory, stop and ask the user one concise clarification question before proceeding.
- Do not choose between multiple valid approaches without confirming the intended direction with the user.
- Clearly distinguish confirmed requirements from proposals.

## Environment Variables

- Validate every environment variable with Zod during application startup.
- Application code must not access `process.env` or `import.meta.env` directly outside the environment validation module.
- Each application must expose a validated and typed environment object.
- Missing or invalid required variables must prevent the application from starting.
- Public frontend variables must use the prefix required by the bundler.
- Secrets must never be sent to the frontend.
- Keep `.env.example` files current and free of secret values.
- Do not commit real `.env` files.

## Frontend

The web application uses:

- React;
- Vite;
- TypeScript;
- Tailwind CSS;
- `tailwind-merge`;
- `tailwind-variants`;
- shadcn with Base UI components;
- TanStack Router;
- TanStack Query;
- Axios;
- React Hook Form;
- Zod.

Read `docs/architecture.md` before creating pages, components, services, or HTTP integrations.

## Components

- `apps/web/src/components/ui/` contains every reusable UI element and primitive
  used by the application: buttons, progress bars, scroll areas, search fields,
  selects, skeletons, switches, virtualized grids, and similar controls.
- `apps/web/src/components/` contains every shared application component used by
  two or more pages or areas. Examples include `Carousel`, `Catalog`, `Hero`,
  `FavoriteButton`, player panels and lists, `ProgramGuide`, `Header`, `Icon`,
  and `SourceSelector`.
- `apps/web/src/pages/<route>/components/` contains only components that are
  truly private to that route. If a component is used by more than one page,
  move it to `src/components/` or `src/components/ui/` according to its role.
- Never define a meaningful child component inside the file of its parent.
  Extract it to the appropriate directory and use the Compound Components
  Pattern when the parent has coordinated subparts.
- Every Compound Component family must expose its root and all composed
  components through its `index.tsx` public entry point. Consumers must not
  import subcomponents from internal implementation files.
- Private hooks and pure helpers in a component family belong in
  `components/<family>/hooks/` and `components/<family>/utils/` respectively.
  Do not keep `use-*` or `*-utils.ts` files beside visual components.
- Use the Hooks Pattern for reusable stateful behavior, the Compound Pattern
  for coordinated component families, and Render Props only when a component
  owns a boundary/subtree but consumers must control its JSX. Prefer hooks for
  ordinary data sharing.
- Keep components focused on presentation and interaction.
- Use the shadcn `Dialog` component for every dialog or modal. Do not create
  manual dialog overlays or custom scroll-lock behavior.
- Do not implement HTTP communication rules directly in components.

### AURA TV UI System

- The Pencil AURA TV component system is implemented under `apps/web/src/components/ui/`.
- Each reusable primitive has its own kebab-case file: `button.tsx`,
  `live-badge.tsx`, `progress-bar.tsx`, and `search-field.tsx`.
- `SourceSelector` is a shared application component when it coordinates
  provider/source behavior; only its generic underlying controls belong in
  `components/ui/`.
- Export reusable UI primitives through `apps/web/src/components/ui/index.ts`.
- Keep button variants in the single `Button` component. Use `tailwind-variants` for the `primary`, `secondary`, `quiet`, and `destructive` variants instead of separate button wrapper files.
- Compose button classes with the shared `cn` helper so consumer-level classes can override variant classes safely.
- Keep the AURA TV visual tokens in `apps/web/src/styles.css` and reference them through Tailwind semantic utility names such as `bg-bg`, `bg-panel`, `text-text`, `text-muted`, `bg-gold`, and `border-line`.
- The design system is consumed by the application through named exports from `components/ui`; page code should not import implementation files directly when the barrel export is available.

## Styling

- Use Tailwind CSS for styling.
- Use the `cn` function from `src/utils/cn.ts` to compose conditional classes.
- The `cn` function must combine `clsx` and `tailwind-merge`.
- Use `tailwind-variants` for declarative component variants.
- Do not build complex variants manually through string concatenation.
- Preserve the existing tokens, patterns, and visual language.
- Every interface must work on desktop and mobile devices.
- Do not introduce global CSS when a local or token-based solution is sufficient.

## Forms

- Use React Hook Form for form state management.
- Use the shadcn `Field` component inside every form to group each label,
  control, description, and validation message. `Input` is a control inside a
  `Field`, not a replacement for the field wrapper.
- Use Zod to define schemas.
- Integrate React Hook Form and Zod through `zodResolver`.
- The schema must be the source of truth for validation and input type inference.
- Present errors accessibly and close to their corresponding fields.
- Disable or indicate submissions in progress when necessary.
- Do not manually duplicate types that can be inferred from schemas.
- The backend must validate all data again; frontend validation is not a security boundary.

## Routes

- Use TanStack Router.
- Routes should represent navigation, initial loading, and access boundaries.
- Do not concentrate business rules in route files.
- Use the router's typed APIs for links, parameters, and search values.
- Validate search parameters and route inputs.
- Mirror the route hierarchy in `apps/web/src/pages/`: `pages/index.tsx` is `/`,
  `pages/app/index.tsx` is `/app`, and nested routes live below their parent,
  such as `pages/app/onboarding/index.tsx` for `/app/onboarding`.
- Route groups such as `(favorites|movies|series|channels|player)` are valid
  organizational folders and must remain under `pages/app/`.
- Every route page uses `index.tsx`. A route may define `layout.tsx`, whose
  layout applies to that route and its descendants, like Next.js layouts.
  `pages/app/app-shell.tsx` is therefore replaced by `pages/app/layout.tsx`.
- Keep page-specific components inside the corresponding page directory.

## Frontend constants

- Fixed application option sets and values, such as `sourceOptions` and
  `aspectRatioOptions`, belong in `apps/web/src/utils/constants.ts`.
- Export them using `UPPER_SNAKE_CASE` names, for example
  `SOURCE_OPTIONS` and `ASPECT_RATIO_OPTIONS`.

## Loading States

- Use skeletons as the default loading pattern whenever the UI structure and
  content shape can be represented before the data is available.
- Prefer skeletons that preserve the final layout to reduce visual movement and
  make loading states feel continuous.
- Use spinners, progress indicators, or other status feedback only when a
  skeleton is not feasible or does not communicate the state appropriately,
  such as for an isolated action, an indeterminate operation without a stable
  layout, or media playback buffering.
- Loading states must remain accessible and must not be the only way users can
  understand that an operation is in progress.

## HTTP Requests

- Use Axios.
- Keep the configured Axios instance in `src/http/client.ts`.
- Files in `src/http/` perform low-level HTTP requests.
- HTTP functions should represent endpoints and return typed data.
- Do not use Axios directly inside pages or components.
- Interceptors should handle only cross-cutting concerns, such as authentication and basic error normalization.
- Do not place complex business rules in interceptors.

Example separation:

```text
src/http/auth/login.ts
src/http/users/fetch-user-profile.ts
```

## Services And Remote State

- Use TanStack Query for remote state.
- Files in `src/services/` coordinate frontend use cases, queries, mutations, and cache updates.
- Keep query keys stable and reusable.
- Do not duplicate remote state in contexts or local state without a concrete need.
- Reserve contexts for truly global state not addressed by the router or TanStack Query.

Example:

```text
src/services/auth/login.ts
src/services/users/load-user-profile.ts
```

## Optimistic UI

When a mutation supports an optimistic update:

1. Cancel relevant queries before applying the change.
2. Save the previous cache state.
3. Apply the optimistic change.
4. Restore the previous state when an error occurs.
5. Reconcile or invalidate relevant data after the server response when necessary.

Do not apply optimistic UI to operations where a temporarily incorrect state may introduce meaningful risk or where the result cannot be predicted safely.

## Refetch Strategy

- Do not use polling.
- Do not configure `refetchInterval`.
- Do not refetch queries periodically after a fixed amount of time.
- Refetch when the page or application regains focus.
- Configure TanStack Query with `refetchOnWindowFocus: true`.
- Avoid automatic refetch on remount when valid data already exists, unless a specific requirement justifies it.
- Define `staleTime` according to the nature of the data; do not use `staleTime` as a polling mechanism.
- Mutations may invalidate or directly update affected queries.
- Manual refetch is allowed in response to an explicit user action.

## Backend

The API uses:

- Fastify;
- TypeScript;
- PostgreSQL;
- Drizzle ORM;
- Zod.

The backend architecture is inspired by the Umbriel project:

<https://github.com/diego3g/umbriel>

Adapt the reference architecture to Fastify, Drizzle, and Zod. Do not automatically copy dependencies, abstractions, or patterns specific to Express, Prisma, or older libraries.

## Backend Architecture

- Organize rules by business module.
- Keep the domain and use cases independent of the HTTP framework and database.
- Declare repository contracts close to the domain or module that uses them.
- Implement concrete repositories in the infrastructure layer.
- Routes should adapt Fastify requests to use cases.
- Compose dependencies in the infrastructure layer.
- Business rules must not depend directly on Fastify or Drizzle.
- Add queues, events, Kafka, SNS, or other providers only when there is a concrete need.
- Do not automatically reproduce abstractions such as `Either`, base entities, generic controllers, or factories for every use case.
- Create abstractions only when they reduce real duplication or protect an important architectural boundary.

## Database

- Use PostgreSQL and Drizzle ORM.
- Keep database access in the backend.
- Schema changes must include migrations.
- Keep concrete repositories in the infrastructure layer.
- Use cases must not import Drizzle tables or APIs.
- Validate data ownership and authorization before sensitive reads or changes.
- Use transactions for related operations that must be atomic.

## Validation And Security

- Validate request bodies, parameters, query strings, relevant headers, and environment variables.
- Do not trust data received from clients or external providers.
- Do not log passwords, tokens, provider credentials, or sensitive data.
- Authentication identifies the user; authorization verifies whether the user may perform an operation.
- Normalize expected errors without exposing internal details.
- Log unexpected errors on the backend and return a safe response.
- Make CORS, session, cookie, and authentication configuration explicit.

## Tests

- Prioritize tests for business rules and use cases.
- Test optimistic updates, including rollback after errors.
- Test Zod validation at relevant boundaries.
- Test repositories and integrations when important behavior depends on infrastructure.
- Avoid tests that merely reproduce internal implementation details.
- Keep tests close to the code when that is the convention adopted by the module.

## Incremental Development

- Implement one explicitly agreed stage at a time.
- Inspect the current tree before adding an application, package, dependency, route, or table.
- Do not add authentication, catalog, playback, M3U, Xtream, or other unrequested features.
- Do not create empty directories for future features in advance.
- The structure in `docs/architecture.md` is guidance; directories should appear only when they contain real code.
- Keep new decisions compatible with existing ones or clearly document the architectural change.

## Documentation

- `README.md` contains the overview, requirements, and execution commands.
- `AGENTS.md` contains normative rules for agents and contributors.
- `docs/architecture.md` describes the architecture, boundaries, and detailed responsibilities.
- Important or controversial architectural decisions may be recorded as ADRs in `docs/adr/`.
- Update documentation whenever a change modifies the architecture or development workflow.
- Write all project documentation in English.

## Project Skills

Project skills are mirrored under `.codex/skills/` and `.opencode/skills/` so
Codex and OpenCode receive the same project-specific guidance. When changing a
project skill, update both copies in the same change.

Available guidance:

- `.opencode/skills/iptv-turborepo-architecture/SKILL.md`
- `.opencode/skills/iptv-react-ui-design/SKILL.md`
- `.opencode/skills/iptv-theme-system/SKILL.md`
- `.opencode/skills/iptv-xtream-catalog-playback/SKILL.md`
- `.opencode/skills/iptv-m3u-catalog-playback/SKILL.md`
- `.opencode/skills/iptv-local-first-playback/SKILL.md`
- `.opencode/skills/iptv-postgres-drizzle/SKILL.md`
- `.opencode/skills/iptv-api-security/SKILL.md`
- `.opencode/skills/iptv-frontend-architecture/SKILL.md`

Skills may describe future subsystems. Do not assume that files referenced by them exist before the corresponding implementation stage.
