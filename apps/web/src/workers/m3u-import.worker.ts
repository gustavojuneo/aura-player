import {
  type CatalogSource,
  normalizeM3uEntries,
  parseM3uEntries,
} from "../features/catalog/catalog";
import {
  clearCatalogSource,
  putCatalogBatch,
  putSource,
} from "../services/catalog-db";

type ImportMessage = { type: "import"; source: CatalogSource };

self.onmessage = async (event: MessageEvent<ImportMessage>) => {
  if (event.data.type !== "import") return;
  const { source } = event.data;
  try {
    self.postMessage({ type: "progress", phase: "fetching" });
    const response = await fetch(source.url, { redirect: "follow" });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const text = await response.text();
    self.postMessage({ type: "progress", phase: "parsing" });
    const parsed = normalizeM3uEntries(parseM3uEntries(text), source.id);
    self.postMessage({
      type: "progress",
      phase: "saving",
      total: parsed.items.length,
    });
    await clearCatalogSource(source.id);
    const batchSize = 1000;
    for (let index = 0; index < parsed.items.length; index += batchSize) {
      await putCatalogBatch(
        parsed.items.slice(index, index + batchSize),
        index === 0 ? parsed.series : [],
      );
    }
    const nextSource: CatalogSource = {
      ...source,
      status: parsed.items.length === 0 ? "empty" : "ready",
      itemCount: parsed.items.length,
      liveCount: parsed.liveCount,
      movieCount: parsed.movieCount,
      episodeCount: parsed.episodeCount,
      ignoredCount: parsed.ignoredCount,
      importedAt: source.importedAt ?? new Date().toISOString(),
      refreshedAt: new Date().toISOString(),
      errorMessage: undefined,
    };
    await putSource(nextSource);
    self.postMessage({ type: "complete", source: nextSource });
  } catch (error) {
    const message = error instanceof Error ? error.message : "IMPORT_FAILED";
    await putSource({ ...source, status: "error", errorMessage: message });
    self.postMessage({ type: "error", message });
  }
};
