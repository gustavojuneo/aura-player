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
