import {
  type CatalogItem,
  type CatalogSource,
  sourceSchema,
} from "../features/catalog/catalog";
import {
  clearActiveSourceId,
  deleteSourceData,
  getActiveSourceId,
  getCatalogItem,
  getCatalogItems,
  getCatalogSeries,
  getSeries,
  getSources,
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
  return getCatalogItems(sourceId, kind);
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
