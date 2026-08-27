import type {
  PlayerQuality,
  PlayerQualityOption,
} from "@aura/web-shared/components/media-player/tv";
import { SelectField } from "@aura/web-shared/components/ui";
import { formatPlaybackTime } from "@aura/web-shared/features/playback/playback";
import {
  ASPECT_RATIO_OPTIONS,
  type PlayerAspectRatio,
} from "@aura/web-shared/utils/constants";
import { TvPlayerControlButton } from "./tv-player-control-button";

export function TvPlayerControls({
  aspectRatio,
  contentListOpen,
  controlsVisible,
  currentTime,
  isLive,
  duration,
  isMuted,
  isPlaying,
  liveGuideOpen,
  onAspectRatioChange,
  onContentList,
  onLiveGuideToggle,
  onNext,
  onPrevious,
  onQualityChange,
  onSeek,
  onSettingsToggle,
  onToggleMute,
  onTogglePlay,
  quality,
  qualityOptions,
  reduceMotion,
  settingsOpen,
  showContentList,
  showEpisodeNavigation,
}: {
  aspectRatio: PlayerAspectRatio;
  contentListOpen: boolean;
  controlsVisible: boolean;
  currentTime: number;
  isLive: boolean;
  duration: number;
  isMuted: boolean;
  isPlaying: boolean;
  liveGuideOpen: boolean;
  onAspectRatioChange: (value: PlayerAspectRatio) => void;
  onContentList: () => void;
  onLiveGuideToggle: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onQualityChange: (value: PlayerQuality) => void;
  onSeek: (value: number) => void;
  onSettingsToggle: () => void;
  onToggleMute: () => void;
  onTogglePlay: () => void;
  quality: PlayerQuality;
  qualityOptions: PlayerQualityOption[];
  reduceMotion: boolean;
  settingsOpen: boolean;
  showContentList: boolean;
  showEpisodeNavigation: boolean;
}) {
  const displayedCurrentTime =
    duration > 0 ? Math.min(currentTime, duration) : 0;

  return (
    <section
      aria-label="Controles de reprodução"
      className={`relative z-10 mt-auto flex flex-col gap-3 px-5 pb-7 sm:gap-[18px] sm:px-[42px] sm:pb-[38px] ${controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"} ${reduceMotion ? "transition-none" : "transition-opacity"}`}
      data-player-controls
    >
      {!isLive && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[0.6875rem] text-muted">
            <span>{formatPlaybackTime(displayedCurrentTime)}</span>
            <span>{formatPlaybackTime(duration)}</span>
          </div>
          <input
            aria-label="Posição da reprodução"
            className="h-1 w-full accent-gold focus-visible:outline-2 focus-visible:outline-focus"
            data-player-focus-anchor
            data-player-progress
            max={duration || 1}
            min={0}
            onChange={(event) => onSeek(Number(event.target.value))}
            type="range"
            value={displayedCurrentTime}
          />
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <TvPlayerControlButton
            label={isPlaying ? "Pausar" : "Reproduzir"}
            onClick={onTogglePlay}
          >
            {isPlaying ? "❚❚" : "▶"}
          </TvPlayerControlButton>
          <TvPlayerControlButton
            label={isMuted ? "Ativar som" : "Silenciar"}
            onClick={onToggleMute}
          >
            {isMuted ? "🔇" : "🔊"}
          </TvPlayerControlButton>
        </div>
        <div className="flex items-center gap-1">
          {showEpisodeNavigation && (
            <>
              <TvPlayerControlButton
                disabled={!onPrevious}
                label="Episódio anterior"
                onClick={onPrevious ?? (() => undefined)}
              >
                ←
              </TvPlayerControlButton>
              <TvPlayerControlButton
                disabled={!onNext}
                label="Próximo episódio"
                onClick={onNext ?? (() => undefined)}
              >
                →
              </TvPlayerControlButton>
            </>
          )}
          {showContentList && (
            <TvPlayerControlButton
              active={contentListOpen}
              label="Lista de conteúdo"
              onClick={onContentList}
            >
              ☷
            </TvPlayerControlButton>
          )}
          {isLive && (
            <TvPlayerControlButton
              active={liveGuideOpen}
              label={liveGuideOpen ? "Fechar programação" : "Abrir programação"}
              onClick={onLiveGuideToggle}
            >
              ◷
            </TvPlayerControlButton>
          )}
          <div className="relative">
            <TvPlayerControlButton
              label="Configurações"
              onClick={onSettingsToggle}
            >
              ⚙
            </TvPlayerControlButton>
            {settingsOpen && (
              <div
                aria-label="Configurações do player"
                className="absolute right-0 bottom-full z-40 mb-3 w-56 rounded-xl border border-white/15 bg-black/75 p-3 text-text shadow-2xl"
                role="dialog"
              >
                <span className="text-xs font-semibold text-white/75">
                  Qualidade da imagem
                </span>
                <SelectField
                  aria-label="Qualidade da imagem"
                  className="mt-1.5 w-full"
                  onValueChange={onQualityChange}
                  options={qualityOptions}
                  triggerClassName="w-full border-white/15 bg-transparent"
                  value={quality}
                  valueLabel={
                    qualityOptions.find((option) => option.value === quality)
                      ?.label
                  }
                />
              </div>
            )}
          </div>
          <TvPlayerControlButton
            label="Proporção do player"
            onClick={() => {
              const index = ASPECT_RATIO_OPTIONS.findIndex(
                (option) => option.value === aspectRatio,
              );
              onAspectRatioChange(
                ASPECT_RATIO_OPTIONS[(index + 1) % ASPECT_RATIO_OPTIONS.length]
                  .value,
              );
            }}
          >
            ⛶
          </TvPlayerControlButton>
        </div>
      </div>
    </section>
  );
}
