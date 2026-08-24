import { z } from "zod";

export const catalogKindSchema = z.enum(["live", "movie", "episode"]);
export const deliverySchema = z.enum(["hls", "mpeg-ts", "dash", "native"]);

export const catalogItemSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  kind: catalogKindSchema,
  title: z.string().min(1),
  groupTitle: z.string().optional(),
  logoUrl: z.string().url().optional(),
  tvgId: z.string().optional(),
  tvgName: z.string().optional(),
  streamUrl: z.string().url(),
  delivery: deliverySchema,
  userAgent: z.string().optional(),
  referrer: z.string().url().optional(),
  year: z.number().int().min(1800).max(2200).optional(),
  seriesId: z.string().optional(),
  seriesTitle: z.string().optional(),
  seasonNumber: z.number().int().positive().optional(),
  episodeNumber: z.number().int().positive().optional(),
});

export type CatalogItem = z.infer<typeof catalogItemSchema>;

export const catalogSeriesSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  title: z.string().min(1),
  groupTitle: z.string().optional(),
  posterUrl: z.string().url().optional(),
  seasonCount: z.number().int().nonnegative(),
  episodeCount: z.number().int().nonnegative(),
});

export type CatalogSeries = z.infer<typeof catalogSeriesSchema>;

export const sourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.literal("m3u"),
  url: z.string().url(),
  status: z.enum(["idle", "importing", "ready", "empty", "error"]),
  itemCount: z.number().int().nonnegative().default(0),
  liveCount: z.number().int().nonnegative().default(0),
  movieCount: z.number().int().nonnegative().default(0),
  episodeCount: z.number().int().nonnegative().default(0),
  importedAt: z.string().optional(),
  refreshedAt: z.string().optional(),
  errorMessage: z.string().optional(),
});

export type CatalogSource = z.infer<typeof sourceSchema>;

type ParsedEntry = {
  attributes: Record<string, string>;
  name: string;
  url: string;
  userAgent?: string;
  referrer?: string;
};

const episodePattern = /^(.*?)\s+S(\d{1,3})E(\d{1,4})(?:\b|\s|$)/i;

function parseAttributes(value: string) {
  const attributes: Record<string, string> = {};
  for (const match of value.matchAll(/([^\s=]+)\s*=\s*"([^"]*)"/g)) {
    attributes[match[1].toLowerCase()] = match[2].trim();
  }
  return attributes;
}

export function parseM3uEntries(text: string): ParsedEntry[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const entries: ParsedEntry[] = [];
  let pending: Omit<ParsedEntry, "url"> | undefined;
  let pendingOptions: Pick<ParsedEntry, "userAgent" | "referrer"> = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("#")) {
      const upper = line.toUpperCase();
      if (upper.startsWith("#EXTINF")) {
        const comma = line.indexOf(",");
        const metadata = comma === -1 ? line : line.slice(0, comma);
        const name = comma === -1 ? "" : line.slice(comma + 1).trim();
        pending = { attributes: parseAttributes(metadata), name };
        pendingOptions = {};
      } else if (upper.startsWith("#EXTGRP:") && pending) {
        pending.attributes["group-title"] = line.slice(8).trim();
      } else if (upper.startsWith("#EXTVLCOPT:HTTP-USER-AGENT:") && pending) {
        pendingOptions.userAgent = line.slice(line.indexOf(":", 14) + 1).trim();
      } else if (upper.startsWith("#EXTVLCOPT:HTTP-REFERRER:") && pending) {
        pendingOptions.referrer = line.slice(line.indexOf(":", 14) + 1).trim();
      }
      continue;
    }

    if (!pending || !/^[a-z][a-z\d+.-]*:\/\//i.test(line)) continue;
    const [url, optionString] = line.split("|", 2);
    const options = new URLSearchParams(optionString ?? "");
    entries.push({
      attributes: pending.attributes,
      name: pending.name || pending.attributes["tvg-name"] || "Sem título",
      referrer:
        pendingOptions.referrer ??
        options.get("Referer") ??
        options.get("referrer") ??
        undefined,
      url,
      userAgent:
        pendingOptions.userAgent ??
        options.get("User-Agent") ??
        options.get("user-agent") ??
        undefined,
    });
    pending = undefined;
    pendingOptions = {};
  }
  return entries;
}

