import {
  type CatalogItem,
  type CatalogSeries,
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

import { createStableId } from "../utils/create-stable-id";
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
  hasCatalogSourceData,
  putCatalogBatch,
  putSource,
  setActiveSourceId,
} from "./catalog-db";
import { removeFavoritesByIds } from "./favorites";
import { removeRecentChannelsBySource } from "./recent-channels";

export const catalogCacheTtlMs = 24 * 60 * 60 * 1000;

const catalogRefreshesInFlight = new Map<string, Promise<CatalogSource>>();
const catalogRefreshListeners = new Set<() => void>();
let appStartupLoading = true;

function notifyCatalogRefreshState() {
  for (const listener of catalogRefreshListeners) listener();
}

export function isCatalogRefreshInProgress() {
  return appStartupLoading || catalogRefreshesInFlight.size > 0;
}

export function setAppStartupLoading(loading: boolean) {
  appStartupLoading = loading;
  notifyCatalogRefreshState();
}

export function subscribeCatalogRefreshState(listener: () => void) {
  catalogRefreshListeners.add(listener);
  return () => catalogRefreshListeners.delete(listener);
}

export async function loadCatalogSources() {
  return getSources();
}

export async function saveM3uSource(input: { name: string; url: string }) {
  const source = sourceSchema.parse({
    id: `m3u-${createStableId()}`,
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
  await putSource({
    ...imported.source,
    password: input.password,
    server: input.server,
    username: input.username,
  });
  await clearCatalogSource(imported.source.id);
  await putCatalogBatch(imported.items, imported.series);
  const storedMovies = await getCatalogItems(imported.source.id, "movie");
  const storedEpisodes = await getCatalogItems(imported.source.id, "episode");
  const storedLive = await getCatalogItems(imported.source.id, "live");
  const storedSource = sourceSchema.parse({
    ...imported.source,
    password: input.password,
    server: input.server,
    username: input.username,
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
  const imported = await refreshXtreamCatalog(source);
  await clearCatalogSource(imported.source.id);
  await putCatalogBatch(imported.items, imported.series);
  const storedMovies = await getCatalogItems(imported.source.id, "movie");
  const storedEpisodes = await getCatalogItems(imported.source.id, "episode");
  const storedLive = await getCatalogItems(imported.source.id, "live");
  const storedSource = sourceSchema.parse({
    ...imported.source,
    password: source.password,
    server: source.server,
    username: source.username,
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

function isCatalogExpired(source: CatalogSource, now = Date.now()) {
  if (source.status !== "ready" && source.status !== "empty") return false;
  if (!source.refreshedAt) return true;
  const refreshedAt = Date.parse(source.refreshedAt);
  return (
    !Number.isFinite(refreshedAt) || now - refreshedAt >= catalogCacheTtlMs
  );
}

export function refreshCatalogSource(source: CatalogSource) {
  const currentRefresh = catalogRefreshesInFlight.get(source.id);
  if (currentRefresh) return currentRefresh;

  window.dispatchEvent(new Event("aura-catalog-loading"));

  const refresh =
    source.type === "xtream"
      ? syncXtreamSource(source)
      : importM3uSource(source);
  let trackedRefresh: Promise<CatalogSource>;
  trackedRefresh = refresh.finally(() => {
    if (catalogRefreshesInFlight.get(source.id) === trackedRefresh) {
      catalogRefreshesInFlight.delete(source.id);
      notifyCatalogRefreshState();
    }
  });
  catalogRefreshesInFlight.set(source.id, trackedRefresh);
  notifyCatalogRefreshState();
  return trackedRefresh;
}

export function refreshExpiredCatalogSources(sources: CatalogSource[]) {
  const activeSourceId = getActiveSourceId();
  return Promise.allSettled(
    sources
      .filter(
        (source) =>
          source.id === activeSourceId &&
          (!hasCatalogSourceData(source.id) || isCatalogExpired(source)),
      )
      .map((source) => refreshCatalogSource(source)),
  );
}

export function importM3uSource(
  source: CatalogSource,
  handlers?: { onProgress?: (phase: string) => void },
) {
  return new Promise<CatalogSource>((resolve, reject) => {
    let catalogCleared = false;
    let writeChain = Promise.resolve();
    const worker = new Worker(
      new URL("../workers/m3u-import.worker.ts", import.meta.url),
    );
    worker.onmessage = (
      event: MessageEvent<{
        type: string;
        phase?: string;
        source?: CatalogSource;
        items?: CatalogItem[];
        series?: CatalogSeries[];
        message?: string;
      }>,
    ) => {
      if (event.data.type === "progress" && event.data.phase)
        handlers?.onProgress?.(event.data.phase);
      if (event.data.type === "batch") {
        if (!catalogCleared) {
          clearCatalogSource(source.id);
          catalogCleared = true;
        }
        writeChain = writeChain.then(() =>
          putCatalogBatch(event.data.items ?? [], event.data.series ?? []),
        );
        return;
      }
      if (event.data.type === "complete" && event.data.source) {
        worker.terminate();
        if (!catalogCleared) clearCatalogSource(source.id);
        void writeChain
          .then(() => putSource(event.data.source as CatalogSource))
          .then(() => {
            window.dispatchEvent(new Event("aura-catalog-change"));
            resolve(event.data.source as CatalogSource);
          })
          .catch(reject);
      }
      if (event.data.type === "error") {
        worker.terminate();
        void putSource({
          ...source,
          status: "error",
          errorMessage: event.data.message,
        }).catch(() => undefined);
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
  const [liveItems, movieItems, episodeItems, series] = await Promise.all([
    getCatalogItems(sourceId, "live"),
    getCatalogItems(sourceId, "movie"),
    getCatalogItems(sourceId, "episode"),
    getCatalogSeries(sourceId),
  ]);
  removeFavoritesByIds([
    ...liveItems.map((item) => item.id),
    ...movieItems.map((item) => item.id),
    ...episodeItems.map((item) => item.id),
    ...series.map((item) => item.id),
  ]);
  removeRecentChannelsBySource(sourceId);
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
