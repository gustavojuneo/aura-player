# AURA IPTV

AURA is a source-first IPTV web application for organizing and playing media
from IPTV sources that the user already owns or is legally entitled to use.
It supports Xtream Codes credentials and M3U/M3U8 playlists while keeping the
catalog cache and playback preferences in the browser.

> AURA does not provide, host, sell, or promote channels, movies, series, or
> playlists. Users are responsible for the sources they connect.

## Product tour

The deployed application includes a public landing page, first-source
onboarding, source management, live TV, movie and series catalogs, detail
pages, episode navigation, playback, favorites, and settings. The route list
below is the canonical product tour.

## Routes

The browser application currently exposes the following TanStack Router routes:

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/app` | Home dashboard and featured content |
| `/app/onboarding` | First-source setup flow |
| `/app/tv` | Live channel catalog |
| `/app/tv/$channelId/watch` | Live channel player |
| `/app/movies` | Movie catalog, search, sorting, and categories |
| `/app/movies/$movieId` | Movie details |
| `/app/movies/$movieId/watch` | Movie player |
| `/app/series` | Series catalog, search, sorting, and categories |
| `/app/series/$seriesId` | Series details and episode list |
| `/app/series/$seriesId/episodes/$episodeId/watch` | Episode player |
| `/app/favorites` | All favorites |
| `/app/favorites/movies` | Favorite movies |
| `/app/favorites/series` | Favorite series |
| `/app/favorites/channels` | Favorite channels |
| `/app/sources` | IPTV source management |
| `/app/settings` | Playback, appearance, language, and data settings |

The TV application uses hash history and exposes its application shell at `/`;
the equivalent catalog paths are `/tv`, `/movies`, `/series`, and so on. It
does not expose an `/app` route.

`$channelId`, `$movieId`, `$seriesId`, and `$episodeId` are provider-backed
identifiers generated after a source is imported.

## Highlights

- Xtream Codes and M3U/M3U8 source onboarding.
- Browser-side catalog caching with source switching and refresh controls.
- Live TV, movie, and series catalogs with search and category filters.
- Movie and series detail pages with episode navigation.
- Playback progress, resume behavior, favorites, and recently watched channels.
- Responsive dark UI built around the AURA TV visual system.
- API-side provider validation and SSRF protections for Xtream requests.

## Architecture

This repository is a pnpm/Turborepo monorepo:

```text
apps/
├── api/       Fastify provider gateway and catalog normalization
├── web-app/   Desktop and mobile browser application
└── web-tv/    TV web application and LG webOS package

packages/
└── web-shared/ Browser React catalog, data, UI, and playback capabilities
```

The web application uses React, Vite, TypeScript, Tailwind CSS, TanStack
Router, TanStack Query, Axios, React Hook Form, and Zod. The API uses Fastify
and Zod, and permits outbound requests to arbitrary public IPTV hosts while
rejecting private network targets.

See [`docs/architecture.md`](docs/architecture.md) for the architectural
boundaries and [`docs/deployment-vercel.md`](docs/deployment-vercel.md) for
the two-project Vercel deployment setup.

## Requirements

- Node.js 20 or newer
- pnpm 9.7.1 or newer

## Installation

```bash
pnpm install
```

## Development commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm format
```

The browser application lives in `apps/web-app`, the TV application in
`apps/web-tv`, and the API in `apps/api`. Configure local environment variables
using the examples in the corresponding application and API directories. Never commit real source
credentials or `.env` files.

## LG webOS package

The TV build targets Chromium 68, the web engine used by webOS 5, and uses a
relative asset base plus hash routing so it can run from a packaged `.ipk`.
Generate the webOS application package with:

```bash
pnpm webos:package
```

The LG webOS CLI is installed as a workspace development dependency, so no
global CLI installation is required. The command writes the package to
`apps/web-tv/release`. The webOS build uses the published Render API at
`https://aura-api-ia1i.onrender.com`, injected by the package script.

## Continuous integration and releases

GitHub Actions runs lint, type checks, and tests for pull requests and pushes
to `main`. Creating and pushing a semantic version tag builds and publishes
only the LG webOS `web-tv` `.ipk` package:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The release workflow derives the webOS application version from the tag. Tags
must use the `vMAJOR.MINOR.PATCH`, `vMAJOR.MINOR.PATCH-beta[.N]`, or
`vMAJOR.MINOR.PATCH-rc[.N]` format. Beta and release-candidate tags are
published as GitHub pre-releases, while final tags are published as regular
releases. GitHub automatically generates the release notes for every version.

The catalog is intentionally held only in the application process memory. It
is cleared when the app page is terminated and is reloaded from the selected
source on the next launch. Source definitions, credentials, and the selected
source identifier remain in persistent browser storage so the user does not
need to configure the source again. Switching sources releases the previous
catalog from memory.

For production certification, test on the oldest supported TV model. webOS 5
is the compatibility baseline; older webOS releases use older Chromium engines
and may require a separate certification pass. Provider URLs must be reachable
by the TV and playback/CDN responses must permit the app's network requests.

## Responsible use

Only connect sources that you own or are authorized to use. Never commit real
source credentials or provider URLs to the repository.
