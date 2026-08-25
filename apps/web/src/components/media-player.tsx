import Hls from "hls.js";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Expand,
  ListVideo,
  LoaderCircle,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import mpegts from "mpegts.js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaybackDescriptor } from "../features/playback/playback";
import { formatPlaybackTime } from "../features/playback/playback";
import { usePlaybackPreferences } from "../services/playback-preferences";
import { ProductState } from "./ui";

type MediaPlayerProps = {
  autoPlay?: boolean;
  descriptor: PlaybackDescriptor;
  isLoading?: boolean;
  onBack: () => void;
};

type Engine =
  | Hls
  | mpegts.Player
  | { destroy: () => Promise<void> | void }
  | null;

function ControlButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="grid size-7 place-items-center rounded-md text-text transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-focus sm:size-8"
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
}: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const engineRef = useRef<Engine>(null);
  const sessionRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(descriptor.position ?? 0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<number | null>(null);
  const { preferences } = usePlaybackPreferences();

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
      video.pause();
      video.removeAttribute("src");
      video.load();
    };

    cleanEngine();
    setIsReady(false);
    setError(null);
    setIsMuted(false);
    video.muted = false;
    setCurrentTime(preferences.autoResume ? (descriptor.position ?? 0) : 0);
    setDuration(0);

    const play = (start: () => Promise<void>) => {
      void start().catch(() => {
        if (!autoPlay) return;
        video.muted = true;
        setIsMuted(true);
        void start().catch(() => undefined);
      });
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
          engineRef.current = player as unknown as Engine;
          player.addEventListener("error", fail);
          void player
            .load(url)
            .then(() => {
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
    const onCanPlay = () => setIsReady(true);
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
  }, []);

  const playerLoading = isLoading || !isReady;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
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

  return (
    <main
      className={`relative flex h-dvh min-h-[560px] w-full flex-col overflow-hidden bg-[#080806] text-text ${preferences.reduceMotion ? "[&_button]:transition-none" : ""}`}
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
        className="absolute inset-0 size-full object-cover"
        playsInline
        ref={videoRef}
      >
        <track
          kind="captions"
          label="Português"
          src="data:text/vtt,WEBVTT"
          srcLang="pt-BR"
        />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/90" />
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

      <button
        aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        className={`absolute left-1/2 top-1/2 z-10 grid size-[88px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-[#171510CC] text-text focus-visible:outline-2 focus-visible:outline-focus ${controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"} ${playerLoading ? "cursor-wait" : ""} ${preferences.reduceMotion ? "transition-none" : "transition-opacity hover:scale-105"}`}
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

      <section
        aria-label="Controles de reprodução"
        className={`relative z-10 mt-auto flex flex-col gap-3 px-5 pb-7 sm:gap-[18px] sm:px-[42px] sm:pb-[38px] ${controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"} ${preferences.reduceMotion ? "transition-none" : "transition-opacity"}`}
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
            <ControlButton
              label={isMuted ? "Ativar som" : "Silenciar"}
              onClick={() => {
                if (videoRef.current)
                  videoRef.current.muted = !videoRef.current.muted;
                setIsMuted((value) => !value);
              }}
            >
              {isMuted ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </ControlButton>
            <span className="hidden text-[11px] text-muted sm:inline">
              {descriptor.isLive
                ? "AO VIVO"
                : `${formatPlaybackTime(currentTime)} / ${formatPlaybackTime(duration)}`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {!descriptor.isLive && (
              <>
                <ControlButton
                  label="Conteúdo anterior"
                  onClick={() => undefined}
                >
                  <ChevronLeft className="size-4" />
                </ControlButton>
                <ControlButton
                  label="Próximo conteúdo"
                  onClick={() => undefined}
                >
                  <ChevronRight className="size-4" />
                </ControlButton>
              </>
            )}
            <ControlButton label="Lista de conteúdo" onClick={() => undefined}>
              <ListVideo className="size-4" />
            </ControlButton>
            <ControlButton label="Configurações" onClick={() => undefined}>
              <Settings className="size-4" />
            </ControlButton>
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
