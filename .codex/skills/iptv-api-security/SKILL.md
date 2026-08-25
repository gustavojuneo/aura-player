---
name: iptv-api-security
description: Use when changing Fastify routes, authentication, provider requests, source configuration, sessions, CORS, or API error handling.
---

# IPTV API Security

Read `docs/architecture.md` and `AGENT.md` before changing API code. Respect the
application boundaries: API rules stay in `apps/api`, shared transport schemas
belong in `packages/contracts`, pure rules belong in `packages/domain`, and the
web app must not receive provider credentials or database access.

Parse environment variables in `apps/api/src/env.ts`. Validate input and output
with shared Zod contracts, and set explicit HTTP status codes for every result.

- Keep credentials and decrypted IPTV configuration server-side.
- Encrypt Xtream credentials and M3U configuration with AES-256-GCM before persistence.
- Validate remote URLs and apply SSRF protections before provider requests.
- Restrict CORS origins in production.
- Return safe errors without provider internals, secrets, SQL, tokens, or decrypted configuration.
- Scope source, catalog, and playback data to the authenticated user.
- Treat `x-user-id` and `DEV_USER_ID` as development scaffolding, never production authentication.
- Keep credentials confined to the intended provider host.
- Make retryable endpoints idempotent.
- Keep Fastify adaptation in `apps/api/src/infra/http/`, organized routes in
  the HTTP layer, and business operations in `apps/api/src/modules/<domain>/`.
- Keep use cases independent of Fastify, Drizzle, Axios, and request/reply
  objects; compose concrete dependencies in infrastructure.
- Keep frontend endpoint calls in `apps/web/src/http/` and frontend query or
  mutation coordination in `apps/web/src/services/`.

Run focused API tests and typecheck. Provider-client changes need coverage for
invalid URLs, SSRF boundaries, malformed responses, redaction, and safe status codes.
