---
name: iptv-postgres-drizzle
description: Use when changing PostgreSQL schema, Drizzle queries, migrations, persistence transactions, ownership, or database-related jobs.
---

# IPTV PostgreSQL And Drizzle

Read `docs/architecture.md` and `AGENT.md` before persistence changes. Database
code belongs to the API infrastructure boundary; it must not leak into
`apps/web`, `packages/domain`, or frontend components.

Keep schema definitions in `apps/api/src/db/schema.ts` and generate migrations
with existing Drizzle commands. TypeScript properties use camelCase while
physical PostgreSQL columns use snake_case.

- Scope every user-owned query by authenticated user ID.
- Enforce ownership, uniqueness, foreign keys, and idempotency in the database.
- Keep transactions short and multi-record transitions atomic.
- Make retried operations idempotent where events or requests can repeat.
- Do not persist a complete IPTV catalog permanently; load and cache on demand.
- Never log passwords, tokens, decrypted configuration, credential URLs, expanded SQL, or bound values.
- Validate values at the API boundary with shared Zod contracts.
- Treat migrations as reviewed source artifacts.
- Keep domain rules in `apps/api/src/modules/<domain>/domain` or use cases, and
  keep concrete Drizzle schema, mappers, repositories, and transactions under
  `apps/api/src/infra/database/drizzle/`.
- Use repository contracts from the module boundary; use cases must not import
  Drizzle tables or client APIs directly.

After schema changes, run `pnpm db:generate`, inspect the migration, then run
API migration, typecheck, tests, and affected route verification.