function deliveryFromUrl(
  url: string,
  kind: CatalogItem["kind"],
): CatalogItem["delivery"] {
  if (kind === "live") return "mpeg-ts";
  let extension = "";
  try {
    const parsed = new URL(url);
    extension =
      parsed.searchParams.get("extension") ??
      parsed.pathname.split(".").pop() ??
      "";
  } catch {
    extension = "";
  }
  if (extension.toLowerCase() === "m3u8" || extension.toLowerCase() === "hls")
    return "hls";
  if (extension.toLowerCase() === "mpd") return "dash";
  if (["ts", "mpegts", "mpeg-ts"].includes(extension.toLowerCase()))
    return "mpeg-ts";
  return "native";
}

export function normalizeM3uEntries(entries: ParsedEntry[], sourceId: string) {
  const series = new Map<string, CatalogSeries>();
  const seriesSeasons = new Map<string, Set<number>>();
  const items: CatalogItem[] = [];
  let liveCount = 0;
  let movieCount = 0;
  let episodeCount = 0;

  for (const [index, entry] of entries.entries()) {
    const pathname = entry.url.toLowerCase();
    const episodeMatch = entry.name.match(episodePattern);
    const isEpisode = pathname.includes("/series/") || Boolean(episodeMatch);
    const isMovie =
      !isEpisode &&
      (pathname.includes("/movie/") ||
        pathname.includes("/vod/") ||
        Boolean(entry.name.match(/\(\d{4}\)$/)));
    const kind: CatalogItem["kind"] = isEpisode
      ? "episode"
      : isMovie
        ? "movie"
        : "live";
    const title = entry.name.trim() || `Item ${index + 1}`;
    const seriesTitle = episodeMatch?.[1].trim();
    const seasonNumber = episodeMatch ? Number(episodeMatch[2]) : undefined;
    const episodeNumber = episodeMatch ? Number(episodeMatch[3]) : undefined;
    const seriesId = seriesTitle
      ? `${sourceId}:series:${slugify(seriesTitle)}`
      : undefined;
    const id = `${sourceId}:${kind}:${index}`;
    const yearMatch = title.match(/\((\d{4})\)\s*$/);
    const item = catalogItemSchema.parse({
      id,
      sourceId,
      kind,
      title,
      groupTitle: entry.attributes["group-title"] || undefined,
      logoUrl: validUrl(entry.attributes["tvg-logo"]),
      tvgId: entry.attributes["tvg-id"] || undefined,
      tvgName: entry.attributes["tvg-name"] || undefined,
      streamUrl: entry.url,
      delivery: deliveryFromUrl(entry.url, kind),
      userAgent: entry.userAgent,
      referrer: validUrl(entry.referrer),
      year: yearMatch ? Number(yearMatch[1]) : undefined,
      seriesId,
      seriesTitle,
      seasonNumber,
      episodeNumber,
    });
    items.push(item);
    if (kind === "live") liveCount += 1;
    if (kind === "movie") movieCount += 1;
    if (kind === "episode") {
      episodeCount += 1;
      if (seriesId && seriesTitle) {
        const current = series.get(seriesId) ?? {
          id: seriesId,
          sourceId,
          title: seriesTitle,
          groupTitle: item.groupTitle,
          posterUrl: item.logoUrl,
          seasonCount: 0,
          episodeCount: 0,
        };
        current.episodeCount += 1;
        const seasons = seriesSeasons.get(seriesId) ?? new Set<number>();
        if (seasonNumber) seasons.add(seasonNumber);
        seriesSeasons.set(seriesId, seasons);
        current.seasonCount = seasons.size;
        if (!current.posterUrl && item.logoUrl)
          current.posterUrl = item.logoUrl;
        series.set(seriesId, current);
      }
    }
  }
  return {
    items,
    series: [...series.values()],
    liveCount,
    movieCount,
    episodeCount,
  };
}

function validUrl(value: string | undefined) {
  if (!value) return undefined;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
