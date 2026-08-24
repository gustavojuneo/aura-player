import type {
  CatalogItem,
  CatalogSeries,
  CatalogSource,
} from "../features/catalog/catalog";

const databaseName = "aura-catalog";
const databaseVersion = 1;
const sourceStore = "sources";
const itemStore = "items";
const seriesStore = "series";
const activeSourceKey = "aura:active-source";

type StoreRecord = CatalogItem | CatalogSeries | CatalogSource;

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);
    request.onupgradeneeded = () => {
      const database = request.result;
      const sources = database.createObjectStore(sourceStore, {
        keyPath: "id",
      });
      sources.createIndex("status", "status");
      const items = database.createObjectStore(itemStore, { keyPath: "id" });
      items.createIndex("sourceId", "sourceId");
      items.createIndex("sourceKind", ["sourceId", "kind"]);
      items.createIndex("sourceSeries", ["sourceId", "seriesId"]);
      const series = database.createObjectStore(seriesStore, { keyPath: "id" });
      series.createIndex("sourceId", "sourceId");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        request.error ?? new Error("Não foi possível abrir o catálogo local."),
      );
  });
}

async function transaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const database = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const request = operation(
      database.transaction(storeName, mode).objectStore(storeName),
    );
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Falha no catálogo local."));
  });
}

export async function putSource(source: CatalogSource) {
  await transaction(sourceStore, "readwrite", (store) => store.put(source));
}

export async function getSources() {
  return (
    (await transaction<CatalogSource[]>(sourceStore, "readonly", (store) =>
      store.getAll(),
    )) ?? []
  );
}

export async function deleteSourceData(sourceId: string) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(
      [sourceStore, itemStore, seriesStore],
      "readwrite",
    );
    transaction.objectStore(sourceStore).delete(sourceId);
    for (const storeName of [itemStore, seriesStore]) {
      const store = transaction.objectStore(storeName);
      const index = store.index("sourceId");
      index.openCursor(IDBKeyRange.only(sourceId)).onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Falha ao remover a fonte."));
  });
}

export async function putCatalogBatch(
  items: CatalogItem[],
  series: CatalogSeries[],
) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(
      [itemStore, seriesStore],
      "readwrite",
    );
    const itemObjectStore = transaction.objectStore(itemStore);
    const seriesObjectStore = transaction.objectStore(seriesStore);
    for (const item of items) itemObjectStore.put(item);
    for (const item of series) seriesObjectStore.put(item);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Falha ao salvar o catálogo."));
  });
}

export async function clearCatalogSource(sourceId: string) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const databaseTransaction = database.transaction(
      [itemStore, seriesStore],
      "readwrite",
    );
    for (const storeName of [itemStore, seriesStore]) {
      const store = databaseTransaction.objectStore(storeName);
      const cursorRequest = store
        .index("sourceId")
        .openCursor(IDBKeyRange.only(sourceId));
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    }
    databaseTransaction.oncomplete = () => resolve();
    databaseTransaction.onerror = () =>
      reject(
        databaseTransaction.error ??
          new Error("Falha ao substituir o catálogo."),
      );
  });
}

export async function getCatalogItems(
  sourceId: string,
  kind: CatalogItem["kind"],
) {
  const database = await openDatabase();
  return new Promise<CatalogItem[]>((resolve, reject) => {
    const request = database
      .transaction(itemStore, "readonly")
      .objectStore(itemStore)
      .index("sourceKind")
      .getAll([sourceId, kind]);
    request.onsuccess = () => resolve(request.result as CatalogItem[]);
    request.onerror = () =>
      reject(request.error ?? new Error("Falha ao consultar o catálogo."));
  });
}

export async function getCatalogSeries(sourceId: string) {
  const database = await openDatabase();
  return new Promise<CatalogSeries[]>((resolve, reject) => {
    const request = database
      .transaction(seriesStore, "readonly")
      .objectStore(seriesStore)
      .index("sourceId")
      .getAll(sourceId);
    request.onsuccess = () => resolve(request.result as CatalogSeries[]);
    request.onerror = () =>
      reject(request.error ?? new Error("Falha ao consultar as séries."));
  });
}

export async function getCatalogItem(id: string) {
  return transaction<StoreRecord | undefined>(itemStore, "readonly", (store) =>
    store.get(id),
  ) as Promise<CatalogItem | undefined>;
}

export async function getSeries(id: string) {
  return transaction<StoreRecord | undefined>(
    seriesStore,
    "readonly",
    (store) => store.get(id),
  ) as Promise<CatalogSeries | undefined>;
}

export function getActiveSourceId() {
  return localStorage.getItem(activeSourceKey);
}

export function setActiveSourceId(sourceId: string) {
  localStorage.setItem(activeSourceKey, sourceId);
  window.dispatchEvent(new Event("aura-catalog-change"));
}
