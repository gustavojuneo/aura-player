# Future User Data API Implementation

## Purpose

This document records the future implementation for persisting user preferences, favorites, movie progress, and series progress through the authenticated API. The feature must be implemented after user authentication is available.

The goal is to move user-owned data out of browser storage so television storage is not consumed unnecessarily and the same user data can be available on multiple devices.

## Current state

The current web application stores playback preferences, favorites, active playback progress, and completed episode markers locally. The target architecture replaces that persistence with API and PostgreSQL storage after authentication is implemented.

The migration must not depend on browser storage being an IndexedDB database; the migration layer should support whatever local adapter is present in the released client.

## Scope

The authenticated API will own:

- user playback preferences;
- favorite channels, movies, and series;
- active movie progress;
- active episode progress;
- completed episode markers.

The API will not own catalog cache data, stream URLs copied into user records, temporary player UI state, or preview buffering state. Catalog metadata must continue to come from the catalog/source subsystem. User records store stable content identities and resolve them against the current catalog when rendered.

## Stable content identity

User records must not depend on an M3U array index or another value that changes when a source is re-imported. Every persisted user reference must contain a stable `sourceId`, `contentType`, and `externalContentKey`.

For movies, `externalContentKey` should be derived from the normalized title and year when the provider does not expose a stable ID. For episodes, it should include the series identity, season number, and episode number.

## PostgreSQL model

The exact Drizzle schema will be created when authentication is introduced.

### `user_preferences`

One row per user:

```text
user_id              primary key, references users(id)
preview_muted        boolean not null default true
auto_resume          boolean not null default true
auto_next_episode    boolean not null default true
hide_controls        boolean not null default true
reduce_motion        boolean not null default false
quality              enum not null default 'auto'
updated_at           timestamptz not null
```

Updates should use partial PATCH semantics.

### `user_favorites`

```text
id                   uuid primary key
user_id              uuid not null references users(id)
source_id            text not null
content_type         enum('channel', 'movie', 'series') not null
content_key          text not null
created_at           timestamptz not null
```

Required constraint:

```text
unique(user_id, source_id, content_type, content_key)
```

### `playback_progress`

```text
id                   uuid primary key
user_id              uuid not null references users(id)
source_id            text not null
content_type         enum('movie', 'episode') not null
content_key          text not null
series_key            text
season_number        integer
episode_number       integer
position_seconds     integer not null
duration_seconds     integer not null
updated_at           timestamptz not null
```

Rules:

- unique active progress per user/content identity;
- position must be non-negative and duration must be positive;
- reject timestamps materially in the future;
- remove records whose `updated_at` is older than 15 days;
- retain at most five active movie records per user;
- completing content deletes its active progress record.

The five-movie rule should be enforced in the use case inside a transaction. Add an index on `(user_id, content_type, updated_at desc)`.

### `watched_episodes`

```text
id                   uuid primary key
user_id              uuid not null references users(id)
source_id            text not null
series_key           text not null
episode_key          text not null
watched_at           timestamptz not null
```

Required constraint:

```text
unique(user_id, source_id, series_key, episode_key)
```

This table stores only compact completion markers. It must not retain temporal progress for completed episodes.

## API contract

Group routes under `/me`; every resource is scoped to the authenticated user.

```http
GET   /me/preferences
PATCH /me/preferences

GET    /me/favorites
POST   /me/favorites
DELETE /me/favorites/:contentType/:sourceId/:contentKey

GET    /me/playback-progress
PUT    /me/playback-progress/:contentType/:sourceId/:contentKey
DELETE /me/playback-progress/:contentType/:sourceId/:contentKey
POST   /me/playback-progress/:contentType/:sourceId/:contentKey/complete

GET /me/watched-episodes?seriesKey=...
```

All request bodies, parameters, and relevant headers must be validated with Zod.

Favorite creation and deletion must be idempotent. Progress PUT accepts an idempotency key and must not allow an older snapshot to overwrite a newer valid `updatedAt`.

