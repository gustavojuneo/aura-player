import type {
  CatalogItem,
  CatalogSeries,
  CatalogSource,
} from "../features/catalog/catalog";

const databaseName = "aura-catalog";
const databaseVersion = 2;
const sourceStore = "sources";
const activeSourceKey = "aura:active-source";

// Catalog records are intentionally kept only in the page heap. The database
// contains source configuration only, so its size does not depend on the
// number of channels, movies, series, or episodes.
const catalogItems = new Map<string, CatalogItem>();
const catalogSeries = new Map<string, CatalogSeries>();

function openSourceDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(sourceStore)) {
        const sources = database.createObjectStore(sourceStore, {
          keyPath: "id",
        });
        sources.createIndex("status", "status");
      }
      for (const storeName of ["items", "series"]) {
        if (database.objectStoreNames.contains(storeName))
          database.deleteObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Não foi possível abrir as fontes."));
  });
}

async function sourceTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const database = await openSourceDatabase();
  return new Promise<T>((resolve, reject) => {
    const request = operation(
      database.transaction(sourceStore, mode).objectStore(sourceStore),
    );
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Falha ao acessar as fontes."));
  });
}

export async function putSource(source: CatalogSource) {
  await sourceTransaction("readwrite", (store) => store.put(source));
}

export async function getSources() {
  return (
    (await sourceTransaction<CatalogSource[]>("readonly", (store) =>
      store.getAll(),
    )) ?? []
  );
}

export async function getSource(sourceId: string) {
  return sourceTransaction<CatalogSource | undefined>("readonly", (store) =>
    store.get(sourceId),
  );
}

export async function deleteSourceData(sourceId: string) {
  await sourceTransaction("readwrite", (store) => store.delete(sourceId));
  clearCatalogSource(sourceId);
}

export async function putCatalogBatch(
  items: CatalogItem[],
  series: CatalogSeries[],
) {
  for (const item of items) catalogItems.set(item.id, item);
  for (const item of series) catalogSeries.set(item.id, item);
}

export function clearCatalogSource(sourceId: string) {
  for (const [id, item] of catalogItems) {
    if (item.sourceId === sourceId) catalogItems.delete(id);
  }
  for (const [id, item] of catalogSeries) {
    if (item.sourceId === sourceId) catalogSeries.delete(id);
  }
}

export function clearCatalogMemory() {
  catalogItems.clear();
  catalogSeries.clear();
}

export async function getCatalogItems(
  sourceId: string,
  kind: CatalogItem["kind"],
) {
  return [...catalogItems.values()].filter(
    (item) => item.sourceId === sourceId && item.kind === kind,
  );
}

export async function getCatalogSeries(sourceId: string) {
  return [...catalogSeries.values()].filter(
    (item) => item.sourceId === sourceId,
  );
}

export async function getCatalogEpisodes(sourceId: string, seriesId: string) {
  return [...catalogItems.values()].filter(
    (item) =>
      item.sourceId === sourceId &&
      item.kind === "episode" &&
      item.seriesId === seriesId,
  );
}

export async function getCatalogItem(id: string) {
  return catalogItems.get(id);
}

export async function getSeries(id: string) {
  return catalogSeries.get(id);
}

export function getActiveSourceId() {
  try {
    return window.localStorage.getItem(activeSourceKey) ?? undefined;
  } catch {
    return undefined;
  }
}

export function setActiveSourceId(sourceId: string) {
  try {
    window.localStorage.setItem(activeSourceKey, sourceId);
  } catch {
    // The source remains active for this process if persistent storage fails.
  }
  notifyCatalogChanged();
}

export function clearActiveSourceId() {
  try {
    window.localStorage.removeItem(activeSourceKey);
  } catch {
    // Storage may be unavailable in restricted WebOS environments.
  }
  notifyCatalogChanged();
}

function notifyCatalogChanged() {
  window.dispatchEvent(new Event("aura-catalog-change"));
}
