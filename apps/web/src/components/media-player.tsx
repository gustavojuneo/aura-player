import Hls from "hls.js";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Expand,
  ListVideo,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import mpegts from "mpegts.js";
import { useEffect, useRef, useState } from "react";
import type { PlaybackDescriptor } from "../features/playback/playback";
import { formatPlaybackTime } from "../features/playback/playback";

type MediaPlayerProps = {
  descriptor: PlaybackDescriptor;
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

export function MediaPlayer({ descriptor, onBack }: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const engineRef = useRef<Engine>(null);
  const sessionRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(descriptor.position ?? 0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !descriptor.streamUrl) {
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
    setError(null);
    setCurrentTime(descriptor.position ?? 0);
    setDuration(0);

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
        if (descriptor.position && !descriptor.isLive)
          video.currentTime = descriptor.position;
        void video.play().catch(() => undefined);
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
      void Promise.resolve(player.play()).catch(() => undefined);
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
              if (descriptor.position && !descriptor.isLive)
                video.currentTime = descriptor.position;
              return video.play();
            })
            .catch(fail);
        })
        .catch(fail);
    } else if (
      descriptor.delivery === "hls" &&
      video.canPlayType("application/vnd.apple.mpegurl")
    ) {
      video.src = url;
      void video.play().catch(() => undefined);
    } else {
      video.src = url;
      void video.play().catch(() => undefined);
    }

    return () => {
      sessionRef.current += 1;
      cleanEngine();
    };
  }, [descriptor]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () =>
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () =>
      setError("O navegador não conseguiu decodificar este formato ou codec.");
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("loadedmetadata", onDurationChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("loadedmetadata", onDurationChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
    };
  }, []);

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
    <main className="relative flex h-dvh min-h-[560px] w-full flex-col overflow-hidden bg-[#080806] text-text">
      <video
        aria-label={descriptor.title}
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
      <header className="relative z-10 flex items-start justify-between px-5 pt-6 sm:px-9 sm:pt-7">
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
          <span className="rounded-full bg-live px-2.5 py-1 text-[9px] font-extrabold tracking-[0.08em] text-text">
            ● AO VIVO
          </span>
        )}
      </header>

      <button
        aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        className="absolute left-1/2 top-1/2 z-10 grid size-[88px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-[#171510CC] text-text transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-focus"
        onClick={togglePlay}
        type="button"
      >
        {isPlaying ? (
          <Pause className="size-8" />
        ) : (
          <Play className="ml-1 size-8 fill-current" />
        )}
      </button>

      <section
        aria-label="Controles de reprodução"
        className="relative z-10 mt-auto flex flex-col gap-3 px-5 pb-7 sm:gap-[18px] sm:px-[42px] sm:pb-[38px]"
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
        <div className="absolute inset-x-4 bottom-28 z-20 mx-auto max-w-lg rounded-xl border border-danger/60 bg-danger-surface/95 p-4 text-center text-xs text-danger-strong sm:bottom-36">
          {error}
        </div>
      )}
    </main>
  );
}
