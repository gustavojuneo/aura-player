import dns from "node:dns/promises";
import net from "node:net";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { z } from "zod";
import { env } from "./env.ts";

type XtreamCredentials = { server: URL; username: string; password: string };
const xtreamCredentialsSchema = z.object({
  password: z.string().min(1),
  server: z.url(),
  username: z.string().min(1),
});
type XtreamCredentialsInput = z.infer<typeof xtreamCredentialsSchema>;

const app = Fastify({ logger: true });
await app.register(cors, {
  origin: [env.CLIENT_URL, /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/],
});

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
  return url(value);
}

function numberValue(value: unknown) {
  const result = Number(value);
  return Number.isFinite(result) && result >= 0 ? result : undefined;
}

function yearValue(value: unknown) {
  const match = text(value)?.match(/\b(\d{4})\b/);
  return match ? Number(match[1]) : undefined;
}

function decodeXtreamText(value: unknown) {
  const raw = text(value);
  if (!raw) return "";
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(raw) || raw.length % 4 !== 0) {
    return raw;
  }
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8").trim();
    return decoded && !decoded.includes("\uFFFD") ? decoded : raw;
  } catch {
    return raw;
  }
}

function epgDate(value: unknown, timestamp: unknown) {
  const unix = Number(timestamp);
  if (Number.isFinite(unix) && unix > 0) {
    const milliseconds = unix > 1_000_000_000_000 ? unix : unix * 1000;
    return new Date(milliseconds).toISOString();
  }
  const raw = text(value);
  if (!raw) return undefined;
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const withTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized)
    ? normalized
    : `${normalized}Z`;
  const parsed = Date.parse(withTimezone);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : undefined;
}

function normalizeEpgPrograms(payload: unknown) {
  const rows =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as { epg_listings?: unknown }).epg_listings
      : undefined;
  const listings = Array.isArray(rows)
    ? rows
    : rows && typeof rows === "object"
      ? Object.values(rows)
      : [];
  const normalizedPrograms = listings
    .flatMap((value, index) => {
      if (!value || typeof value !== "object") return [];
      const row = value as Record<string, unknown>;
      const start = epgDate(row.start, row.start_timestamp);
      const stop = epgDate(row.stop ?? row.end, row.stop_timestamp);
      if (!start || !stop || Date.parse(stop) <= Date.parse(start)) return [];
      return [
        {
          description: decodeXtreamText(row.description),
          id: text(row.id) ?? String(index),
          start,
          stop,
          title: decodeXtreamText(row.title) || "Sem título",
        },
      ];
    })
    .sort(
      (first, second) => Date.parse(first.start) - Date.parse(second.start),
    );

  return normalizedPrograms.reduce<typeof normalizedPrograms>(
    (result, program) => {
      const previous = result.at(-1);
      if (!previous) return [program];

      const programStart = Date.parse(program.start);
      const previousStart = Date.parse(previous.start);
      const previousStop = Date.parse(previous.stop);
      if (programStart <= previousStart) return result;
      if (programStart < previousStop) {
        result[result.length - 1] = { ...previous, stop: program.start };
      }
      result.push(program);
      return result;
    },
    [],
  );
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

async function loadXtreamEpg(
  credentials: XtreamCredentials,
  providerId: string,
) {
  let payload = await fetchXtream<unknown>(
    credentials,
    "get_simple_data_table",
    {
      stream_id: providerId,
    },
  ).catch(() => null);
  if (normalizeEpgPrograms(payload).length === 0) {
    payload = await fetchXtream<unknown>(credentials, "get_simple_date_table", {
      stream_id: providerId,
    }).catch(() => null);
  }
  if (normalizeEpgPrograms(payload).length === 0) {
    payload = await fetchXtream<unknown>(credentials, "get_short_epg", {
      limit: "10",
      stream_id: providerId,
    }).catch(() => null);
  }
  return normalizeEpgPrograms(payload);
}

