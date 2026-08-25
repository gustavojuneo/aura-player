# IPTV

This project is being rebuilt incrementally as a pnpm/Turborepo monorepo. The
current implementation contains only the initial React/Vite frontend setup.

## Requirements

- Node.js 20 or newer
- pnpm 9.7.1 or newer

## Install

```bash
pnpm install
```

## Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm format
```

The web application is available at `apps/web`. Product screens, API
integrations, authentication, catalog, and playback will be implemented in
later approved stages.

Deployment instructions for the two Vercel projects are available in
[`docs/deployment-vercel.md`](docs/deployment-vercel.md).
