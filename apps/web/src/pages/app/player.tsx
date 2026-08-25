import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MediaPlayer } from "../../components/media-player";
import type { CatalogItem } from "../../features/catalog/catalog";
import {
  createPlaybackDescriptor,
  resolvePlaybackUrl,
} from "../../features/playback/playback";
import {
  useCatalogEpisode,
  useCatalogItem,
  useCatalogItems,
  useCatalogSeriesDetails,
  useXtreamEpg,
} from "../../hooks/use-catalog-data";
import { usePlaybackSource } from "../../hooks/use-playback-source";
import { useNextEpisodePreference } from "../../services/next-episode-preferences";
import {
  consumePlaybackNavigation,
  markPlaybackNavigation,
} from "../../services/playback-autoplay";
import { recordRecentChannel } from "../../services/recent-channels";
import {
  PlayerLiveContentList,
  PlayerSeriesContentList,
} from "./components/player-content-list";
import { PlayerLiveGuide } from "./components/player-live-guide";
import { PlayerNextEpisode } from "./components/player-next-episode";

type PlayerPageProps = { kind: "live" | "movie" | "episode" };

const titles: Record<string, { secondaryTitle?: string; title: string }> = {
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

export function PlayerPage({ kind }: PlayerPageProps) {
  const navigate = useNavigate();
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
  const isLoading =
    kind === "episode" ? episode.isLoading : catalogItem.isLoading;
  const contentTitle = item?.title ?? titles[contentId]?.title ?? contentId;
  const contentSecondaryTitle = item
    ? item.groupTitle
    : titles[contentId]?.secondaryTitle;
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
      seriesDetails.episodes.map((episode) => episode.seasonNumber ?? 1),
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
  const descriptor = useMemo(
    () =>
      createPlaybackDescriptor({
        contentId,
        delivery: item?.delivery,
        isLive: kind === "live",
        position: undefined,
        secondaryTitle: contentSecondaryTitle,
        streamUrl: playbackSource.source,
        title: contentTitle,
      }),
    [
      contentSecondaryTitle,
      contentTitle,
      contentId,
      item?.delivery,
      kind,
      playbackSource.source,
    ],
  );
  const renderNextEpisode = useCallback(
    (remainingSeconds: number, onSelect: () => void) =>
      nextEpisode && !nextEpisodeHidden ? (
        <PlayerNextEpisode
          episode={nextEpisode}
          onHide={hideForSeries}
          onSelect={onSelect}
          remainingSeconds={remainingSeconds}
        />
      ) : null,
    [hideForSeries, nextEpisode, nextEpisodeHidden],
  );
  if (playbackSource.error)
    return (
      <main className="grid min-h-screen place-items-center bg-bg p-6 text-center text-sm text-danger-strong">
        Não foi possível preparar este conteúdo.
      </main>
    );

  const goBack = () => {
    if (kind === "live") return void navigate({ to: "/app/tv" });
    if (kind === "movie")
      return void navigate({
        to: "/app/movies/$movieId",
        params: { movieId: contentId },
      });
    return void navigate({
      to: "/app/series/$seriesId",
      params: { seriesId: item?.seriesId ?? "" },
    });
  };

  const goToEpisode = (nextEpisode: CatalogItem) => {
    markPlaybackNavigation();
    setAllowAutoplay(true);
    setOptimisticEpisode(nextEpisode);
    void navigate({
      to: "/app/series/$seriesId/episodes/$episodeId/watch",
      params: { episodeId: nextEpisode.id, seriesId: seriesId ?? "" },
    });
  };

  const openContentList = () => {
    if (kind === "live") return void navigate({ to: "/app/tv" });
    if (kind === "movie") return void navigate({ to: "/app/movies" });
    return goBack();
  };

  const renderContentList =
    kind === "live"
      ? (onClose: () => void, avoidLiveGuide: boolean) => (
          <PlayerLiveContentList
            avoidLiveGuide={avoidLiveGuide}
            categories={liveCategories.length ? liveCategories : [liveCategory]}
            channels={liveCatalog.items}
            currentChannelId={contentId}
            onCategoryChange={setSelectedLiveCategory}
            onClose={onClose}
            onSelectChannel={(channelId) => {
              onClose();
              void navigate({
                to: "/app/tv/$channelId/watch",
                params: { channelId },
              });
            }}
            selectedCategory={liveCategory}
          />
        )
      : kind === "episode"
        ? (onClose: () => void, avoidLiveGuide: boolean) => (
            <PlayerSeriesContentList
              avoidLiveGuide={avoidLiveGuide}
              currentEpisodeId={contentId}
              episodes={seriesDetails.episodes}
              onClose={onClose}
              onSeasonChange={setSelectedSeason}
              onSelectEpisode={(next) => {
                onClose();
                goToEpisode(next);
              }}
              seasons={seasons.length ? seasons : [firstSeason]}
              selectedSeason={selectedSeason}
            />
          )
        : undefined;

  return (
    <MediaPlayer
      autoPlay={allowAutoplay}
      descriptor={descriptor}
      isLoading={isLoading || playbackSource.isLoading}
      onBack={goBack}
      onNext={nextEpisode ? () => goToEpisode(nextEpisode) : undefined}
      onOpenContentList={openContentList}
      onPrevious={
        previousEpisode ? () => goToEpisode(previousEpisode) : undefined
      }
      renderLiveGuide={
        kind === "live" ? (
          <PlayerLiveGuide
            channelName={item?.title ?? contentId}
            error={liveEpg.isError}
            isLoading={liveEpg.isLoading}
            programs={liveEpg.data ?? []}
          />
        ) : undefined
      }
      renderContentList={renderContentList}
      renderNextEpisode={
        nextEpisode && !nextEpisodeHidden ? renderNextEpisode : undefined
      }
      showEpisodeNavigation={kind === "episode"}
    />
  );
}

export function PlayerFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6 text-center text-text">
      <div>
        <h1 className="font-display text-2xl font-bold">
          Player não encontrado
        </h1>
        <Link className="mt-4 inline-block text-sm text-gold-bright" to="/app">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
