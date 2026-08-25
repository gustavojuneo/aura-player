import dns from "node:dns/promises";
import net from "node:net";
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { z } from "zod";
import { env } from "./env.ts";

type Target = { expiresAt: number; url: URL };
type XtreamCredentials = { server: URL; username: string; password: string };
const xtreamCredentialsSchema = z.object({
  password: z.string().min(1),
  server: z.url(),
  username: z.string().min(1),
});
type XtreamCredentialsInput = z.infer<typeof xtreamCredentialsSchema>;

const app = Fastify({ logger: true });
await app.register(cors, {
  origin: env.CLIENT_URL,
});
const targets = new Map<string, Target>();
const targetTtlMs = 5 * 60 * 1000;
const allowedHosts = new Set(
  env.IPTV_PROXY_ALLOWED_HOSTS.split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean),
);

function isPrivateAddress(address: string) {
  const version = net.isIP(address);
  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 0
    );
  }
  return (
    address === "::1" ||
    address.startsWith("fc") ||
    address.startsWith("fd") ||
    address.startsWith("fe80:")
  );
}

async function validateProviderServer(rawServer: unknown) {
  if (typeof rawServer !== "string") throw new Error("INVALID_SERVER");
  const server = new URL(rawServer.trim());
  if (!["http:", "https:"].includes(server.protocol))
    throw new Error("UNSUPPORTED_PROTOCOL");
  if (server.username || server.password) throw new Error("CREDENTIALS_IN_URL");
  const addresses = await dns.lookup(server.hostname, { all: true });
  if (addresses.some(({ address }) => isPrivateAddress(address)))
    throw new Error("PRIVATE_TARGET");
  return server;
}

async function credentialsFromBody(body: unknown) {
  const input = xtreamCredentialsSchema.parse(body);
  return {
    password: input.password,
    server: await validateProviderServer(input.server),
    username: input.username,
  } satisfies XtreamCredentials;
}

function providerUrl(
  server: URL,
  username: string,
  password: string,
  action: string,
  params?: Record<string, string>,
) {
  const url = new URL("player_api.php", server);
  url.search = new URLSearchParams({
    username,
    password,
    action,
    ...params,
  }).toString();
  return url;
}

async function fetchXtream<T>(
  credentials: XtreamCredentials,
  action: string,
  params?: Record<string, string>,
) {
  const response = await fetch(
    providerUrl(
      credentials.server,
      credentials.username,
      credentials.password,
      action,
      params,
    ),
  );
  if (!response.ok) throw new Error("PROVIDER_UNAVAILABLE");
  const payload: unknown = await response.json();
  return payload as T;
}

