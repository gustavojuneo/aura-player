import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type {
  CatalogItem,
  CatalogSeries,
  CatalogSource,
  EpgProgram,
} from "../features/catalog/catalog";
import {
  fetchXtreamEpgBatch,
  fetchXtreamMovieDetails,
  fetchXtreamSeriesDetails,
  fetchXtreamShortEpg,
} from "../http/xtream/catalog";
import { getActiveSourceId, getSource } from "../services/catalog-db";
import {
  getCatalogRefreshError,
  isCatalogRefreshInProgress,
  loadActiveCatalog,
  loadActiveSeries,
  loadCatalogItem,
  loadCatalogSources,
  loadSeries,
  loadSeriesEpisodes,
  refreshExpiredCatalogSources,
  subscribeCatalogRefreshState,
} from "../services/catalog-service";
import { useCatalogStore } from "../stores/catalog-store";

function validAssetUrl(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    return new URL(value).toString();
  } catch {
    return undefined;
  }
}

const xtreamEpgCache = new Map<string, EpgProgram[]>();

export function useCatalogRefreshInProgress() {
  return useSyncExternalStore(
    subscribeCatalogRefreshState,
    isCatalogRefreshInProgress,
    () => false,
  );
}

export function useCatalogRefreshError() {
  return useSyncExternalStore(
    subscribeCatalogRefreshState,
    getCatalogRefreshError,
    () => null,
  );
}

export function clearCatalogDataCaches() {
  xtreamEpgCache.clear();
}

