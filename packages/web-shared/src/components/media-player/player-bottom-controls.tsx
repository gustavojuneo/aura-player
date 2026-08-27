import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Expand,
  ListVideo,
  Pause,
  Play,
  Ratio,
  Settings,
  Volume1,
  Volume2,
  VolumeOff,
} from "lucide-react";
import { formatPlaybackTime } from "../../features/playback/playback";
import {
  ASPECT_RATIO_OPTIONS,
  type PlayerAspectRatio,
} from "../../utils/constants";
import { SelectField } from "../ui";
import { ControlButton } from "./control-button";
import { PlayerTooltip } from "./player-tooltip";
import type { PlayerQuality, PlayerQualityOption } from "./types";

type PlayerBottomControlsProps = {
  aspectRatio: PlayerAspectRatio;
  contentListOpen: boolean;
  controlsVisible: boolean;
  currentTime: number;
  descriptor: { isLive: boolean; secondaryTitle?: string; title: string };
  duration: number;
  isReady: boolean;
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
  onToggleFullscreen: () => void;
  onToggleMute: () => void;
  onTogglePlay: () => void;
  onVolumeChange: (value: number) => void;
  quality: PlayerQuality;
  qualityOptions: PlayerQualityOption[];
  reduceMotion: boolean;
  settingsOpen: boolean;
  showContentList: boolean;
  showEpisodeNavigation: boolean;
  volume: number;
};

