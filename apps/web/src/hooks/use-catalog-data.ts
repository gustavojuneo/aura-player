import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
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
  loadActiveCatalog,
  loadActiveSeries,
  loadCatalogItem,
  loadCatalogSources,
  loadSeries,
  loadSeriesEpisodes,
} from "../services/catalog-service";

function secureAssetUrl(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:") parsed.protocol = "https:";
    return parsed.toString();
  } catch {
    return undefined;
  }
}

const xtreamEpgCache = new Map<string, EpgProgram[]>();

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
  const [isMetadataLoading, setMetadataLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setItem(undefined);
      setLoading(false);
      setMetadataLoading(false);
      return;
    }
    setLoading(true);
    void loadCatalogItem(id).then((loaded) => {
      if (cancelled) return;
      setItem(loaded);
      setLoading(false);
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
          setItem({
            ...loaded,
            description:
              (typeof info.plot === "string" && info.plot) ||
              (typeof info.description === "string" && info.description) ||
              loaded.description,
            logoUrl:
              secureAssetUrl(info.cover_big) ||
              secureAssetUrl(info.movie_image) ||
              loaded.logoUrl,
            backdropUrl: secureAssetUrl(firstBackdrop) ?? loaded.backdropUrl,
          });
        })
        .catch(() => undefined)
        .finally(() => setMetadataLoading(false));
    });
    return () => {
      cancelled = true;
    };
  }, [id]);
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
        const providerId = seriesId.split(":series:").at(-1);
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
  const [series, setSeries] = useState<CatalogSeries | undefined>();
  const [episodes, setEpisodes] = useState<CatalogItem[]>([]);
  const [isLoading, setLoading] = useState(Boolean(id));
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
        const providerId =
          loadedSeries?.providerId ?? id.split(":").at(-1) ?? undefined;
        if (!loadedSeries || !providerId || !source) {
          setMetadataLoading(false);
          return;
        }
        setMetadataLoading(true);
        void fetchXtreamSeriesDetails(source, providerId)
          .then((remote) => {
            if (cancelled) return;
            const info = remote.info ?? {};
            setSeries({
              ...loadedSeries,
              description:
                (typeof info.plot === "string" && info.plot) ||
                (typeof info.description === "string" && info.description) ||
                loadedSeries.description,
              posterUrl: secureAssetUrl(info.cover) || loadedSeries.posterUrl,
              backdropUrl:
                Array.isArray(info.backdrop_path) &&
                secureAssetUrl(info.backdrop_path[0])
                  ? secureAssetUrl(info.backdrop_path[0])
                  : loadedSeries.backdropUrl,
              seasonCount:
                new Set(remote.episodes.map((episode) => episode.seasonNumber))
                  .size || loadedSeries.seasonCount,
              episodeCount: remote.episodes.length || loadedSeries.episodeCount,
            });
            setEpisodes(
              [...remote.episodes].sort(
                (first, second) =>
                  (first.seasonNumber ?? 0) - (second.seasonNumber ?? 0) ||
                  (first.episodeNumber ?? 0) - (second.episodeNumber ?? 0),
              ),
            );
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
  }, [id]);
  return { series, episodes, isLoading, isMetadataLoading, error };
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
