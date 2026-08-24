import { useCallback, useEffect, useState } from "react";
import type {
  CatalogItem,
  CatalogSeries,
  CatalogSource,
} from "../features/catalog/catalog";
import { getActiveSourceId } from "../services/catalog-db";
import {
  loadActiveCatalog,
  loadActiveSeries,
  loadCatalogItem,
  loadCatalogSources,
  loadSeries,
  loadSeriesEpisodes,
} from "../services/catalog-service";

export function useCatalogItems(kind: CatalogItem["kind"]) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    void loadActiveCatalog(kind)
      .then(setItems)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [kind]);
  useEffect(() => {
    load();
    window.addEventListener("aura-catalog-change", load);
    return () => window.removeEventListener("aura-catalog-change", load);
  }, [load]);
  return {
    items,
    isLoading,
    error,
    retry: load,
    hasSource: Boolean(getActiveSourceId()),
  };
}

export function useCatalogSeries() {
  const [items, setItems] = useState<CatalogSeries[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    void loadActiveSeries()
      .then(setItems)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    load();
    window.addEventListener("aura-catalog-change", load);
    return () => window.removeEventListener("aura-catalog-change", load);
  }, [load]);
  return {
    items,
    isLoading,
    error,
    retry: load,
    hasSource: Boolean(getActiveSourceId()),
  };
}

export function useCatalogItem(id: string | undefined) {
  const [item, setItem] = useState<CatalogItem | undefined>();
  const [isLoading, setLoading] = useState(Boolean(id));
  useEffect(() => {
    if (!id) {
      setItem(undefined);
      setLoading(false);
      return;
    }
    setLoading(true);
    void loadCatalogItem(id)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);
  return { item, isLoading };
}

export function useCatalogSeriesDetails(id: string | undefined) {
  const [series, setSeries] = useState<CatalogSeries | undefined>();
  const [episodes, setEpisodes] = useState<CatalogItem[]>([]);
  const [isLoading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const sourceId = getActiveSourceId();
    if (!id || !sourceId) {
      setSeries(undefined);
      setEpisodes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    void Promise.all([loadSeries(id), loadSeriesEpisodes(sourceId, id)])
      .then(([loadedSeries, loadedEpisodes]) => {
        setSeries(loadedSeries);
        setEpisodes(
          loadedEpisodes.sort(
            (first, second) =>
              (first.seasonNumber ?? 0) - (second.seasonNumber ?? 0) ||
              (first.episodeNumber ?? 0) - (second.episodeNumber ?? 0),
          ),
        );
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);
  return { series, episodes, isLoading, error };
}

export function useCatalogSources() {
  const [sources, setSources] = useState<CatalogSource[]>([]);
  const [isLoading, setLoading] = useState(true);
  const load = useCallback(
    () =>
      void loadCatalogSources()
        .then(setSources)
        .finally(() => setLoading(false)),
    [],
  );
  useEffect(() => {
    load();
    window.addEventListener("aura-catalog-change", load);
    return () => window.removeEventListener("aura-catalog-change", load);
  }, [load]);
  return { sources, isLoading, retry: load };
}