app.post<{
  Body: XtreamCredentialsInput & { providerIds?: string[] };
  Params: { sourceId: string };
}>("/xtream/catalog/:sourceId/epg", async (request, reply) => {
  const credentials = await credentialsFromBody(request.body).catch(() => null);
  if (!credentials)
    return reply.code(400).send({ message: "Invalid Xtream credentials" });
  const providerIds = [
    ...new Set(
      (request.body.providerIds ?? []).filter(
        (providerId): providerId is string =>
          typeof providerId === "string" && providerId.trim().length > 0,
      ),
    ),
  ];
  if (providerIds.length === 0) return reply.send({ programsByProviderId: {} });
  const programsByProviderId: Record<
    string,
    ReturnType<typeof normalizeEpgPrograms>
  > = {};
  let cursor = 0;
  const worker = async () => {
    while (cursor < providerIds.length) {
      const providerId = providerIds[cursor++];
      programsByProviderId[providerId] = await loadXtreamEpg(
        credentials,
        providerId,
      );
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(8, providerIds.length) }, () => worker()),
  );
  return reply.send({ programsByProviderId });
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
  const addresses = await dns.lookup(url.hostname, { all: true });
  if (addresses.some(({ address }) => isPrivateAddress(address)))
    throw new Error("PRIVATE_TARGET");
  return url;
}

const MEDIA_PROXY_MAX_REDIRECTS = 5;
type MediaRequestHeaders = {
  origin?: string;
  referer?: string;
  range?: string;
  userAgent?: string;
};

async function fetchMediaUpstream(
  initialUrl: URL,
  headers: {
    request: MediaRequestHeaders;
  },
) {
  const userAgent =
    headers.request.userAgent?.trim() ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36";
  const requestHeaders = {
    Accept: "*/*",
    "User-Agent": userAgent,
    ...(headers.request.range ? { Range: headers.request.range } : {}),
    ...(headers.request.origin ? { Origin: headers.request.origin } : {}),
    ...(headers.request.referer ? { Referer: headers.request.referer } : {}),
  };

  let currentUrl = initialUrl;
  for (
    let redirectCount = 0;
    redirectCount <= MEDIA_PROXY_MAX_REDIRECTS;
    redirectCount += 1
  ) {
    await validateTarget(currentUrl.toString());
    let response: Response;
    try {
      response = await fetch(currentUrl, {
        headers: requestHeaders,
        redirect: "manual",
      });
    } catch (error) {
      // A few provider hosts expose a broken certificate on HTTPS but serve the
      // same media over HTTP. The backend can safely make that downgrade
      // because the browser only talks to this proxy over its own origin.
      if (currentUrl.protocol !== "https:") throw error;
      currentUrl = new URL(currentUrl);
      currentUrl.protocol = "http:";
      continue;
    }

    if (response.status < 300 || response.status >= 400)
      return { response, url: currentUrl };
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (!location) throw new Error("MEDIA_REDIRECT_WITHOUT_LOCATION");
    currentUrl = new URL(location, currentUrl);
  }
  throw new Error("MEDIA_TOO_MANY_REDIRECTS");
}

app.post<{ Body: { url?: string } }>(
  "/media-resolve",
  async (request, reply) => {
    try {
      const url = await validateTarget(request.body?.url);
      const host = request.headers.host;
      if (!host) throw new Error("MISSING_REQUEST_HOST");
      const upstream = await fetchMediaUpstream(url, {
        request: {
          origin:
            typeof request.headers.origin === "string"
              ? request.headers.origin
              : undefined,
          referer:
            typeof request.headers.referer === "string"
              ? request.headers.referer
              : undefined,
          range: "bytes=0-0",
          userAgent:
            typeof request.headers["user-agent"] === "string"
              ? request.headers["user-agent"]
              : undefined,
        },
      });
      await upstream.response.body?.cancel();
      return reply.send({ resolvedUrl: upstream.url.toString() });
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
