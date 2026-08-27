# Vercel Deployment

The repository is configured for two independent Vercel Projects that use the
same Git repository:

- `apps/web-app`: the Vite browser frontend;
- `apps/api`: the Fastify API deployed as a Vercel Node backend.

## Create the projects

Create one Vercel Project for each application and configure the same GitHub
repository for both. In each project set the Root Directory to the matching
application directory:

```text
apps/web-app
apps/api
```

Keep the detected pnpm package manager and enable the option to include files
outside the Root Directory when Vercel presents it. The web application uses
its `vercel.json` for the Vite build and SPA fallback. Vercel detects
`apps/api/src/server.ts` as the Fastify entrypoint and exposes its routes
directly at the API project root.

## Environment variables

For the web project, add this Production variable:

```text
VITE_API_URL=https://<api-project>.vercel.app
```

Add `VITE_PLAYBACK_URLS` only when playback overrides are required. Its value
must be a JSON object, for example `{}`.

For the API project, add these Production variables:

```text
CLIENT_URL=https://<web-project>.vercel.app
```

`IPTV_PROXY_ALLOWED_HOSTS` is not required. The API accepts arbitrary public
provider hosts and continues to reject private network targets.

`PORT` is supplied by Vercel and is not needed in the Vercel project. Add the
same variables to Preview if preview deployments should communicate with each
other; otherwise use the corresponding preview URLs.

Deploy the API first, copy its deployment URL into `VITE_API_URL`, and then
deploy the web project. After deployment, check:

```text
https://<api-project>.vercel.app/health
```

It should return `{ "status": "ok" }`.