export function PlayerBottomControls(props: PlayerBottomControlsProps) {
  const {
    aspectRatio,
    contentListOpen,
    controlsVisible,
    currentTime,
    descriptor,
    duration,
    isReady,
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
    onToggleFullscreen,
    onToggleMute,
    onTogglePlay,
    onVolumeChange,
    quality,
    qualityOptions,
    reduceMotion,
    settingsOpen,
    showContentList,
    showEpisodeNavigation,
    volume,
  } = props;
  const displayedCurrentTime =
    isReady && duration > 0 ? Math.min(currentTime, duration) : 0;

  return (
    <section
      aria-label="Controles de reprodução"
      className={`relative z-10 mt-auto flex flex-col gap-3 px-5 pb-7 sm:gap-[18px] sm:px-[42px] sm:pb-[38px] ${controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"} ${reduceMotion ? "transition-none" : "transition-opacity"}`}
      data-player-controls
    >
      <div className="flex items-end justify-between gap-4">
        <p className="m-0 truncate text-xs font-bold sm:hidden">
          {descriptor.title}
          {descriptor.secondaryTitle ? ` · ${descriptor.secondaryTitle}` : ""}
        </p>
      </div>
      {!descriptor.isLive && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[0.6875rem] text-muted">
            <span>{formatPlaybackTime(displayedCurrentTime)}</span>
            <span>{formatPlaybackTime(duration)}</span>
          </div>
          <PlayerTooltip
            label="Posição da reprodução"
            shortcut="←/→ · Home/End · 0–9"
          >
            <input
              aria-keyshortcuts={
                "ArrowLeft ArrowRight Home End 0 1 2 3 4 5 6 7 8 9"
              }
              aria-label="Posição da reprodução"
              className="h-1 w-full cursor-pointer accent-gold outline-none transition-[height] focus-visible:h-1.5 focus-visible:accent-gold-bright focus-visible:outline-none"
              data-player-focus-anchor
              data-player-progress
              max={duration || 1}
              min={0}
              onChange={(event) => onSeek(Number(event.target.value))}
              type="range"
              value={displayedCurrentTime}
            />
          </PlayerTooltip>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <ControlButton
            label={isPlaying ? "Pausar" : "Reproduzir"}
            onClick={onTogglePlay}
            shortcut="Space/K"
          >
            {isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4 fill-current" />
            )}
          </ControlButton>
          <div className="group/volume flex items-center gap-2">
            <ControlButton
              label={isMuted ? "Ativar som" : "Silenciar"}
              onClick={onToggleMute}
              shortcut="M"
            >
              {isMuted || volume === 0 ? (
                <VolumeOff className="size-4" />
              ) : volume <= 0.5 ? (
                <Volume1 className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </ControlButton>
            <input
              aria-keyshortcuts="ArrowUp ArrowDown"
              aria-label="Volume do player"
              className="h-1 w-0 cursor-pointer accent-gold opacity-0 transition-[width,opacity] duration-200 group-hover/volume:w-20 group-hover/volume:opacity-100 group-focus-within/volume:w-20 group-focus-within/volume:opacity-100 sm:group-hover/volume:w-24 sm:group-focus-within/volume:w-24"
              max={100}
              min={0}
              onChange={(event) =>
                onVolumeChange(Number(event.target.value) / 100)
              }
              type="range"
              value={Math.round(volume * 100)}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          {showEpisodeNavigation && (
            <>
              <ControlButton
                disabled={!onPrevious}
                label="Episódio anterior"
                onClick={onPrevious ?? (() => undefined)}
              >
                <ChevronLeft className="size-4" />
              </ControlButton>
              <ControlButton
                disabled={!onNext}
                label="Próximo episódio"
                onClick={onNext ?? (() => undefined)}
              >
                <ChevronRight className="size-4" />
              </ControlButton>
            </>
          )}
          {showContentList && (
            <ControlButton
              active={contentListOpen}
              label="Lista de conteúdo"
              onClick={onContentList}
            >
              <ListVideo className="size-4" />
            </ControlButton>
          )}
          {descriptor.isLive && (
            <ControlButton
              active={liveGuideOpen}
              label={liveGuideOpen ? "Fechar programação" : "Abrir programação"}
              onClick={onLiveGuideToggle}
            >
              <CalendarClock className="size-4" />
            </ControlButton>
          )}
          <div className="relative">
            <ControlButton label="Configurações" onClick={onSettingsToggle}>
              <Settings className="size-4" />
            </ControlButton>
            {settingsOpen && (
              <div
                aria-label="Configurações do player"
                className="absolute right-0 bottom-full z-40 mb-3 w-56 rounded-xl border border-white/15 bg-black/75 p-3 text-text shadow-2xl backdrop-blur-md"
                role="dialog"
              >
                <p className="m-0 text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-gold-bright">
                  Configurações do player
                </p>
                <div className="mt-3 block text-xs font-semibold text-white/75">
                  Qualidade da imagem
                  <PlayerTooltip label="Qualidade da imagem">
                    <SelectField
                      aria-label="Qualidade da imagem"
                      className="mt-1.5 w-full"
                      onValueChange={onQualityChange}
                      options={qualityOptions}
                      triggerClassName="w-full border-white/15 bg-transparent"
                      value={quality}
                      valueLabel={
                        qualityOptions.find(
                          (option) => option.value === quality,
                        )?.label
                      }
                    />
                  </PlayerTooltip>
                </div>
                <p className="mt-2 mb-0 text-[0.625rem] leading-4 text-white/50">
                  Disponível quando a fonte oferece múltiplas qualidades.
                </p>
              </div>
            )}
          </div>
          <PlayerTooltip label="Proporção do player">
            <SelectField
              aria-label="Proporção do player"
              focusAnchor
              leading={<Ratio aria-hidden="true" className="size-4 shrink-0" />}
              onValueChange={(value) => {
                if (["original", "16:9", "4:3", "fill", "crop"].includes(value))
                  onAspectRatioChange(value as PlayerAspectRatio);
              }}
              options={ASPECT_RATIO_OPTIONS}
              triggerClassName="h-8 min-w-[92px] border-transparent bg-transparent px-2 hover:border-white/10 hover:bg-white/10"
              value={aspectRatio}
              valueLabel={
                ASPECT_RATIO_OPTIONS.find(
                  (option) => option.value === aspectRatio,
                )?.label
              }
            />
          </PlayerTooltip>
          <ControlButton
            label="Tela cheia"
            onClick={onToggleFullscreen}
            shortcut="F"
          >
            <Expand className="size-4" />
          </ControlButton>
        </div>
      </div>
    </section>
  );
}
