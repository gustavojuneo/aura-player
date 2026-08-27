import { Link } from "@tanstack/react-router";
import { useCallback } from "react";
import {
  type PlayerScreenKind,
  usePlayerScreen,
} from "./hooks/use-player-screen";
import { MediaPlayer } from "./media-player";
import {
  PlayerLiveContentList,
  PlayerSeriesContentList,
} from "./player-content-list";
import { PlayerLiveGuide } from "./player-live-guide";
import { PlayerNextEpisode } from "./player-next-episode";

export type { PlayerScreenKind } from "./hooks/use-player-screen";

export function PlayerScreen({ kind }: { kind: PlayerScreenKind }) {
  const state = usePlayerScreen(kind);
  const {
    contentId,
    descriptor,
    firstSeason,
    goBack,
    goToEpisode,
    hideForSeries,
    item,
    liveCategories,
    liveCategory,
    liveCatalog,
    liveEpg,
    nextEpisode,
    nextEpisodeHidden,
    openContentList,
    previousEpisode,
    seasons,
    selectedSeason,
    seriesDetails,
    setSelectedLiveCategory,
    setSelectedSeason,
  } = state;

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

  if (state.playbackSource.error) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg p-6 text-center text-sm text-danger-strong">
        Não foi possível preparar este conteúdo.
      </main>
    );
  }

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
              void state.navigateToChannel(channelId);
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
              onSelectEpisode={(episode) => {
                onClose();
                goToEpisode(episode);
              }}
              seasons={seasons.length ? seasons : [firstSeason]}
              selectedSeason={selectedSeason}
            />
          )
        : undefined;

  return (
    <MediaPlayer
      autoPlay={state.allowAutoplay}
      descriptor={descriptor}
      isLoading={state.isLoading}
      onBack={goBack}
      onNext={nextEpisode ? () => goToEpisode(nextEpisode) : undefined}
      onOpenContentList={openContentList}
      onPrevious={
        previousEpisode ? () => goToEpisode(previousEpisode) : undefined
      }
      renderContentList={renderContentList}
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
        <Link
          className="mt-4 inline-flex h-10 items-center rounded-lg border border-line bg-panel-2 px-4 text-sm font-bold text-gold-bright outline-2 outline-offset-2 outline-transparent transition-colors hover:border-gold/60 hover:bg-panel hover:text-text focus-visible:outline-focus"
          to="/app"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