function epgCacheKey(sourceId: string, channelName: string) {
  const normalizedName = channelName
    .toLocaleLowerCase()
    .replace(/\s+(?:fhd|uhd|hd|sd|4k|8k)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${sourceId}:${normalizedName}`;
}

function cacheEpgPrograms(
  sourceId: string,
  programsByProviderId: Record<string, EpgProgram[]>,
  channels: Array<{ name: string; providerId?: string }>,
) {
  for (const channel of channels) {
    if (!channel.providerId) continue;
    const programs = programsByProviderId[channel.providerId];
    if (programs) {
      xtreamEpgCache.set(epgCacheKey(sourceId, channel.name), programs);
    }
  }
}

export function useXtreamEpg(
  sourceId: string | undefined,
  providerId: string | undefined,
  channelName?: string,
) {
  return useQuery({
    enabled: Boolean(sourceId && providerId),
    queryFn: async () => {
      if (!sourceId || !providerId) return [];
      const cachedPrograms = channelName
        ? xtreamEpgCache.get(epgCacheKey(sourceId, channelName))
        : undefined;
      if (cachedPrograms) return cachedPrograms;
      const source = await getSource(sourceId);
      if (!source) throw new Error("Fonte Xtream indisponível.");
      const programs = await fetchXtreamShortEpg(source, providerId);
      if (channelName) {
        xtreamEpgCache.set(epgCacheKey(sourceId, channelName), programs);
      }
      return programs;
    },
    queryKey: ["xtream-epg", sourceId, providerId],
    staleTime: 60_000,
  });
}

export function useXtreamEpgForChannels(
  channels: Array<{ name: string; providerId?: string; sourceId: string }>,
) {
  const sourceId = channels[0]?.sourceId;
  const requestChannels = channels.filter(
    (channel) =>
      channel.providerId &&
      channel.sourceId === sourceId &&
      !xtreamEpgCache.has(epgCacheKey(channel.sourceId, channel.name)),
  );
  const providerIds = requestChannels.flatMap((channel) =>
    channel.providerId ? [channel.providerId] : [],
  );
  const query = useQuery({
    enabled: Boolean(sourceId && providerIds.length > 0),
    queryFn: async () => {
      if (!sourceId) return {};
      const source = await getSource(sourceId);
      if (!source) throw new Error("Fonte Xtream indisponível.");
      const programsByProviderId = await fetchXtreamEpgBatch(
        source,
        providerIds,
      );
      cacheEpgPrograms(sourceId, programsByProviderId, requestChannels);
      return programsByProviderId;
    },
    queryKey: ["xtream-epg-batch", sourceId, providerIds],
    staleTime: 60_000,
  });
  const programsByChannel = new Map<string, EpgProgram[]>();
  channels.forEach((channel) => {
    if (channel.providerId) {
      const cachedPrograms = xtreamEpgCache.get(
        epgCacheKey(channel.sourceId, channel.name),
      );
      programsByChannel.set(
        `${channel.sourceId}:${channel.providerId}`,
        cachedPrograms ?? query.data?.[channel.providerId] ?? [],
      );
    }
  });
  return {
    hasError: query.isError,
    isLoading: query.isLoading,
    programsByChannel,
  };
}

export function useCatalogItems(kind: CatalogItem["kind"]) {
  const isRefreshing = useCatalogRefreshInProgress();
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
    const handleLoading = () => setLoading(true);
    window.addEventListener("aura-catalog-loading", handleLoading);
    window.addEventListener("aura-catalog-change", load);
    return () => {
      window.removeEventListener("aura-catalog-loading", handleLoading);
      window.removeEventListener("aura-catalog-change", load);
    };
  }, [load]);
  return {
    items,
    isLoading: isLoading || isRefreshing,
    error,
    retry: load,
    hasSource: Boolean(getActiveSourceId()),
  };
}

export function useCatalogSeries() {
  const isRefreshing = useCatalogRefreshInProgress();
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
    const handleLoading = () => setLoading(true);
    window.addEventListener("aura-catalog-loading", handleLoading);
    window.addEventListener("aura-catalog-change", load);
    return () => {
      window.removeEventListener("aura-catalog-loading", handleLoading);
      window.removeEventListener("aura-catalog-change", load);
    };
  }, [load]);
  return {
    items,
    isLoading: isLoading || isRefreshing,
    error,
    retry: load,
    hasSource: Boolean(getActiveSourceId()),
  };
}

export function useCatalogItem(id: string | undefined) {
  const cachedItem = useCatalogStore((state) =>
    id ? state.itemById[id] : undefined,
  );
  const setCatalogItem = useCatalogStore((state) => state.setItem);
  const [item, setItem] = useState<CatalogItem | undefined>(cachedItem);
  const [isLoading, setLoading] = useState(Boolean(id && !cachedItem));
  const [isMetadataLoading, setMetadataLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setItem(undefined);
      setLoading(false);
      setMetadataLoading(false);
      return;
    }
    const cached = useCatalogStore.getState().itemById[id];
    if (cached) {
      setItem(cached);
      setLoading(false);
      setMetadataLoading(false);
      return;
    }
    setLoading(true);
    void loadCatalogItem(id).then((loaded) => {
      if (cancelled) return;
      setItem(loaded);
      setLoading(false);
      if (loaded) setCatalogItem(loaded);
      if (!loaded?.providerId || loaded.kind !== "movie") {
        setMetadataLoading(false);
        return;
      }
      setMetadataLoading(true);
      void getSource(loaded.sourceId)
        .then((source) => {
          if (!source) throw new Error("Source unavailable");
          return fetchXtreamMovieDetails(source, loaded.providerId as string);
        })
        .then((details) => {
          if (cancelled) return;
          const info = details.info;
          if (!info) return;
          const firstBackdrop = Array.isArray(info.backdrop_path)
            ? info.backdrop_path[0]
            : info.backdrop_path;
          const enrichedItem = {
            ...loaded,
            description:
              (typeof info.plot === "string" && info.plot) ||
              (typeof info.description === "string" && info.description) ||
              loaded.description,
            logoUrl:
              validAssetUrl(info.cover_big) ||
              validAssetUrl(info.movie_image) ||
              loaded.logoUrl,
            backdropUrl: validAssetUrl(firstBackdrop) ?? loaded.backdropUrl,
          };
          setCatalogItem(enrichedItem);
          setItem(enrichedItem);
        })
        .catch(() => undefined)
        .finally(() => setMetadataLoading(false));
    });
    return () => {
      cancelled = true;
    };
  }, [id, setCatalogItem]);
  return { item, isLoading, isMetadataLoading };
}

export function useCatalogEpisode(
  episodeId: string | undefined,
  seriesId: string | undefined,
) {
  const [item, setItem] = useState<CatalogItem | undefined>();
  const [isLoading, setLoading] = useState(Boolean(episodeId));

  useEffect(() => {
    let cancelled = false;
    if (!episodeId || !seriesId) {
      setItem(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    void loadCatalogItem(episodeId)
      .then(async (localItem) => {
        if (localItem?.streamUrl) return localItem;
        const sourceId = episodeId.split(":episode:")[0];
        const providerParts = seriesId.split(":series:");
        const providerId = providerParts[providerParts.length - 1];
        if (!sourceId || !providerId) return localItem;
        const source = await getSource(sourceId);
        if (!source) return localItem;
        const remote = await fetchXtreamSeriesDetails(source, providerId);
        return remote.episodes.find((episode) => episode.id === episodeId);
      })
      .then((loaded) => {
        if (!cancelled) setItem(loaded);
      })
      .catch(() => {
        if (!cancelled) setItem(undefined);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [episodeId, seriesId]);

  return { item, isLoading };
}

export function useCatalogSeriesDetails(id: string | undefined) {
  const cachedDetails = useCatalogStore((state) =>
    id ? state.seriesDetailsById[id] : undefined,
  );
  const setCatalogSeriesDetails = useCatalogStore(
    (state) => state.setSeriesDetails,
  );
  const [series, setSeries] = useState<CatalogSeries | undefined>(
    cachedDetails?.series,
  );
  const [episodes, setEpisodes] = useState<CatalogItem[]>(
    cachedDetails?.episodes ?? [],
  );
  const [isLoading, setLoading] = useState(Boolean(id && !cachedDetails));
  const [isMetadataLoading, setMetadataLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const sourceId = getActiveSourceId();
    if (!id || !sourceId) {
      setSeries(undefined);
      setEpisodes([]);
      setLoading(false);
      setMetadataLoading(false);
      return;
    }
    const cached = useCatalogStore.getState().seriesDetailsById[id];
    if (cached) {
      setSeries(cached.series);
      setEpisodes(cached.episodes);
      setLoading(false);
      setMetadataLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    let cancelled = false;
    void Promise.all([
      loadSeries(id),
      loadSeriesEpisodes(sourceId, id),
      getSource(sourceId),
    ])
      .then(([loadedSeries, localEpisodes, source]) => {
        if (cancelled) return;
        setSeries(loadedSeries);
        setEpisodes(localEpisodes);
        setLoading(false);
        setCatalogSeriesDetails(id, {
          episodes: localEpisodes,
          series: loadedSeries,
        });
        const idParts = id.split(":");
        const providerId =
          loadedSeries?.providerId ?? idParts[idParts.length - 1] ?? undefined;
        if (!loadedSeries || !providerId || !source) {
          setMetadataLoading(false);
          return;
        }
        setMetadataLoading(true);
        void fetchXtreamSeriesDetails(source, providerId)
          .then((remote) => {
            if (cancelled) return;
            const info = remote.info ?? {};
            const enrichedSeries = {
              ...loadedSeries,
              description:
                (typeof info.plot === "string" && info.plot) ||
                (typeof info.description === "string" && info.description) ||
                loadedSeries.description,
              posterUrl: validAssetUrl(info.cover) || loadedSeries.posterUrl,
              backdropUrl:
                Array.isArray(info.backdrop_path) &&
                validAssetUrl(info.backdrop_path[0])
                  ? validAssetUrl(info.backdrop_path[0])
                  : loadedSeries.backdropUrl,
              seasonCount:
                new Set(remote.episodes.map((episode) => episode.seasonNumber))
                  .size || loadedSeries.seasonCount,
              episodeCount: remote.episodes.length || loadedSeries.episodeCount,
            };
            const enrichedEpisodes = [...remote.episodes].sort(
              (first, second) =>
                (first.seasonNumber ?? 0) - (second.seasonNumber ?? 0) ||
                (first.episodeNumber ?? 0) - (second.episodeNumber ?? 0),
            );
            setCatalogSeriesDetails(id, {
              episodes: enrichedEpisodes,
              series: enrichedSeries,
            });
            setSeries(enrichedSeries);
            setEpisodes(enrichedEpisodes);
          })
          .catch(() => undefined)
          .finally(() => setMetadataLoading(false));
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(cause);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, setCatalogSeriesDetails]);
  return { series, episodes, isLoading, isMetadataLoading, error };
}

export function useCatalogSources() {
  const isRefreshing = useCatalogRefreshInProgress();
  const [sources, setSources] = useState<CatalogSource[]>([]);
  const [isLoading, setLoading] = useState(true);
  const load = useCallback(
    () =>
      void loadCatalogSources()
        .then((loadedSources) => {
          setSources(loadedSources);
          void refreshExpiredCatalogSources(loadedSources);
        })
        .finally(() => setLoading(false)),
    [],
  );
  useEffect(() => {
    load();
    window.addEventListener("aura-catalog-change", load);
    return () => {
      window.removeEventListener("aura-catalog-change", load);
    };
  }, [load]);
  return { sources, isLoading: isLoading || isRefreshing, retry: load };
}
