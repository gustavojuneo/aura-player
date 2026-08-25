import {
  type CatalogItem,
  type CatalogSource,
  sourceSchema,
} from "../features/catalog/catalog";
import {
  importXtreamCatalog,
  refreshXtreamCatalog,
} from "../http/xtream/catalog";

export function getXtreamCredentialsFromM3uUrl(value: string) {
  try {
    const parsed = new URL(value);
    const username = parsed.searchParams.get("username")?.trim();
    const password = parsed.searchParams.get("password")?.trim();
    if (!username || !password) return null;
    return { server: `${parsed.protocol}//${parsed.host}`, username, password };
  } catch {
    return null;
  }
}

import {
  clearActiveSourceId,
  clearCatalogSource,
  deleteSourceData,
  getActiveSourceId,
  getCatalogEpisodes,
  getCatalogItem,
  getCatalogItems,
  getCatalogSeries,
  getSeries,
  getSources,
  putCatalogBatch,
  putSource,
  setActiveSourceId,
} from "./catalog-db";

export async function loadCatalogSources() {
  return getSources();
}

export async function saveM3uSource(input: { name: string; url: string }) {
  const source = sourceSchema.parse({
    id: `m3u-${crypto.randomUUID()}`,
    name: input.name.trim(),
    type: "m3u",
    url: input.url.trim(),
    status: "importing",
    itemCount: 0,
    liveCount: 0,
    movieCount: 0,
    episodeCount: 0,
  });
  await putSource(source);
  setActiveSourceId(source.id);
  return source;
}

export async function saveXtreamSource(input: {
  name: string;
  server: string;
  username: string;
  password: string;
}) {
  const imported = await importXtreamCatalog(input);
  await putSource(imported.source);
  await clearCatalogSource(imported.source.id);
  await putCatalogBatch(imported.items, imported.series);
  const storedMovies = await getCatalogItems(imported.source.id, "movie");
  const storedEpisodes = await getCatalogItems(imported.source.id, "episode");
  const storedLive = await getCatalogItems(imported.source.id, "live");
  const storedSource = sourceSchema.parse({
    ...imported.source,
    itemCount: storedLive.length + storedMovies.length + storedEpisodes.length,
    liveCount: storedLive.length,
    movieCount: storedMovies.length,
    episodeCount: storedEpisodes.length,
    status:
      storedLive.length + storedMovies.length + storedEpisodes.length > 0
        ? "ready"
        : "empty",
    refreshedAt: new Date().toISOString(),
  });
  await putSource(storedSource);
  setActiveSourceId(imported.source.id);
  window.dispatchEvent(new Event("aura-catalog-change"));
  return storedSource;
}

export async function syncXtreamSource(source: CatalogSource) {
  const imported = await refreshXtreamCatalog(source.id, source.name);
  await clearCatalogSource(imported.source.id);
  await putCatalogBatch(imported.items, imported.series);
  const storedMovies = await getCatalogItems(imported.source.id, "movie");
  const storedEpisodes = await getCatalogItems(imported.source.id, "episode");
  const storedLive = await getCatalogItems(imported.source.id, "live");
  const storedSource = sourceSchema.parse({
    ...imported.source,
    itemCount: storedLive.length + storedMovies.length + storedEpisodes.length,
    liveCount: storedLive.length,
    movieCount: storedMovies.length,
    episodeCount: storedEpisodes.length,
    status:
      storedLive.length + storedMovies.length + storedEpisodes.length > 0
        ? "ready"
        : "empty",
    refreshedAt: new Date().toISOString(),
  });
  await putSource(storedSource);
  setActiveSourceId(storedSource.id);
  window.dispatchEvent(new Event("aura-catalog-change"));
  return storedSource;
}

export function importM3uSource(
  source: CatalogSource,
  handlers?: { onProgress?: (phase: string) => void },
) {
  return new Promise<CatalogSource>((resolve, reject) => {
    const worker = new Worker(
      new URL("../workers/m3u-import.worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.onmessage = (
      event: MessageEvent<{
        type: string;
        phase?: string;
        source?: CatalogSource;
        message?: string;
      }>,
    ) => {
      if (event.data.type === "progress" && event.data.phase)
        handlers?.onProgress?.(event.data.phase);
      if (event.data.type === "complete" && event.data.source) {
        worker.terminate();
        window.dispatchEvent(new Event("aura-catalog-change"));
        resolve(event.data.source);
      }
      if (event.data.type === "error") {
        worker.terminate();
        reject(
          new Error(event.data.message ?? "Não foi possível importar a fonte."),
        );
      }
    };
    worker.onerror = () => {
      worker.terminate();
      reject(new Error("Não foi possível iniciar a importação da fonte."));
    };
    worker.postMessage({ type: "import", source });
  });
}

export async function removeM3uSource(sourceId: string) {
  await deleteSourceData(sourceId);
  if (getActiveSourceId() === sourceId) clearActiveSourceId();
  window.dispatchEvent(new Event("aura-catalog-change"));
}

export async function loadActiveCatalog(kind: CatalogItem["kind"]) {
  const sourceId = getActiveSourceId();
  if (!sourceId) return [];
  const items = await getCatalogItems(sourceId, kind);
  if (kind === "live") return items;
  const unique = new Map<string, CatalogItem>();
  for (const item of items) {
    const identity =
      kind === "movie"
        ? `${item.title.trim().toLocaleLowerCase()}|${item.year ?? ""}`
        : `${item.seriesId ?? item.seriesTitle ?? item.title}|${item.seasonNumber ?? ""}|${item.episodeNumber ?? ""}`;
    const existing = unique.get(identity);
    if (!existing) {
      unique.set(identity, item);
      continue;
    }
    existing.categories = [
      ...new Set([
        ...(existing.categories ??
          (existing.groupTitle ? [existing.groupTitle] : [])),
        ...(item.categories ?? (item.groupTitle ? [item.groupTitle] : [])),
      ]),
    ];
  }
  return [...unique.values()];
}

export async function loadActiveSeries() {
  const sourceId = getActiveSourceId();
  if (!sourceId) return [];
  return getCatalogSeries(sourceId);
}

export async function loadCatalogItem(id: string) {
  return getCatalogItem(id);
}

export async function loadSeries(id: string) {
  return getSeries(id);
}

export async function loadSeriesEpisodes(sourceId: string, seriesId: string) {
  return getCatalogEpisodes(sourceId, seriesId);
}
