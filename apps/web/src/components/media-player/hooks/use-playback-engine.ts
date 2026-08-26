import type Hls from "hls.js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaybackDescriptor } from "../../../features/playback/playback";
import type { PlaybackPreferences } from "../../../services/playback-preferences";
import type {
  PlaybackEngine,
  PlayerQuality,
  PlayerQualityOption,
  QualityEngine,
} from "../types";
import {
  AUTOMATIC_QUALITY_OPTION,
  qualityOptionsForHeights,
} from "../utils/player-utils";

type UsePlaybackEngineParams = {
  autoPlay: boolean;
  descriptor: PlaybackDescriptor;
  isLoading: boolean;
  preferences: PlaybackPreferences;
};

function destroyEngine(engine: PlaybackEngine, video: HTMLVideoElement) {
  if (engine && "detachMediaElement" in engine) {
    engine.pause();
    engine.unload();
    engine.detachMediaElement();
    engine.destroy();
  } else if (engine) void engine.destroy();
  video.pause();
  video.removeAttribute("src");
  video.load();
}

export function usePlaybackEngine({
  autoPlay,
  descriptor,
  isLoading,
  preferences,
}: UsePlaybackEngineParams) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const engineRef = useRef<PlaybackEngine>(null);
  const hlsEngineRef = useRef<Hls | null>(null);
  const qualityEngineRef = useRef<QualityEngine | null>(null);
  const sessionRef = useRef(0);
  const [currentTime, setCurrentTime] = useState(descriptor.position ?? 0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [quality, setQuality] = useState<PlayerQuality>("auto");
  const [qualityOptions, setQualityOptions] = useState<PlayerQualityOption[]>([
    AUTOMATIC_QUALITY_OPTION,
  ]);
  const [retryKey, setRetryKey] = useState(0);
  const [volume, setVolume] = useState(1);

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
    const streamUrl = descriptor.streamUrl;
    const session = ++sessionRef.current;
    const fail = () => {
      if (session === sessionRef.current)
        setError(
          "Não foi possível reproduzir este stream. Verifique a fonte, CORS e o codec.",
        );
    };
    const play = (start: () => Promise<void>) => {
      if (!autoPlay) return;
      video.muted = false;
      void start().catch(() => undefined);
    };
    destroyEngine(engineRef.current, video);
    engineRef.current = null;
    hlsEngineRef.current = null;
    qualityEngineRef.current = null;
    setIsReady(false);
    setError(null);
    setQuality("auto");
    setQualityOptions([AUTOMATIC_QUALITY_OPTION]);
    setIsMuted(false);
    video.muted = false;
    setCurrentTime(preferences.autoResume ? (descriptor.position ?? 0) : 0);
    setDuration(0);

    const nativeHlsSupported = Boolean(
      video.canPlayType("application/vnd.apple.mpegurl") ||
        video.canPlayType("application/x-mpegURL"),
    );

    if (descriptor.delivery === "hls" && nativeHlsSupported) {
      video.src = streamUrl;
      video.load();
      play(() => video.play());
    } else if (descriptor.delivery === "hls") {
      void import("hls.js")
        .then(({ default: Hls }) => {
          if (session !== sessionRef.current || !Hls.isSupported()) {
            if (!Hls.isSupported()) fail();
            return;
          }
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: descriptor.isLive,
          });
          engineRef.current = hls;
          hlsEngineRef.current = hls;
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
            if (
              preferences.autoResume &&
              descriptor.position &&
              !descriptor.isLive
            )
              video.currentTime = descriptor.position;
            play(() => video.play());
          });
          hls.attachMedia(video);
          hls.loadSource(streamUrl);
        })
        .catch(fail);
    } else if (descriptor.delivery === "mpeg-ts") {
      void import("mpegts.js")
        .then(({ default: mpegts }) => {
          if (session !== sessionRef.current || !mpegts.isSupported()) {
            if (!mpegts.isSupported()) fail();
            return;
          }
          const player = mpegts.createPlayer({
            type: "mpegts",
            isLive: descriptor.isLive,
            url: streamUrl,
          });
          engineRef.current = player;
          player.on(mpegts.Events.ERROR, fail);
          player.attachMediaElement(video);
          player.load();
          play(() => Promise.resolve(player.play()));
        })
        .catch(fail);
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
            setQuality: (selected) => {
              const tracks = player
                .getVariantTracks()
                .filter(
                  (track): track is typeof track & { height: number } =>
                    typeof track.height === "number" &&
                    Number.isFinite(track.height) &&
                    track.height > 0,
                );
              if (selected === "auto") {
                player.configure({ abr: { enabled: true } });
                return;
              }
              if (!tracks.length) return;
              const height = Number.parseInt(selected, 10);
              const track = tracks.reduce(
                (best, item) =>
                  Math.abs(item.height - height) <
                  Math.abs(best.height - height)
                    ? item
                    : best,
                tracks[0],
              );
              player.configure({ abr: { enabled: false } });
              player.selectVariantTrack(track, true);
            },
          };
          engineRef.current = player as unknown as PlaybackEngine;
          player.addEventListener("error", fail);
          void player
            .load(streamUrl)
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
    } else {
      video.src = streamUrl;
      play(() => video.play());
    }
    return () => {
      sessionRef.current += 1;
      destroyEngine(engineRef.current, video);
      engineRef.current = null;
      hlsEngineRef.current = null;
      qualityEngineRef.current = null;
    };
  }, [autoPlay, descriptor, isLoading, preferences.autoResume, retryKey]);

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
    const onVisibilityChange = () => {
      if (document.hidden) video.pause();
    };
    const onPageHide = () => {
      if (engineRef.current) {
        destroyEngine(engineRef.current, video);
        engineRef.current = null;
        qualityEngineRef.current = null;
      } else {
        video.pause();
      }
    };
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("loadedmetadata", onDurationChange);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("loadedmetadata", onDurationChange);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [attemptAutoplay]);

  useEffect(() => {
    if (isReady) qualityEngineRef.current?.setQuality(quality);
    const engine = hlsEngineRef.current;
    if (!engine || !isReady || !engine.levels.length) return;
    engine.currentLevel =
      quality === "auto"
        ? -1
        : engine.levels.reduce(
            (best, level, index, levels) =>
              Math.abs(level.height - Number.parseInt(quality, 10)) <
              Math.abs(levels[best].height - Number.parseInt(quality, 10))
                ? index
                : best,
            0,
          );
  }, [isReady, quality]);
  useEffect(() => {
    if (!autoPlay || isLoading) return;
    attemptAutoplay();
    const timer = window.setInterval(attemptAutoplay, 250);
    window.setTimeout(() => window.clearInterval(timer), 5000);
    return () => window.clearInterval(timer);
  }, [attemptAutoplay, autoPlay, isLoading]);

  const togglePlay = useCallback(() => {
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
  }, []);
  const seek = useCallback(
    (value: number) => {
      if (videoRef.current && duration > 0)
        videoRef.current.currentTime = value;
      setCurrentTime(value);
    },
    [duration],
  );
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    const muted = !isMuted;
    const nextVolume = !muted && volume === 0 ? 1 : volume;
    if (video) {
      video.muted = muted;
      video.volume = nextVolume;
    }
    setIsMuted(muted);
    setVolume(nextVolume);
  }, [isMuted, volume]);
  const changeVolume = useCallback((nextVolume: number) => {
    const video = videoRef.current;
    if (video) {
      video.muted = nextVolume === 0;
      video.volume = nextVolume;
    }
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
  }, []);
  const retry = useCallback(() => {
    setError(null);
    setRetryKey((value) => value + 1);
  }, []);

  return {
    changeVolume,
    currentTime,
    duration,
    error,
    isMuted,
    isPlaying,
    isReady,
    quality,
    qualityOptions,
    retry,
    seek,
    setQuality,
    toggleMute,
    togglePlay,
    videoRef,
    volume,
  };
}
