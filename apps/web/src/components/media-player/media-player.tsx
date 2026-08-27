import { usePlaybackPreferences } from "../../services/playback-preferences";
import { ProductState } from "../ui";
import { ControlButton } from "./control-button";
import { useNextEpisodeCountdown } from "./hooks/use-next-episode-countdown";
import { usePlaybackEngine } from "./hooks/use-playback-engine";
import { usePlayerControls } from "./hooks/use-player-controls";
import { PlayerBottomControls } from "./player-bottom-controls";
import {
  PlayerLiveContentList,
  PlayerSeriesContentList,
} from "./player-content-list";
import { PlayerHeader } from "./player-header";
import { PlayerLiveGuide } from "./player-live-guide";
import { PlayerNextEpisode } from "./player-next-episode";
import { PlayerPrimaryControls } from "./player-primary-controls";
import { PlayerVideo } from "./player-video";
import type { MediaPlayerProps } from "./types";

export type { MediaPlayerProps } from "./types";

function isInteractiveTarget(target: HTMLElement) {
  return Boolean(
    target.closest(
      "button, input, select, textarea, a, [data-player-action], [data-player-controls]",
    ),
  );
}

export function MediaPlayer({
  autoPlay = false,
  descriptor,
  isLoading = false,
  onBack,
  onNext,
  onOpenContentList,
  onPrevious,
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
  });
  const controls = usePlayerControls({
    contentId: descriptor.contentId,
    duration: playback.duration,
    hideControls: preferences.hideControls,
    isLive: descriptor.isLive,
    isPlaying: playback.isPlaying,
    isReady: playback.isReady,
    onChangeVolume: playback.changeVolume,
    onSeek: playback.seek,
    onToggleMute: playback.toggleMute,
    onTogglePlay: playback.togglePlay,
    videoRef: playback.videoRef,
  });
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
  const closeContentList = () => controls.setContentListOpen(false);
  const keepContentListControlsVisible = () =>
    controls.revealControls(2000, true);
  const focusPrimaryPlay = () => {
    document
      .querySelector<HTMLElement>("[data-player-primary-play]")
      ?.focus({ preventScroll: true });
  };
  const toggleContentList = () => {
    if (!renderContentList) {
      onOpenContentList();
      return;
    }
    keepContentListControlsVisible();
    controls.setContentListOpen((open) => !open);
  };
  const handleSurfaceAction = (target: HTMLElement) => {
    if (isInteractiveTarget(target)) return;
    if (controls.contentListOpen) closeContentList();
    playback.togglePlay();
  };

  return (
    <main
      data-player-root
      className={`relative flex h-dvh min-h-[560px] w-full flex-col overflow-hidden bg-[#080806] text-text ${preferences.reduceMotion ? "[&_button]:transition-none" : ""}`}
      onClick={(event) => handleSurfaceAction(event.target as HTMLElement)}
      onKeyDown={(event) => {
        if (event.key === "Escape" || event.keyCode === 461) {
          event.preventDefault();
          if (controls.contentListOpen) {
            closeContentList();
            return;
          }
          onBack();
          return;
        }
        if (
          controls.contentListOpen &&
          event.key === "Enter" &&
          (event.target as HTMLElement).closest('[role="dialog"]')
        )
          return;
        if (
          (event.key === "Enter" || event.key === " ") &&
          !isInteractiveTarget(event.target as HTMLElement)
        ) {
          event.preventDefault();
          handleSurfaceAction(event.target as HTMLElement);
        }
      }}
      onMouseMove={() => controls.revealControls()}
      onTouchStart={() => controls.revealControls()}
    >
      <PlayerVideo
        aspectRatio={controls.aspectRatio}
        autoPlay={autoPlay}
        descriptor={descriptor}
        videoRef={playback.videoRef}
      />
      {controls.volumeShortcutValue !== null && (
        <div
          aria-label={`Volume ${controls.volumeShortcutValue}%`}
          aria-live="polite"
          className="pointer-events-none absolute top-20 left-1/2 z-20 -translate-x-1/2 rounded-lg bg-black/75 px-5 py-2.5 text-xl font-bold text-text shadow-lg"
          role="status"
        >
          {controls.volumeShortcutValue}%
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/90" />
      {descriptor.isLive &&
        controls.controlsVisible &&
        controls.liveGuideOpen &&
        renderLiveGuide && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[72px] z-20 w-full px-4 pb-2 sm:bottom-[90px] sm:px-[42px] sm:pb-3">
            {renderLiveGuide}
          </div>
        )}
      {nextEpisode.nextEpisodeCountdown !== null && renderNextEpisode && (
        <div
          className="absolute inset-x-5 bottom-[88px] z-20 flex justify-end sm:inset-x-[42px] sm:bottom-[112px]"
          data-player-action
        >
          {renderNextEpisode(nextEpisode.nextEpisodeCountdown, () => {
            nextEpisode.clearNextEpisode();
            onNext?.();
          })}
        </div>
      )}
      {controls.controlsVisible &&
        controls.contentListOpen &&
        renderContentList?.(
          closeContentList,
          controls.liveGuideOpen,
          keepContentListControlsVisible,
        )}
      <PlayerHeader
        controlsVisible={controls.controlsVisible}
        descriptor={descriptor}
        onBack={onBack}
        onNavigateDown={focusPrimaryPlay}
      />
      <PlayerPrimaryControls
        controlsVisible={controls.controlsVisible}
        isLive={descriptor.isLive}
        isLoading={playerLoading}
        isPlaying={playback.isPlaying}
        onSeek={controls.queueSeek}
        onTogglePlay={playback.togglePlay}
        reduceMotion={preferences.reduceMotion}
      />
      <PlayerBottomControls
        aspectRatio={controls.aspectRatio}
        contentListOpen={Boolean(renderContentList && controls.contentListOpen)}
        controlsVisible={controls.controlsVisible}
        currentTime={controls.seekPreview ?? playback.currentTime}
        descriptor={descriptor}
        duration={playback.duration}
        isMuted={playback.isMuted}
        isPlaying={playback.isPlaying}
        liveGuideOpen={controls.liveGuideOpen}
        onAspectRatioChange={controls.setAspectRatio}
        onContentList={toggleContentList}
        onLiveGuideToggle={() => controls.setLiveGuideOpen((open) => !open)}
        onNext={onNext}
        onPrevious={onPrevious}
        onQualityChange={playback.setQuality}
        onSeek={playback.seek}
        onSettingsToggle={() => controls.setSettingsOpen((open) => !open)}
        onToggleFullscreen={controls.toggleFullscreen}
        onToggleMute={playback.toggleMute}
        onTogglePlay={playback.togglePlay}
        onVolumeChange={playback.changeVolume}
        quality={playback.quality}
        qualityOptions={playback.qualityOptions}
        reduceMotion={preferences.reduceMotion}
        showContentList={Boolean(renderContentList)}
        settingsOpen={controls.settingsOpen}
        showEpisodeNavigation={showEpisodeNavigation}
        volume={playback.volume}
      />
      {playback.error && (
        <ProductState
          action={{ label: "Tentar novamente", onClick: playback.retry }}
          className="absolute inset-x-4 bottom-28 z-20 mx-auto max-w-lg sm:bottom-36"
          kind="stream-unavailable"
        >
          Tente novamente ou escolha outro conteúdo.
        </ProductState>
      )}
    </main>
  );
}

export namespace MediaPlayer {
  export const Root = MediaPlayer;
  export const Control = ControlButton;
  export const LiveContentList = PlayerLiveContentList;
  export const SeriesContentList = PlayerSeriesContentList;
  export const LiveGuide = PlayerLiveGuide;
  export const NextEpisode = PlayerNextEpisode;
}
