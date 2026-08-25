import Hls from "hls.js";
import {
  ArrowLeft,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Expand,
  ListVideo,
  LoaderCircle,
  Pause,
  Play,
  Ratio,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import mpegts from "mpegts.js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaybackDescriptor } from "../features/playback/playback";
import { formatPlaybackTime } from "../features/playback/playback";
import { usePlaybackPreferences } from "../services/playback-preferences";
import { ProductState, SelectField } from "./ui";

type PlayerAspectRatio = "original" | "16:9" | "4:3" | "fill" | "crop";
type PlayerQuality = "auto" | string;

const aspectRatioOptions = [
  { label: "Original", value: "original" },
  { label: "16:9", value: "16:9" },
  { label: "4:3", value: "4:3" },
  { label: "Preencher", value: "fill" },
  { label: "Cortar", value: "crop" },
] as const;

const automaticQualityOption = { label: "Automática", value: "auto" };

function qualityOptionsForHeights(heights: number[]) {
  return [
    automaticQualityOption,
    ...[...new Set(heights)]
      .sort((first, second) => second - first)
      .map((height) => ({ label: `${height}p`, value: String(height) })),
  ];
}

type MediaPlayerProps = {
  autoPlay?: boolean;
  descriptor: PlaybackDescriptor;
  isLoading?: boolean;
  onBack: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onOpenContentList: () => void;
  renderLiveGuide?: React.ReactNode;
  renderNextEpisode?: (
    remainingSeconds: number,
    onSelect: () => void,
  ) => React.ReactNode;
  renderContentList?: (
    onClose: () => void,
    avoidLiveGuide: boolean,
  ) => React.ReactNode;
  showEpisodeNavigation?: boolean;
};

type Engine =
  | Hls
  | mpegts.Player
  | { destroy: () => Promise<void> | void }
  | null;

type QualityEngine = {
  getHeights: () => number[];
  setQuality: (quality: string) => void;
};

function ControlButton({
  active = false,
  label,
  children,
  disabled = false,
  onClick,
}: {
  active?: boolean;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active || undefined}
      className={`grid size-7 place-items-center rounded-md text-text transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-35 sm:size-8 ${active ? "bg-gold/20 text-gold-bright" : ""}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const engineRef = useRef<Engine>(null);
  const qualityEngineRef = useRef<QualityEngine | null>(null);
  const sessionRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(descriptor.position ?? 0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [contentListOpen, setContentListOpen] = useState(false);
  const [liveGuideOpen, setLiveGuideOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quality, setQuality] = useState<PlayerQuality>("auto");
  const [qualityOptions, setQualityOptions] = useState([
    automaticQualityOption,
  ]);
  const [pendingSeek, setPendingSeek] = useState(0);
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState<
    number | null
  >(null);
  const [aspectRatio, setAspectRatio] = useState<PlayerAspectRatio>("original");
  const hideTimerRef = useRef<number | null>(null);
  const seekTimerRef = useRef<number | null>(null);
  const nextEpisodeTimerRef = useRef<number | null>(null);
  const nextEpisodeCountdownTimerRef = useRef<number | null>(null);
  const nextEpisodeCountdownValueRef = useRef<number | null>(null);
  const nextEpisodeStartedRef = useRef(false);
  const pendingSeekRef = useRef(0);
  const { preferences } = usePlaybackPreferences();

  useEffect(() => {
    void descriptor.contentId;
    pendingSeekRef.current = 0;
    setPendingSeek(0);
    if (seekTimerRef.current !== null) {
      window.clearTimeout(seekTimerRef.current);
      seekTimerRef.current = null;
    }
    return () => {
      if (seekTimerRef.current !== null)
        window.clearTimeout(seekTimerRef.current);
    };
  }, [descriptor.contentId]);

  useEffect(() => {
    void descriptor.contentId;
    nextEpisodeStartedRef.current = false;
    if (nextEpisodeTimerRef.current !== null) {
      window.clearTimeout(nextEpisodeTimerRef.current);
      nextEpisodeTimerRef.current = null;
    }
    if (nextEpisodeCountdownTimerRef.current !== null) {
      window.clearInterval(nextEpisodeCountdownTimerRef.current);
      nextEpisodeCountdownTimerRef.current = null;
    }
    nextEpisodeCountdownValueRef.current = null;
    setNextEpisodeCountdown(null);
    return () => {
      if (nextEpisodeTimerRef.current !== null)
        window.clearTimeout(nextEpisodeTimerRef.current);
      if (nextEpisodeCountdownTimerRef.current !== null)
        window.clearInterval(nextEpisodeCountdownTimerRef.current);
    };
  }, [descriptor.contentId]);

  const clearNextEpisode = useCallback(() => {
    if (nextEpisodeTimerRef.current !== null) {
      window.clearTimeout(nextEpisodeTimerRef.current);
      nextEpisodeTimerRef.current = null;
    }
    if (nextEpisodeCountdownTimerRef.current !== null) {
      window.clearInterval(nextEpisodeCountdownTimerRef.current);
      nextEpisodeCountdownTimerRef.current = null;
    }
    nextEpisodeCountdownValueRef.current = null;
    setNextEpisodeCountdown(null);
  }, []);

  const attemptAutoplay = useCallback(() => {
    const video = videoRef.current;
    if (!autoPlay || !video?.paused) return;
    video.muted = false;
    void video.play().catch(() => {
      video.muted = true;
      setIsMuted(true);
      void video.play().catch(() => undefined);
    });
  }, [autoPlay]);

  useEffect(() => {
    if (
      descriptor.isLive ||
      !renderNextEpisode ||
      duration <= 0 ||
      !isReady ||
      isLoading
    ) {
      if (!isReady || isLoading) clearNextEpisode();
      return;
    }
    if (nextEpisodeStartedRef.current) return;
    const remaining = duration - currentTime;
    if (remaining <= 0) return;
    const showNextEpisode = () => {
      if (nextEpisodeStartedRef.current) return;
      nextEpisodeStartedRef.current = true;
      nextEpisodeCountdownValueRef.current = 20;
      setNextEpisodeCountdown(20);
      nextEpisodeCountdownTimerRef.current = window.setInterval(() => {
        const value = nextEpisodeCountdownValueRef.current;
        if (value === null) return;
        if (value <= 1) {
          clearNextEpisode();
          onNext?.();
          return;
        }
        const nextValue = value - 1;
        nextEpisodeCountdownValueRef.current = nextValue;
        setNextEpisodeCountdown(nextValue);
      }, 1000);
      nextEpisodeTimerRef.current = null;
    };
    if (remaining <= 60) {
      showNextEpisode();
    } else {
      nextEpisodeTimerRef.current = window.setTimeout(
        showNextEpisode,
        (remaining - 60) * 1000,
      );
    }
    return () => {
      if (nextEpisodeTimerRef.current !== null)
        window.clearTimeout(nextEpisodeTimerRef.current);
    };
  }, [
    clearNextEpisode,
    currentTime,
    descriptor.isLive,
    duration,
    isLoading,
    isReady,
    onNext,
    renderNextEpisode,
  ]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current !== null)
      window.clearTimeout(hideTimerRef.current);
    if (preferences.hideControls && isPlaying) {
      hideTimerRef.current = window.setTimeout(
        () => setControlsVisible(false),
        3000,
      );
    }
  }, [isPlaying, preferences.hideControls]);

  useEffect(() => {
    void retryKey;
    const video = videoRef.current;
    if (isLoading) {
      setIsReady(false);
      setError(null);
      return;
    }
    if (!video || !descriptor.streamUrl) {
      setIsReady(false);
      setError(
        "Nenhuma fonte de reprodução foi configurada para este conteúdo.",
      );
      return;
    }

    const session = ++sessionRef.current;
    const url = descriptor.streamUrl;
    const cleanEngine = () => {
      const engine = engineRef.current;
      if (engine instanceof Hls) engine.destroy();
      if (engine && "detachMediaElement" in engine) {
        engine.pause();
        engine.unload();
        engine.detachMediaElement();
        engine.destroy();
      }
      if (
        engine &&
        !(engine instanceof Hls) &&
        !("detachMediaElement" in engine)
      ) {
        void engine.destroy();
      }
      engineRef.current = null;
      qualityEngineRef.current = null;
      video.pause();
      video.removeAttribute("src");
      video.load();
    };

    cleanEngine();
    setIsReady(false);
    setError(null);
    setQuality("auto");
    setQualityOptions([automaticQualityOption]);
    setIsMuted(false);
    video.muted = false;
    setCurrentTime(preferences.autoResume ? (descriptor.position ?? 0) : 0);
    setDuration(0);

    const play = (start: () => Promise<void>) => {
      if (!autoPlay) return;
      video.muted = false;
      void start().catch(() => undefined);
    };

    const fail = () => {
      if (session === sessionRef.current) {
        setError(
          "Não foi possível reproduzir este stream. Verifique a fonte, CORS e o codec.",
        );
      }
    };

    if (descriptor.delivery === "hls" && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: descriptor.isLive,
      });
      engineRef.current = hls;
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) fail();
      });
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setQualityOptions(
          qualityOptionsForHeights(
            hls.levels
              .map((level) => level.height)
              .filter((height) => Number.isFinite(height) && height > 0),
          ),
        );
        if (preferences.autoResume && descriptor.position && !descriptor.isLive)
          video.currentTime = descriptor.position;
        play(() => video.play());
      });
      hls.attachMedia(video);
      hls.loadSource(url);
    } else if (descriptor.delivery === "mpeg-ts" && mpegts.isSupported()) {
      const player = mpegts.createPlayer({
        type: "mpegts",
        isLive: descriptor.isLive,
        url,
      });
      engineRef.current = player;
      player.on(mpegts.Events.ERROR, fail);
      player.attachMediaElement(video);
      player.load();
      play(() => Promise.resolve(player.play()));
    } else if (descriptor.delivery === "dash") {
      void import("shaka-player")
        .then(({ default: shaka }) => {
          if (session !== sessionRef.current) return;
          shaka.polyfill.installAll();
          if (!shaka.Player.isBrowserSupported()) {
            fail();
            return;
          }
          const player = new shaka.Player(video);
          qualityEngineRef.current = {
            getHeights: () =>
              player
                .getVariantTracks()
                .flatMap((track) =>
                  typeof track.height === "number" &&
                  Number.isFinite(track.height) &&
                  track.height > 0
                    ? [track.height]
                    : [],
                ),
            setQuality: (selectedQuality) => {
              const tracks = player
                .getVariantTracks()
                .filter(
                  (track): track is typeof track & { height: number } =>
                    typeof track.height === "number" &&
                    Number.isFinite(track.height) &&
                    track.height > 0,
                );
              if (selectedQuality === "auto") {
                player.configure({ abr: { enabled: true } });
                return;
              }
              if (tracks.length === 0) return;
              const targetHeight = Number.parseInt(selectedQuality, 10);
              const track = tracks.reduce(
                (best, candidate) =>
                  Math.abs(candidate.height - targetHeight) <
                  Math.abs(best.height - targetHeight)
                    ? candidate
                    : best,
                tracks[0],
              );
              if (!track) return;
              player.configure({ abr: { enabled: false } });
              player.selectVariantTrack(track, true);
            },
          };
          engineRef.current = player as unknown as Engine;
          player.addEventListener("error", fail);
          void player
            .load(url)
            .then(() => {
              setQualityOptions(
                qualityOptionsForHeights(
                  qualityEngineRef.current?.getHeights() ?? [],
                ),
              );
              if (
                preferences.autoResume &&
                descriptor.position &&
                !descriptor.isLive
              )
                video.currentTime = descriptor.position;
              play(() => video.play());
            })
            .catch(fail);
        })
        .catch(fail);
    } else if (
      descriptor.delivery === "hls" &&
      video.canPlayType("application/vnd.apple.mpegurl")
    ) {
      video.src = url;
      play(() => video.play());
    } else {
      video.src = url;
      play(() => video.play());
    }

    return () => {
      sessionRef.current += 1;
      cleanEngine();
    };
  }, [autoPlay, descriptor, isLoading, preferences.autoResume, retryKey]);

  useEffect(() => {
    if (!preferences.hideControls || !isPlaying) {
      setControlsVisible(true);
      if (hideTimerRef.current !== null)
        window.clearTimeout(hideTimerRef.current);
      return;
    }
    revealControls();
    return () => {
      if (hideTimerRef.current !== null)
        window.clearTimeout(hideTimerRef.current);
    };
  }, [isPlaying, preferences.hideControls, revealControls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () =>
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onCanPlay = () => {
      setIsReady(true);
      attemptAutoplay();
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () =>
      setError("O navegador não conseguiu decodificar este formato ou codec.");
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("loadedmetadata", onDurationChange);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("loadedmetadata", onDurationChange);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
    };
  }, [attemptAutoplay]);

  useEffect(() => {
    void descriptor.contentId;
    void retryKey;
    if (!autoPlay || isLoading) return;
    attemptAutoplay();
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      attemptAutoplay();
      if (attempts >= 20 || videoRef.current?.paused === false) {
        window.clearInterval(timer);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [attemptAutoplay, autoPlay, descriptor.contentId, isLoading, retryKey]);

  useEffect(() => {
    if (!autoPlay || isLoading || !isReady) return;
    attemptAutoplay();
  }, [attemptAutoplay, autoPlay, isLoading, isReady]);

  useEffect(() => {
    const engine = engineRef.current;
    if (engine instanceof Hls) {
      if (!isReady || engine.levels.length === 0) return;
      if (quality === "auto") {
        engine.currentLevel = -1;
        return;
      }
      const targetHeight = Number.parseInt(quality, 10);
      const qualityIndex = engine.levels.reduce(
        (bestIndex, level, index, levels) =>
          Math.abs(level.height - targetHeight) <
          Math.abs(levels[bestIndex].height - targetHeight)
            ? index
            : bestIndex,
        0,
      );
      engine.currentLevel = qualityIndex;
      return;
    }
    if (isReady) qualityEngineRef.current?.setQuality(quality);
  }, [isReady, quality]);

  const playerLoading = isLoading || !isReady;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted) {
      video.muted = false;
      setIsMuted(false);
    }
    if (video.paused)
      void video
        .play()
        .catch(() =>
          setError(
            "A reprodução automática foi bloqueada. Pressione play para iniciar.",
          ),
        );
    else video.pause();
  };

  const queueSeek = (delta: number) => {
    if (descriptor.isLive || playerLoading) return;
    pendingSeekRef.current += delta;
    setPendingSeek(pendingSeekRef.current);
    if (seekTimerRef.current !== null)
      window.clearTimeout(seekTimerRef.current);
    seekTimerRef.current = window.setTimeout(() => {
      const video = videoRef.current;
      if (!video) return;
      const maxTime =
        duration > 0
          ? duration
          : Number.isFinite(video.duration)
            ? video.duration
            : Number.POSITIVE_INFINITY;
      const nextTime = Math.min(
        maxTime,
        Math.max(0, video.currentTime + pendingSeekRef.current),
      );
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
      pendingSeekRef.current = 0;
      setPendingSeek(0);
      seekTimerRef.current = null;
    }, 400);
  };

  const seek = (value: number) => {
    if (videoRef.current && duration > 0) videoRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const toggleFullscreen = () => {
    const element = videoRef.current?.parentElement;
    if (element && !document.fullscreenElement)
      void element.requestFullscreen();
    else if (document.fullscreenElement) void document.exitFullscreen();
  };

  const isFixedAspect = aspectRatio === "16:9" || aspectRatio === "4:3";
  const videoAspectStyle = isFixedAspect
    ? {
        aspectRatio: aspectRatio === "16:9" ? "16 / 9" : "4 / 3",
        width:
          aspectRatio === "16:9"
            ? "min(100%, 177.78dvh)"
            : "min(100%, 133.33dvh)",
      }
    : undefined;

  return (
    <main
      className={`relative flex h-dvh min-h-[560px] w-full flex-col overflow-hidden bg-[#080806] text-text ${preferences.reduceMotion ? "[&_button]:transition-none" : ""}`}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (
          target.closest(
            "button, input, select, textarea, a, [data-player-action], [data-player-controls]",
          )
        ) {
          return;
        }
        if (contentListOpen) {
          setContentListOpen(false);
        }
        togglePlay();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const target = event.target as HTMLElement;
        if (
          target.closest(
            "button, input, select, textarea, a, [data-player-action], [data-player-controls]",
          )
        ) {
          return;
        }
        if (contentListOpen) {
          setContentListOpen(false);
        }
        event.preventDefault();
        togglePlay();
      }}
      onMouseMove={() => {
        revealControls();
      }}
      onTouchStart={() => {
        revealControls();
      }}
    >
      <video
        aria-label={descriptor.title}
        autoPlay={autoPlay}
        className={
          aspectRatio === "original"
            ? "absolute inset-0 size-full object-contain"
            : aspectRatio === "fill"
              ? "absolute inset-0 size-full object-fill"
              : aspectRatio === "crop"
                ? "absolute inset-0 size-full object-cover"
                : "absolute left-1/2 top-1/2 h-auto max-h-full max-w-full -translate-x-1/2 -translate-y-1/2 object-contain"
        }
        playsInline
        ref={videoRef}
        style={videoAspectStyle}
      >
        <track
          kind="captions"
          label="Português"
          src="data:text/vtt,WEBVTT"
          srcLang="pt-BR"
        />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/90" />
      {descriptor.isLive &&
        controlsVisible &&
        liveGuideOpen &&
        renderLiveGuide && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[72px] z-20 w-full px-4 pb-2 sm:bottom-[90px] sm:px-[42px] sm:pb-3">
            {renderLiveGuide}
          </div>
        )}
      {nextEpisodeCountdown !== null && renderNextEpisode && (
        <div
          className="absolute inset-x-5 bottom-[88px] z-20 flex justify-end sm:inset-x-[42px] sm:bottom-[112px]"
          data-player-action
        >
          {renderNextEpisode(nextEpisodeCountdown, () => {
            clearNextEpisode();
            onNext?.();
          })}
        </div>
      )}
      {controlsVisible &&
        contentListOpen &&
        renderContentList?.(() => setContentListOpen(false), liveGuideOpen)}
      <header
        className={`relative z-10 flex items-start justify-between px-5 pt-6 transition-opacity sm:px-9 sm:pt-7 ${controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <button
          className="flex min-w-0 items-start gap-3 text-left focus-visible:outline-2 focus-visible:outline-focus"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft className="mt-0.5 size-4 shrink-0" />
          <span className="min-w-0">
            <strong className="block max-w-[220px] truncate text-xs font-bold sm:text-sm">
              {descriptor.title}
            </strong>
            {descriptor.secondaryTitle && (
              <span className="block max-w-[240px] truncate text-[10px] text-muted">
                {descriptor.secondaryTitle}
              </span>
            )}
          </span>
        </button>
        {descriptor.isLive && (
          <span
            className={`rounded-full bg-live px-2.5 py-1 text-[9px] font-extrabold tracking-[0.08em] text-text transition-opacity ${controlsVisible ? "opacity-100" : "opacity-0"}`}
          >
            ● AO VIVO
          </span>
        )}
      </header>

      <div
        className={`absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 ${controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        {!descriptor.isLive && (
          <button
            aria-label={`Retroceder ${Math.abs(pendingSeek < 0 ? pendingSeek : 10)} segundos`}
            className="flex h-16 min-w-20 items-center justify-center gap-2 rounded-lg px-3 text-base font-bold text-text opacity-60 transition-[background-color,opacity] hover:bg-white/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-wait disabled:opacity-40"
            disabled={playerLoading}
            onClick={() => queueSeek(-10)}
            type="button"
          >
            <RotateCcw aria-hidden="true" className="size-5" />
            <span>{pendingSeek < 0 ? `${pendingSeek}s` : "-10s"}</span>
          </button>
        )}
        <button
          aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          className={`grid size-[88px] place-items-center rounded-full border border-white/20 bg-[#171510CC] text-text opacity-60 focus-visible:outline-2 focus-visible:outline-focus hover:opacity-100 ${playerLoading ? "cursor-wait" : ""} ${preferences.reduceMotion ? "transition-none" : "transition-[opacity,transform] hover:scale-105"}`}
          onClick={togglePlay}
          disabled={playerLoading}
          type="button"
        >
          {playerLoading ? (
            <LoaderCircle aria-hidden="true" className="size-8 animate-spin" />
          ) : isPlaying ? (
            <Pause className="size-8" />
          ) : (
            <Play className="ml-1 size-8 fill-current" />
          )}
        </button>
        {!descriptor.isLive && (
          <button
            aria-label={`Avançar ${pendingSeek > 0 ? pendingSeek : 10} segundos`}
            className="flex h-16 min-w-20 items-center justify-center gap-2 rounded-lg px-3 text-base font-bold text-text opacity-60 transition-[background-color,opacity] hover:bg-white/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-wait disabled:opacity-40"
            disabled={playerLoading}
            onClick={() => queueSeek(10)}
            type="button"
          >
            <span>{pendingSeek > 0 ? `+${pendingSeek}s` : "+10s"}</span>
            <RotateCw aria-hidden="true" className="size-5" />
          </button>
        )}
      </div>

      <section
        aria-label="Controles de reprodução"
        className={`relative z-10 mt-auto flex flex-col gap-3 px-5 pb-7 sm:gap-[18px] sm:px-[42px] sm:pb-[38px] ${controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"} ${preferences.reduceMotion ? "transition-none" : "transition-opacity"}`}
        data-player-controls
      >
        <div className="flex items-end justify-between gap-4">
          <p className="m-0 truncate text-xs font-bold sm:hidden">
            {descriptor.title}
            {descriptor.secondaryTitle ? ` · ${descriptor.secondaryTitle}` : ""}
          </p>
          {!descriptor.isLive && duration > 0 && (
            <span className="hidden text-[11px] text-muted sm:block">
              {formatPlaybackTime(currentTime)} / {formatPlaybackTime(duration)}
            </span>
          )}
        </div>
        {!descriptor.isLive && (
          <input
            aria-label="Posição da reprodução"
            className="h-1 w-full cursor-pointer accent-gold"
            max={duration || 1}
            min={0}
            onChange={(event) => seek(Number(event.target.value))}
            type="range"
            value={Math.min(currentTime, duration || 1)}
          />
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <ControlButton
              label={isPlaying ? "Pausar" : "Reproduzir"}
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4 fill-current" />
              )}
            </ControlButton>
            <div className="group/volume relative">
              <ControlButton
                label={isMuted ? "Ativar som" : "Silenciar"}
                onClick={() => {
                  const nextMuted = !isMuted;
                  const nextVolume = !nextMuted && volume === 0 ? 1 : volume;
                  if (videoRef.current) {
                    videoRef.current.muted = nextMuted;
                    videoRef.current.volume = nextVolume;
                  }
                  if (nextVolume !== volume) setVolume(nextVolume);
                  setIsMuted(nextMuted);
                }}
              >
                {isMuted ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </ControlButton>
              <div className="pointer-events-none absolute bottom-full left-1/2 flex h-28 w-8 -translate-x-1/2 items-center justify-center rounded-lg bg-black/35 opacity-0 transition-opacity group-hover/volume:pointer-events-auto group-hover/volume:opacity-100">
                <input
                  aria-label="Volume do player"
                  className="h-24 w-1 cursor-pointer accent-gold [direction:rtl] [writing-mode:vertical-lr]"
                  max={100}
                  min={0}
                  onChange={(event) => {
                    const nextVolume = Number(event.target.value) / 100;
                    setVolume(nextVolume);
                    if (videoRef.current) {
                      videoRef.current.muted = nextVolume === 0;
                      videoRef.current.volume = nextVolume;
                    }
                    setIsMuted(nextVolume === 0);
                  }}
                  type="range"
                  value={Math.round(volume * 100)}
                />
              </div>
            </div>
            {!descriptor.isLive && (
              <span className="hidden text-[11px] text-muted sm:inline">
                {formatPlaybackTime(currentTime)} /{" "}
                {formatPlaybackTime(duration)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {showEpisodeNavigation && (
              <>
                <ControlButton
                  label="Episódio anterior"
                  onClick={onPrevious ?? (() => undefined)}
                  disabled={!onPrevious}
                >
                  <ChevronLeft className="size-4" />
                </ControlButton>
                <ControlButton
                  label="Próximo episódio"
                  onClick={onNext ?? (() => undefined)}
                  disabled={!onNext}
                >
                  <ChevronRight className="size-4" />
                </ControlButton>
              </>
            )}
            <ControlButton
              active={Boolean(renderContentList && contentListOpen)}
              label="Lista de conteúdo"
              onClick={() => {
                if (renderContentList) setContentListOpen((open) => !open);
                else onOpenContentList();
              }}
            >
              <ListVideo className="size-4" />
            </ControlButton>
            {descriptor.isLive && renderLiveGuide && (
              <ControlButton
                active={liveGuideOpen}
                label={
                  liveGuideOpen ? "Fechar programação" : "Abrir programação"
                }
                onClick={() => setLiveGuideOpen((open) => !open)}
              >
                <CalendarClock className="size-4" />
              </ControlButton>
            )}
            <div className="relative">
              <ControlButton
                label="Configurações"
                onClick={() => setSettingsOpen((open) => !open)}
              >
                <Settings className="size-4" />
              </ControlButton>
              {settingsOpen && (
                <div
                  aria-label="Configurações do player"
                  className="absolute right-0 bottom-full z-40 mb-3 w-56 rounded-xl border border-white/15 bg-black/75 p-3 text-text shadow-2xl backdrop-blur-md"
                  role="dialog"
                >
                  <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.12em] text-gold-bright">
                    Configurações do player
                  </p>
                  <div className="mt-3 block text-xs font-semibold text-white/75">
                    Qualidade da imagem
                    <SelectField
                      aria-label="Qualidade da imagem"
                      className="mt-1.5 w-full"
                      onValueChange={(value) => {
                        if (
                          qualityOptions.some(
                            (option) => option.value === value,
                          )
                        ) {
                          setQuality(value);
                        }
                      }}
                      options={qualityOptions}
                      triggerClassName="w-full border-white/15 bg-transparent"
                      value={quality}
                      valueLabel={
                        qualityOptions.find(
                          (option) => option.value === quality,
                        )?.label
                      }
                    />
                  </div>
                  <p className="mt-2 mb-0 text-[10px] leading-4 text-white/50">
                    Disponível quando a fonte oferece múltiplas qualidades.
                  </p>
                </div>
              )}
            </div>
            <SelectField
              aria-label="Proporção do player"
              leading={<Ratio aria-hidden="true" className="size-4 shrink-0" />}
              onValueChange={(value) => {
                if (
                  value === "original" ||
                  value === "16:9" ||
                  value === "4:3" ||
                  value === "fill" ||
                  value === "crop"
                ) {
                  setAspectRatio(value);
                }
              }}
              options={aspectRatioOptions}
              triggerClassName="h-8 min-w-[92px] border-transparent bg-transparent px-2 hover:border-white/10 hover:bg-white/10"
              value={aspectRatio}
              valueLabel={
                aspectRatioOptions.find(
                  (option) => option.value === aspectRatio,
                )?.label
              }
            />
            <ControlButton label="Tela cheia" onClick={toggleFullscreen}>
              <Expand className="size-4" />
            </ControlButton>
          </div>
        </div>
      </section>
      {error && (
        <ProductState
          action={{
            label: "Tentar novamente",
            onClick: () => {
              setError(null);
              setRetryKey((value) => value + 1);
            },
          }}
          className="absolute inset-x-4 bottom-28 z-20 mx-auto max-w-lg sm:bottom-36"
          kind="stream-unavailable"
        >
          Tente novamente ou escolha outro conteúdo.
        </ProductState>
      )}
    </main>
  );
}