function text(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function url(value: unknown) {
  const candidate = text(value);
  if (!candidate) return undefined;
  try {
    const parsed = new URL(candidate);
    return ["http:", "https:"].includes(parsed.protocol)
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function assetUrl(value: unknown) {
  const candidate = url(value);
  if (!candidate) return undefined;
  const parsed = new URL(candidate);
  if (parsed.protocol === "http:") parsed.protocol = "https:";
  return parsed.toString();
}

function numberValue(value: unknown) {
  const result = Number(value);
  return Number.isFinite(result) && result >= 0 ? result : undefined;
}

function yearValue(value: unknown) {
  const match = text(value)?.match(/\b(\d{4})\b/);
  return match ? Number(match[1]) : undefined;
}

function categoryMap(payload: unknown) {
  const categories = new Map<string, string>();
  const rows = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object"
      ? (payload as { categories?: unknown }).categories
      : undefined;
  if (!Array.isArray(rows)) return categories;
  for (const value of rows) {
    if (!value || typeof value !== "object") continue;
    const row = value as Record<string, unknown>;
    const id = text(row.category_id) ?? text(row.id) ?? text(row.categoryId);
    const name =
      text(row.category_name) ??
      text(row.name) ??
      text(row.category) ??
      text(row.title);
    if (id && name) categories.set(id, name);
  }
  return categories;
}

function mediaUrl(
  credentials: XtreamCredentials,
  kind: "live" | "movie" | "episode",
  id: string,
  extension: string,
) {
  const folder =
    kind === "movie" ? "movie" : kind === "live" ? "live" : "series";
  return new URL(
    `${folder}/${encodeURIComponent(credentials.username)}/${encodeURIComponent(credentials.password)}/${encodeURIComponent(id)}.${extension || "mp4"}`,
    credentials.server,
  ).toString();
}

function episodeMediaUrl(
  credentials: XtreamCredentials,
  episode: Record<string, unknown>,
  episodeInfo: Record<string, unknown>,
) {
  const directSource = url(episode.direct_source);
  if (directSource) {
    const parsed = new URL(directSource);
    if (parsed.hostname === credentials.server.hostname)
      parsed.protocol = "http:";
    return parsed.toString();
  }
  const episodeServer = new URL(credentials.server);
  episodeServer.protocol = "http:";
  return mediaUrl(
    { ...credentials, server: episodeServer },
    "episode",
    text(episode.id) ?? "",
    text(episode.container_extension) ??
      text(episodeInfo.container_extension) ??
      "mp4",
  );
}

async function mapXtreamCatalog(
  sourceId: string,
  credentials: XtreamCredentials,
) {
  const [
    livePayload,
    moviesPayload,
    seriesPayload,
    liveCategoriesPayload,
    movieCategoriesPayload,
    seriesCategoriesPayload,
  ] = await Promise.all([
    fetchXtream<unknown>(credentials, "get_live_streams"),
    fetchXtream<unknown>(credentials, "get_vod_streams"),
    fetchXtream<unknown>(credentials, "get_series"),
    fetchXtream<unknown>(credentials, "get_live_categories").catch(() => []),
    fetchXtream<unknown>(credentials, "get_vod_categories").catch(() => []),
    fetchXtream<unknown>(credentials, "get_series_categories").catch(() => []),
  ]);
  const live = Array.isArray(livePayload) ? livePayload : [];
  const movies = Array.isArray(moviesPayload) ? moviesPayload : [];
  const seriesRows = Array.isArray(seriesPayload) ? seriesPayload : [];
  const liveCategories = categoryMap(liveCategoriesPayload);
  const movieCategories = categoryMap(movieCategoriesPayload);
  const seriesCategories = categoryMap(seriesCategoriesPayload);
  const items: unknown[] = [];
  const series: unknown[] = [];
  for (const [index, channel] of live.entries()) {
    if (!channel || typeof channel !== "object") continue;
    const row = channel as Record<string, unknown>;
    const id = text(row.stream_id);
    if (!id) continue;
    const category =
      text(row.category_name) ??
      text(row.category) ??
      text(row.group_title) ??
      liveCategories.get(text(row.category_id) ?? "");
    const extension = text(row.container_extension) ?? "ts";
    items.push({
      id: `${sourceId}:live:${id}`,
      sourceId,
      kind: "live",
      title: text(row.name) ?? `Canal ${index + 1}`,
      groupTitle: category,
      categories: category ? [category] : [],
      logoUrl: assetUrl(row.stream_icon),
      streamUrl: mediaUrl(credentials, "live", id, extension),
      delivery: "mpeg-ts",
      providerId: id,
      tvgId: text(row.epg_channel_id),
      tvgName: text(row.name),
    });
  }
  for (const [index, movie] of movies.entries()) {
    if (!movie || typeof movie !== "object") continue;
    const row = movie as Record<string, unknown>;
    const id = text(row.stream_id);
    if (!id) continue;
    const title = text(row.name) ?? `Filme ${index + 1}`;
    const category =
      text(row.category_name) ??
      text(row.category) ??
      text(row.group_title) ??
      movieCategories.get(text(row.category_id) ?? "");
    items.push({
      id: `${sourceId}:movie:${id}`,
      sourceId,
      kind: "movie",
      title,
      groupTitle: category,
      categories: category ? [category] : [],
      logoUrl: assetUrl(row.stream_icon),
      streamUrl: mediaUrl(
        credentials,
        "movie",
        id,
        text(row.container_extension) ?? "mp4",
      ),
      delivery: "native",
      providerId: id,
      year: yearValue(row.year),
    });
  }
  for (const [index, rowValue] of seriesRows.entries()) {
    if (!rowValue || typeof rowValue !== "object") continue;
    const row = rowValue as Record<string, unknown>;
    const id = text(row.series_id);
    if (!id) continue;
    const title = text(row.name) ?? `Série ${index + 1}`;
    const category =
      text(row.category_name) ??
      text(row.category) ??
      text(row.group_title) ??
      seriesCategories.get(text(row.category_id) ?? "");
    const seriesKey = `${sourceId}:series:${id}`;
    series.push({
      id: seriesKey,
      providerId: id,
      sourceId,
      title,
      groupTitle: category,
      categories: category ? [category] : [],
      posterUrl: assetUrl(row.cover),
      seasonCount: numberValue(row.num) ?? 0,
      episodeCount: 0,
    });
  }
  return {
    items,
    series,
    counts: {
      itemCount: items.length,
      liveCount: items.filter(
        (item) => (item as { kind?: string }).kind === "live",
      ).length,
      movieCount: movies.length,
      episodeCount: items.filter(
        (item) => (item as { kind?: string }).kind === "episode",
      ).length,
    },
  };
}

app.post<{
  Body: {
    name?: string;
    server?: string;
    username?: string;
    password?: string;
  };
}>("/xtream/catalog", async (request, reply) => {
  try {
    const credentials = await credentialsFromBody(request.body);
    const sourceId = `xtream-${crypto.randomUUID()}`;
    const catalog = await mapXtreamCatalog(sourceId, credentials);
    return reply.code(201).send({
      source: {
        id: sourceId,
        name: text(request.body?.name) ?? "Xtream",
        type: "xtream",
        server: credentials.server.toString(),
        username: credentials.username,
        status: catalog.items.length ? "ready" : "empty",
        ...catalog.counts,
      },
      ...catalog,
    });
  } catch {
    return reply
      .code(502)
      .send({ message: "Não foi possível carregar o catálogo Xtream." });
  }
});

app.post<{
  Params: { sourceId: string };
  Body: { name?: string };
}>("/xtream/catalog/:sourceId/refresh", async (request, reply) => {
  try {
    const credentials = await credentialsFromBody(request.body);
    const catalog = await mapXtreamCatalog(
      request.params.sourceId,
      credentials,
    );
    return reply.send({
      source: {
        id: request.params.sourceId,
        name: text(request.body?.name) ?? "Xtream",
        type: "xtream",
        server: credentials.server.toString(),
        username: credentials.username,
        status: catalog.items.length ? "ready" : "empty",
        ...catalog.counts,
      },
      ...catalog,
    });
  } catch {
    return reply
      .code(502)
      .send({ message: "Não foi possível sincronizar o catálogo Xtream." });
  }
});

app.post<{
  Body: XtreamCredentialsInput;
  Params: { sourceId: string; providerId: string };
}>("/xtream/catalog/:sourceId/movie/:providerId", async (request, reply) => {
  const credentials = await credentialsFromBody(request.body).catch(() => null);
  if (!credentials)
    return reply.code(400).send({ message: "Invalid Xtream credentials" });
  const details = await fetchXtream<unknown>(credentials, "get_vod_info", {
    vod_id: request.params.providerId,
  }).catch(() => null);
  if (!details)
    return reply.code(502).send({ message: "Provider unavailable" });
  const payload = details as Record<string, unknown>;
  const info =
    payload.info &&
    typeof payload.info === "object" &&
    !Array.isArray(payload.info)
      ? (payload.info as Record<string, unknown>)
      : {};
  const rawEpisodes =
    payload.episodes &&
    typeof payload.episodes === "object" &&
    !Array.isArray(payload.episodes)
      ? Object.values(payload.episodes as Record<string, unknown>).flatMap(
          (value) => (Array.isArray(value) ? value : []),
        )
      : [];
  const seriesTitle = text(info.name) ?? "Série";
  const episodes = rawEpisodes.flatMap((value) => {
    if (!value || typeof value !== "object") return [];
    const episode = value as Record<string, unknown>;
    const providerId = text(episode.id);
    if (!providerId) return [];
    const episodeInfo =
      episode.info &&
      typeof episode.info === "object" &&
      !Array.isArray(episode.info)
        ? (episode.info as Record<string, unknown>)
        : {};
    const seasonNumber = Math.max(1, numberValue(episode.season) ?? 1);
    const episodeNumber = Math.max(1, numberValue(episode.episode_num) ?? 1);
    return [
      {
        id: `${request.params.sourceId}:episode:${providerId}`,
        sourceId: request.params.sourceId,
        kind: "episode",
        providerId,
        title: text(episode.title) ?? `Episódio ${episodeNumber}`,
        categories: [],
        seriesId: `${request.params.sourceId}:series:${request.params.providerId}`,
        seriesTitle,
        seasonNumber,
        episodeNumber,
        logoUrl: assetUrl(episodeInfo.movie_image),
        stillUrl: assetUrl(episodeInfo.movie_image),
        description: text(episodeInfo.plot ?? episodeInfo.description),
        durationSecs: numberValue(episodeInfo.duration_secs),
        rating: numberValue(episodeInfo.rating),
        streamUrl: episodeMediaUrl(credentials, episode, episodeInfo),
        delivery: "native",
      },
    ];
  });
  return reply.send({ info, episodes });
});

app.post<{
  Body: XtreamCredentialsInput;
  Params: { sourceId: string; providerId: string };
}>("/xtream/catalog/:sourceId/series/:providerId", async (request, reply) => {
  const credentials = await credentialsFromBody(request.body).catch(() => null);
  if (!credentials)
    return reply.code(400).send({ message: "Invalid Xtream credentials" });
  const details = await fetchXtream<unknown>(credentials, "get_series_info", {
    series_id: request.params.providerId,
  }).catch(() => null);
  if (!details)
    return reply.code(502).send({ message: "Provider unavailable" });
  const payload = details as Record<string, unknown>;
  const info =
    payload.info &&
    typeof payload.info === "object" &&
    !Array.isArray(payload.info)
      ? (payload.info as Record<string, unknown>)
      : {};
  const rawEpisodes =
    payload.episodes &&
    typeof payload.episodes === "object" &&
    !Array.isArray(payload.episodes)
      ? Object.values(payload.episodes as Record<string, unknown>).flatMap(
          (value) => (Array.isArray(value) ? value : []),
        )
      : [];
  const seriesTitle = text(info.name) ?? "Série";
  const episodes = rawEpisodes.flatMap((value) => {
    if (!value || typeof value !== "object") return [];
    const episode = value as Record<string, unknown>;
    const providerId = text(episode.id);
    if (!providerId) return [];
    const episodeInfo =
      episode.info &&
      typeof episode.info === "object" &&
      !Array.isArray(episode.info)
        ? (episode.info as Record<string, unknown>)
        : {};
    const seasonNumber = Math.max(1, numberValue(episode.season) ?? 1);
    const episodeNumber = Math.max(1, numberValue(episode.episode_num) ?? 1);
    return [
      {
        id: `${request.params.sourceId}:episode:${providerId}`,
        sourceId: request.params.sourceId,
        kind: "episode",
        providerId,
        title: text(episode.title) ?? `Episódio ${episodeNumber}`,
        categories: [],
        seriesId: `${request.params.sourceId}:series:${request.params.providerId}`,
        seriesTitle,
        seasonNumber,
        episodeNumber,
        logoUrl: assetUrl(episodeInfo.movie_image),
        stillUrl: assetUrl(episodeInfo.movie_image),
        description: text(episodeInfo.plot ?? episodeInfo.description),
        durationSecs: numberValue(episodeInfo.duration_secs),
        rating: numberValue(episodeInfo.rating),
        streamUrl: episodeMediaUrl(credentials, episode, episodeInfo),
        delivery: "native",
      },
    ];
  });
  return reply.send({ info, episodes });
});

async function validateTarget(rawUrl: unknown) {
  if (typeof rawUrl !== "string") throw new Error("INVALID_TARGET");
  const url = new URL(rawUrl);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("UNSUPPORTED_PROTOCOL");
  if (!allowedHosts.has(url.hostname.toLowerCase()))
    throw new Error("HOST_NOT_ALLOWED");
  const addresses = await dns.lookup(url.hostname, { all: true });
  if (addresses.some(({ address }) => isPrivateAddress(address)))
    throw new Error("PRIVATE_TARGET");
  return url;
}

async function validateRedirect(rawUrl: string, previous: URL) {
  const url = new URL(rawUrl, previous);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("UNSUPPORTED_REDIRECT_PROTOCOL");
  const hostname = url.hostname.toLowerCase();
  const addresses = await dns.lookup(hostname, { all: true });
  if (addresses.some(({ address }) => isPrivateAddress(address)))
    throw new Error("REDIRECT_PRIVATE_TARGET");
  return url;
}

async function fetchMedia(
  url: URL,
  range: string | undefined,
  requestUserAgent: string | undefined,
) {
  let current = url;
  let useConfiguredUserAgent = true;
  const userAgent =
    requestUserAgent?.trim() ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36";
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let response: Response;
    try {
      response = await fetch(current, {
        headers: {
          Accept: "*/*",
          ...(range ? { Range: range } : {}),
          ...(useConfiguredUserAgent ? { "User-Agent": userAgent } : {}),
        },
        redirect: "manual",
        signal: controller.signal,
      });
      if (response.status === 403 && useConfiguredUserAgent) {
        await response.body?.cancel();
        useConfiguredUserAgent = false;
        response = await fetch(current, {
          headers: {
            Accept: "*/*",
            ...(range ? { Range: range } : {}),
          },
          redirect: "manual",
          signal: controller.signal,
        });
      }
    } finally {
      clearTimeout(timeout);
    }
    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return response;
    }
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (!location) throw new Error("REDIRECT_WITHOUT_LOCATION");
    current = await validateRedirect(location, current);
  }
  throw new Error("TOO_MANY_REDIRECTS");
}

async function resolveMediaRedirect(
  url: URL,
  headers: {
    origin?: string;
    referer?: string;
    userAgent?: string;
  },
) {
  const userAgent =
    headers.userAgent?.trim() ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36";
  const response = await fetch(url, {
    headers: {
      Accept: "*/*",
      Range: "bytes=0-0",
      "User-Agent": userAgent,
      ...(headers.origin ? { Origin: headers.origin } : {}),
      ...(headers.referer ? { Referer: headers.referer } : {}),
    },
    redirect: "follow",
  });
  const resolvedUrl = new URL(response.url);
  await response.body?.cancel();
  if (
    resolvedUrl.protocol === "http:" &&
    resolvedUrl.hostname !== url.hostname
  ) {
    resolvedUrl.protocol = "https:";
  }
  if (resolvedUrl.protocol !== "https:") {
    const error = new Error("MEDIA_REDIRECT_NOT_SECURE");
    Object.assign(error, {
      upstreamHost: resolvedUrl.hostname,
      upstreamStatus: response.status,
    });
    throw error;
  }
  const addresses = await dns.lookup(resolvedUrl.hostname, { all: true });
  if (addresses.some(({ address }) => isPrivateAddress(address)))
    throw new Error("MEDIA_REDIRECT_PRIVATE_TARGET");
  return resolvedUrl;
}

function cleanupTargets() {
  const now = Date.now();
  for (const [id, target] of targets)
    if (target.expiresAt <= now) targets.delete(id);
}

app.post<{ Body: { url?: string } }>(
  "/media-targets",
  async (request, reply) => {
    try {
      const url = await validateTarget(request.body?.url);
      cleanupTargets();
      if (targets.size >= 100)
        return reply
          .code(429)
          .send({ message: "Too many active media targets" });
      const targetId = crypto.randomUUID();
      targets.set(targetId, { expiresAt: Date.now() + targetTtlMs, url });
      return reply
        .code(201)
        .send({ targetId, expiresAt: Date.now() + targetTtlMs });
    } catch {
      return reply.code(400).send({ message: "Invalid media target" });
    }
  },
);

app.post<{ Body: { url?: string } }>(
  "/media-resolve",
  async (request, reply) => {
    try {
      const url = await validateTarget(request.body?.url);
      const resolvedUrl = await resolveMediaRedirect(url, {
        origin:
          typeof request.headers.origin === "string"
            ? request.headers.origin
            : undefined,
        referer:
          typeof request.headers.referer === "string"
            ? request.headers.referer
            : undefined,
        userAgent:
          typeof request.headers["user-agent"] === "string"
            ? request.headers["user-agent"]
            : undefined,
      });
      if (resolvedUrl.protocol !== "https:")
        throw new Error("MEDIA_REDIRECT_NOT_SECURE");
      return reply.send({ resolvedUrl: resolvedUrl.toString() });
    } catch (error) {
      request.log.error(
        {
          errorMessage: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : undefined,
          upstreamHost:
            error instanceof Error
              ? (error as Error & { upstreamHost?: string }).upstreamHost
              : undefined,
          upstreamStatus:
            error instanceof Error
              ? (error as Error & { upstreamStatus?: number }).upstreamStatus
              : undefined,
        },
        "Media redirect resolution failed",
      );
      return reply.code(502).send({ message: "Media unavailable" });
    }
  },
);

app.get<{ Params: { targetId: string } }>(
  "/media/:targetId",
  async (request, reply) => {
    cleanupTargets();
    const target = targets.get(request.params.targetId);
    reply.header("Access-Control-Allow-Origin", env.CLIENT_URL);
    if (!target)
      return reply.code(404).send({ message: "Media target expired" });
    try {
      const requestUserAgent = request.headers["user-agent"];
      const response = await fetchMedia(
        target.url,
        request.headers.range,
        typeof requestUserAgent === "string" ? requestUserAgent : undefined,
      );
      if (!response.ok || !response.body)
        return reply
          .code(response.status)
          .send({ message: "Media unavailable" });
      reply.code(response.status);
      reply.header("Cache-Control", "no-store");
      for (const header of [
        "content-type",
        "content-length",
        "content-range",
        "accept-ranges",
      ]) {
        const value = response.headers.get(header);
        if (value) reply.header(header, value);
      }
      const body = Readable.fromWeb(
        response.body as unknown as NodeReadableStream,
      );
      reply.raw.on("close", () => {
        if (!reply.raw.writableFinished) body.destroy();
      });
      return reply.send(body);
    } catch (error) {
      request.log.error(
        {
          errorCause:
            error instanceof Error && error.cause instanceof Error
              ? error.cause.message
              : undefined,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : undefined,
          targetHost: target.url.hostname,
        },
        "Media proxy failed",
      );
      return reply.code(502).send({ message: "Media unavailable" });
    }
  },
);

app.get("/health", async () => ({ status: "ok" }));

export { app };
export default app;

if (!env.VERCEL) {
  const shutdown = async () => {
    await app.close();
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  await app.listen({ host: "0.0.0.0", port: env.PORT });
}
