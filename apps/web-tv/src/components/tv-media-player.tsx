import {
  type MediaPlayerProps,
  PlayerHeader,
  PlayerVideo,
  useNextEpisodeCountdown,
  usePlaybackEngine,
} from "@aura/web-shared/components/media-player/tv";
import { ProductState } from "@aura/web-shared/components/ui";
import { usePlaybackPreferences } from "@aura/web-shared/services/playback-preferences";
import type { PlayerAspectRatio } from "@aura/web-shared/utils/constants";
import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { useTvPlayerControls } from "../hooks/use-tv-player-controls";
import { TvPlayerControls } from "./tv-player-controls";

export function TvMediaPlayer({
  autoPlay = false,
  descriptor,
  isLoading = false,
  onBack,
  onComplete,
  onNext,
  onOpenContentList,
  onPrevious,
  onProgress,
  renderContentList,
  renderLiveGuide,
  renderNextEpisode,
  showEpisodeNavigation = false,
}: MediaPlayerProps) {
  const { preferences } = usePlaybackPreferences();
  const playback = usePlaybackEngine({
    autoPlay,
    descriptor,
    isLoading,
    preferences,
    onProgress,
    onComplete,
  });
  const [aspectRatio, setAspectRatio] = useState<PlayerAspectRatio>("original");
  const [contentListOpen, setContentListOpen] = useState(false);
  const { controlsVisible, revealControls } = useTvPlayerControls();
  const [liveGuideOpen, setLiveGuideOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const nextEpisode = useNextEpisodeCountdown({
    contentId: descriptor.contentId,
    currentTime: playback.currentTime,
    duration: playback.duration,
    enabled: Boolean(renderNextEpisode),
    isLive: descriptor.isLive,
    isLoading,
    isReady: playback.isReady,
    onNext,
  });
  const playerLoading = isLoading || !playback.isReady;
  const closeContentList = () => {
    setContentListOpen(false);
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>('[aria-label="Lista de conteúdo"]')
        ?.focus({ preventScroll: true });
    });
  };
  const toggleContentList = () => {
    if (!renderContentList) {
      onOpenContentList();
      return;
    }
    setContentListOpen((open) => !open);
  };
  const focusPrimaryPlay = () =>
    document
      .querySelector<HTMLElement>("[data-player-primary-play]")
      ?.focus({ preventScroll: true });

  return (
    <main
      data-player-root
      className="relative flex h-dvh min-h-[560px] w-full flex-col overflow-hidden bg-[#080806] text-text"
      onClick={(event) => {
        revealControls();
        const target = event.target as HTMLElement;
        if (
          target.closest(
            "button, input, select, textarea, a, [data-player-action], [data-player-controls]",
          )
        )
          return;
        if (contentListOpen) closeContentList();
        playback.togglePlay();
      }}
      onKeyDown={(event) => {
        revealControls();
        if (event.key === "Escape" || event.keyCode === 461) {
          event.preventDefault();
          if (contentListOpen) closeContentList();
          else if (settingsOpen) setSettingsOpen(false);
          else if (liveGuideOpen) setLiveGuideOpen(false);
          else onBack();
        } else if (
          (event.key === "Enter" || event.key === " ") &&
          !(event.target as HTMLElement).closest(
            "button, input, select, textarea, a, [data-player-action], [data-player-controls]",
          )
        ) {
          event.preventDefault();
          playback.togglePlay();
        }
      }}
      onFocusCapture={revealControls}
      onTouchStart={revealControls}
    >
      <PlayerVideo
        aspectRatio={aspectRatio}
        autoPlay={autoPlay}
        descriptor={descriptor}
        videoRef={playback.videoRef}
      />
      {controlsVisible && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.45),transparent_24%,transparent_70%,rgba(0,0,0,0.9))]"
        />
      )}
      <PlayerHeader
        controlsVisible={controlsVisible}
        descriptor={descriptor}
        onBack={onBack}
        onNavigateDown={focusPrimaryPlay}
      />
      <div
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        data-player-primary-controls
      >
        <button
          aria-label={playback.isPlaying ? "Pausar" : "Reproduzir"}
          className="grid size-[88px] place-items-center rounded-full border border-white/20 bg-[#171510CC] text-text opacity-70 focus-visible:outline-2 focus-visible:outline-focus"
          data-player-focus-anchor
          data-player-primary-play
          disabled={playerLoading}
          onClick={playback.togglePlay}
          type="button"
        >
          {playback.isPlaying ? (
            <Pause aria-hidden="true" className="size-8" />
          ) : (
            <Play aria-hidden="true" className="ml-1 size-8 fill-current" />
          )}
        </button>
      </div>
      {descriptor.isLive && liveGuideOpen && renderLiveGuide && (
        <div className="absolute inset-x-0 bottom-[72px] z-20 px-4">
          {renderLiveGuide}
        </div>
      )}
      {nextEpisode.nextEpisodeCountdown !== null && renderNextEpisode && (
        <div
          className="absolute inset-x-5 bottom-[88px] z-20 flex justify-end"
          data-player-action
        >
          {renderNextEpisode(
            nextEpisode.nextEpisodeCountdown,
            () => {
              nextEpisode.clearNextEpisode();
              onComplete?.();
              onNext?.();
            },
            nextEpisode.clearNextEpisode,
          )}
        </div>
      )}
      {controlsVisible &&
        contentListOpen &&
        renderContentList?.(closeContentList, liveGuideOpen, () => undefined)}
      <TvPlayerControls
        aspectRatio={aspectRatio}
        contentListOpen={Boolean(renderContentList && contentListOpen)}
        controlsVisible={controlsVisible}
        currentTime={playback.currentTime}
        duration={playback.duration}
        isLive={descriptor.isLive}
        isMuted={playback.isMuted}
        isPlaying={playback.isPlaying}
        liveGuideOpen={liveGuideOpen}
        onAspectRatioChange={setAspectRatio}
        onContentList={toggleContentList}
        onLiveGuideToggle={() => setLiveGuideOpen((open) => !open)}
        onNext={onNext}
        onPrevious={onPrevious}
        onQualityChange={playback.setQuality}
        onSeek={playback.seek}
        onSettingsToggle={() => setSettingsOpen((open) => !open)}
        onToggleMute={playback.toggleMute}
        onTogglePlay={playback.togglePlay}
        quality={playback.quality}
        qualityOptions={playback.qualityOptions}
        reduceMotion={preferences.reduceMotion}
        settingsOpen={settingsOpen}
        showContentList={Boolean(renderContentList)}
        showEpisodeNavigation={showEpisodeNavigation}
      />
      {playback.error && (
        <div data-player-error>
          <ProductState
            action={{ label: "Tentar novamente", onClick: playback.retry }}
            className="absolute inset-x-4 bottom-28 z-20 mx-auto max-w-lg"
            kind="stream-unavailable"
          >
            Tente novamente ou escolha outro conteúdo.
          </ProductState>
        </div>
      )}
    </main>
  );
}