Completion must be atomic:

- movie completion deletes active progress;
- episode completion deletes active progress and inserts the watched marker;
- final-episode completion must not leave an active progress record.

## Synchronization strategy

1. Load server preferences, favorites, progress, and watched markers.
2. Read the local adapter only for migration and unsent mutations.
3. Reconcile local and server data using explicit conflict rules.
4. Upload local records through idempotent requests.
5. Wait for successful server confirmation.
6. Replace the client query cache with server state.
7. Delete migrated local records.

The server is authoritative after migration completes.

For progress conflicts, the latest valid `updatedAt` wins. Future timestamps must be rejected. Favorites use set semantics. Preference conflicts use field-level PATCH semantics.

## Offline queue

The client may retain a very small temporary mutation queue while offline. Entries contain only the operation, resource identity, small validated payload, idempotency key, and creation time.

The queue must be bounded and pruned after confirmation. It must not contain catalog metadata, images, stream URLs, or credentials.

Flush on reconnect, application startup, window focus, pause or player exit, completion, and route change. Do not introduce periodic polling.

## Frontend structure

Recommended future modules:

```text
apps/web/src/http/user/
├── preferences.ts
├── favorites.ts
├── playback-progress.ts
└── watched-episodes.ts

apps/web/src/services/user/
├── load-user-preferences.ts
├── manage-favorites.ts
├── manage-playback-progress.ts
└── migrate-local-user-data.ts
```

TanStack Query keys should be scoped to the authenticated user:

```ts
["user", userId, "preferences"]
["user", userId, "favorites"]
["user", userId, "playback-progress"]
["user", userId, "watched-episodes", seriesKey]
```

Components must not call Axios directly. Player lifecycle code emits progress, pause, exit, and completion events; the service layer performs API mutations and queue handling.

## Local storage removal

Do not remove local persistence before server confirmation. The sequence is:

```text
local data → authenticated upload → server confirmation → cache replacement → local cleanup
```

After migration succeeds:

- disable writes to the old local adapters;
- remove user data from localStorage/IndexedDB;
- retain only non-user temporary UI state locally;
- never cache provider credentials or stream URLs in user records.

Use a migration version key to prevent repeated migration attempts while allowing retries after failed uploads.

## Retention and cleanup

The API must enforce retention independently of the client:

- active progress expires after 15 days without an update;
- completed movies have no progress or history record;
- completed episodes have only a compact watched marker;
- only five active movie progress records are retained per user.

A database cleanup job may remove expired progress in batches. Request-time cleanup must also apply when reading active progress. The job must be idempotent and must not require catalog payloads.

## Security requirements

- Require authentication on every `/me` endpoint.
- Derive `userId` exclusively from the validated session.
- Never accept `userId` from the request body or path.
- Validate content identity and progress values with Zod.
- Enforce ownership in every repository query.
- Apply rate limits to mutation endpoints.
- Return safe errors without leaking database or provider details.
- Never log tokens, passwords, stream URLs, or complete request payloads.

## Testing plan

Add tests for unauthenticated access rejection, ownership isolation, preference validation, idempotent favorites, five-movie retention, 15-day expiry, movie completion removal, episode completion plus watched-marker insertion, stale and future timestamps, transaction rollback, migration retry, cleanup-after-confirmation, and offline queue deduplication.

## Delivery stages

1. Implement authentication and session validation.
2. Add database tables, indexes, constraints, and migrations.
3. Add domain rules and repository contracts.
4. Add Fastify routes, Zod schemas, and authorization.
5. Add typed web HTTP modules and TanStack Query services.
6. Add local-to-server migration and bounded offline queue.
7. Switch player and settings to server-backed state.
8. Verify migration on webOS hardware.
9. Remove user-data writes from localStorage/IndexedDB.
10. Run full lint, typecheck, test, and build checks.

Update this document if authentication, identity resolution, or synchronization decisions change.

