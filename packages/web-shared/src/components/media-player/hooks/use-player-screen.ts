import { useNavigate, useParams, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { CatalogItem } from "../../../features/catalog/catalog";
import {
  createPlaybackDescriptor,
  resolvePlaybackUrl,
} from "../../../features/playback/playback";
import {
  useCatalogEpisode,
  useCatalogItem,
  useCatalogItems,
  useCatalogSeriesDetails,
  useXtreamEpg,
} from "../../../hooks/use-catalog-data";
import { usePlaybackSource } from "../../../hooks/use-playback-source";
import { appRoute } from "../../../runtime-config";
import { useNextEpisodePreference } from "../../../services/next-episode-preferences";
import {
  consumePlaybackNavigation,
  markPlaybackNavigation,
} from "../../../services/playback-autoplay";
import {
  loadPlaybackProgress,
  loadWatchedEpisodes,
  removePlaybackProgress,
  removeWatchedEpisode,
} from "../../../services/playback-progress";
import { recordRecentChannel } from "../../../services/recent-channels";

const FALLBACK_TITLES: Record<
  string,
  { secondaryTitle?: string; title: string }
> = {
  "alem-veu-1": {
    secondaryTitle: "42 min restantes",
    title: "Horizonte de Âmbar",
  },
  "arena-sports": {
    secondaryTitle: "Final continental",
    title: "Arena Sports",
  },
  "episode-4": {
    secondaryTitle: "Episódio 4 · O lado de lá",
    title: "Cidade Velada",
  },
};

export type PlayerScreenKind = "live" | "movie" | "episode";

export function usePlayerScreen(kind: PlayerScreenKind) {
  const navigate = useNavigate();
  const router = useRouter();
  const params = useParams({ strict: false });
  const [allowAutoplay, setAllowAutoplay] = useState(() =>
    consumePlaybackNavigation(),
  );
  const contentId =
    kind === "live"
      ? (params.channelId ?? "arena-sports")
      : kind === "movie"
        ? (params.movieId ?? "alem-veu-1")
        : (params.episodeId ?? "episode-4");
  const catalogItem = useCatalogItem(
    kind === "episode" ? undefined : contentId,
  );
  const episode = useCatalogEpisode(
    kind === "episode" ? contentId : undefined,
    kind === "episode" ? params.seriesId : undefined,
  );
  const liveCatalog = useCatalogItems("live");
  const seriesId = kind === "episode" ? params.seriesId : undefined;
  const seriesDetails = useCatalogSeriesDetails(seriesId);
  const [optimisticEpisode, setOptimisticEpisode] = useState<CatalogItem>();
  const loadedItem = kind === "episode" ? episode.item : catalogItem.item;
  const item =
    optimisticEpisode ??
    (loadedItem?.id === contentId ? loadedItem : undefined);
  const liveEpg = useXtreamEpg(
    kind === "live" ? item?.sourceId : undefined,
    kind === "live" ? item?.providerId : undefined,
    kind === "live" ? item?.title : undefined,
  );
  useEffect(() => {
    if (kind === "live" && item?.kind === "live") recordRecentChannel(item);
  }, [item, kind]);
  useEffect(() => {
    if (
      kind !== "episode" ||
      !seriesId ||
      !loadWatchedEpisodes(seriesId).some(
        (episode) => episode.episodeKey === contentId,
      )
    )
      return;
    removeWatchedEpisode(seriesId, contentId);
    removePlaybackProgress(contentId);
  }, [contentId, kind, seriesId]);

  const isLoading =
    kind === "episode" ? episode.isLoading : catalogItem.isLoading;
  const contentTitle =
    item?.title ?? FALLBACK_TITLES[contentId]?.title ?? contentId;
  const contentSecondaryTitle = item
    ? item.groupTitle
    : FALLBACK_TITLES[contentId]?.secondaryTitle;
  const currentEpisodeIndex = seriesDetails.episodes.findIndex(
    (candidate) => candidate.id === contentId,
  );
  const previousEpisode =
    currentEpisodeIndex > 0
      ? seriesDetails.episodes[currentEpisodeIndex - 1]
      : undefined;
  const nextEpisode =
    currentEpisodeIndex >= 0
      ? seriesDetails.episodes[currentEpisodeIndex + 1]
      : undefined;
  const { hidden: nextEpisodeHidden, hideForSeries } =
    useNextEpisodePreference(seriesId);
  const liveCategories = [
    ...new Set(
      liveCatalog.items.map(
        (channel) =>
          channel.groupTitle ?? channel.categories?.[0] ?? "Sem categoria",
      ),
    ),
  ];
  const currentLiveCategory =
    item?.groupTitle ?? item?.categories?.[0] ?? liveCategories[0];
  const [selectedLiveCategory, setSelectedLiveCategory] = useState<string>();
  const liveCategory =
    selectedLiveCategory ?? currentLiveCategory ?? "Sem categoria";
  const seasons = [
    ...new Set(
      seriesDetails.episodes.map(
        (currentEpisode) => currentEpisode.seasonNumber ?? 1,
      ),
    ),
  ].sort((first, second) => first - second);
  const firstSeason =
    item?.seasonNumber ?? seasons[0] ?? (kind === "episode" ? 1 : 0);
  const [selectedSeason, setSelectedSeason] = useState(firstSeason);
  useEffect(() => {
    if (kind === "episode" && item?.seasonNumber) {
      setSelectedSeason(item.seasonNumber);
    }
  }, [item?.seasonNumber, kind]);
  const rawStreamUrl = item?.streamUrl ?? resolvePlaybackUrl(contentId);
  const playbackSource = usePlaybackSource(rawStreamUrl, Boolean(rawStreamUrl));
  const descriptor = createPlaybackDescriptor({
    contentId,
    delivery: item?.delivery,
    isLive: kind === "live",
    position: loadPlaybackProgress().find(
      (progress) => progress.contentId === contentId,
    )?.positionSecs,
    secondaryTitle: contentSecondaryTitle,
    streamUrl: playbackSource.source,
    title: contentTitle,
  });
  const goBack = () => {
    if (kind === "episode") {
      const detailsSeriesId = seriesId ?? item?.seriesId;
      if (detailsSeriesId) {
        void navigate({
          to: appRoute("/series/$seriesId") as never,
          params: { seriesId: detailsSeriesId } as never,
          replace: true,
        });
      } else {
        void navigate({ replace: true, to: appRoute("/series") as never });
      }
      return;
    }
    router.history.back();
  };
  const goToEpisode = (next: CatalogItem) => {
    markPlaybackNavigation();
    setAllowAutoplay(true);
    setOptimisticEpisode(next);
    void navigate({
      to: appRoute("/series/$seriesId/episodes/$episodeId/watch") as never,
      params: { episodeId: next.id, seriesId: seriesId ?? "" } as never,
    });
  };
  const openContentList = () => {
    if (kind === "live") return void navigate({ to: appRoute("/tv") });
    if (kind === "movie") return void navigate({ to: appRoute("/movies") });
    return goBack();
  };
  const navigateToChannel = (channelId: string) => {
    void navigate({
      to: appRoute("/tv/$channelId/watch") as never,
      params: { channelId } as never,
    });
  };

  return {
    allowAutoplay,
    contentId,
    descriptor,
    firstSeason,
    goBack,
    goToEpisode,
    hideForSeries,
    isLoading: isLoading || playbackSource.isLoading,
    item,
    liveCategories,
    liveCategory,
    liveCatalog,
    liveEpg,
    nextEpisode,
    nextEpisodeHidden,
    navigateToChannel,
    openContentList,
    playbackSource,
    previousEpisode,
    seasons,
    seriesId,
    selectedLiveCategory,
    selectedSeason,
    seriesDetails,
    setSelectedLiveCategory,
    setSelectedSeason,
  };
}
