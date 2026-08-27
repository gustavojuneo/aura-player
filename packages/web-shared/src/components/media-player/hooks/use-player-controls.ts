import { useEffect, useRef, useState } from "react";
import { getSharedRuntime } from "../../../runtime-config";
import type { PlayerAspectRatio } from "../../../utils/constants";

type UsePlayerControlsParams = {
  contentId: string;
  duration: number;
  hideControls: boolean;
  isLive: boolean;
  isPlaying: boolean;
  isReady: boolean;
  onChangeVolume: (value: number) => void;
  onSeek: (value: number) => void;
  onToggleMute: () => void;
  onTogglePlay: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
};

export function usePlayerControls({
  contentId,
  duration,
  hideControls,
  isLive,
  isReady,
  onChangeVolume,
  onSeek,
  onToggleMute,
  onTogglePlay,
  videoRef,
}: UsePlayerControlsParams) {
  const [aspectRatio, setAspectRatio] = useState<PlayerAspectRatio>("original");
  const [contentListOpen, setContentListOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [liveGuideOpen, setLiveGuideOpen] = useState(false);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [volumeShortcutValue, setVolumeShortcutValue] = useState<number | null>(
    null,
  );
  const hideTimerRef = useRef<number | null>(null);
  const seekTimerRef = useRef<number | null>(null);
  const pendingSeekRef = useRef(0);
  const seekPreviewRef = useRef<number | null>(null);
  const volumeShortcutTimerRef = useRef<number | null>(null);

  useEffect(() => {
    void contentId;
    pendingSeekRef.current = 0;
    seekPreviewRef.current = null;
    setSeekPreview(null);
    return () => {
      if (seekTimerRef.current !== null)
        window.clearTimeout(seekTimerRef.current);
    };
  }, [contentId]);

  const revealControls = (hideAfterMs = 5000, _forceHide = false) => {
    setControlsVisible(true);
    if (hideTimerRef.current !== null)
      window.clearTimeout(hideTimerRef.current);
    if (hideControls)
      hideTimerRef.current = window.setTimeout(() => {
        document
          .querySelector<HTMLElement>(
            '[data-player-primary-controls] button[aria-label="Reproduzir"], [data-player-primary-controls] button[aria-label="Pausar"]',
          )
          ?.focus({ preventScroll: true });
        setControlsVisible(false);
        setContentListOpen(false);
      }, hideAfterMs);
  };

  useEffect(() => {
    if (!hideControls) {
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
  }, [hideControls, revealControls]);

  const queueSeek = (
    delta: number,
    source: "button" | "keyboard" = "button",
  ) => {
    if (isLive || !isReady) return;
    const video = videoRef.current;
    if (!video) return;
    pendingSeekRef.current += delta;
    if (source === "keyboard") {
      const max =
        duration > 0
          ? duration
          : Number.isFinite(video.duration)
            ? video.duration
            : Number.POSITIVE_INFINITY;
      const preview = Math.min(
        max,
        Math.max(0, video.currentTime + pendingSeekRef.current),
      );
      seekPreviewRef.current = preview;
      setSeekPreview(preview);
    }
    if (seekTimerRef.current !== null)
      window.clearTimeout(seekTimerRef.current);
    seekTimerRef.current = window.setTimeout(() => {
      const currentVideo = videoRef.current;
      if (!currentVideo) return;
      const max =
        duration > 0
          ? duration
          : Number.isFinite(currentVideo.duration)
            ? currentVideo.duration
            : Number.POSITIVE_INFINITY;
      const time = Math.min(
        max,
        Math.max(0, currentVideo.currentTime + pendingSeekRef.current),
      );
      currentVideo.currentTime = time;
      pendingSeekRef.current = 0;
      seekPreviewRef.current = null;
      setSeekPreview(null);
      seekTimerRef.current = null;
    }, 400);
  };

  const toggleFullscreen = () => {
    const element = videoRef.current?.parentElement;
    if (
      element &&
      !document.fullscreenElement &&
      typeof element.requestFullscreen === "function"
    )
      void element.requestFullscreen();
    else if (
      document.fullscreenElement &&
      typeof document.exitFullscreen === "function"
    )
      void document.exitFullscreen();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (
        target.closest(
          "[data-player-content-list], [data-player-content-select-popup]",
        )
      ) {
        revealControls(5000, true);
        return;
      }
      const key = event.key.toLowerCase();
      const isShortcut =
        event.key === " " ||
        key === "k" ||
        event.key === "m" ||
        event.key === "f" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        (getSharedRuntime().showVolumeSlider &&
          (event.key === "ArrowUp" || event.key === "ArrowDown")) ||
        event.key === "Home" ||
        event.key === "End" ||
        /^[0-9]$/.test(event.key);
      if (isShortcut) revealControls();
      if (event.defaultPrevented) return;
      if (
        target.isContentEditable ||
        target.closest("button, input, select, textarea, a, [role=dialog]")
      )
        return;

      if (event.key === " " || key === "k") {
        event.preventDefault();
        onTogglePlay();
      } else if (event.key === "m") {
        event.preventDefault();
        onToggleMute();
      } else if (event.key === "f") {
        event.preventDefault();
        toggleFullscreen();
      } else if (!isLive && event.key === "ArrowLeft") {
        event.preventDefault();
        queueSeek(-5, "keyboard");
      } else if (!isLive && event.key === "ArrowRight") {
        event.preventDefault();
        queueSeek(5, "keyboard");
      } else if (
        getSharedRuntime().showVolumeSlider &&
        (event.key === "ArrowUp" || event.key === "ArrowDown")
      ) {
        const video = videoRef.current;
        if (!video) return;
        event.preventDefault();
        const nextVolume = Math.min(
          1,
          Math.max(0, video.volume + (event.key === "ArrowUp" ? 0.05 : -0.05)),
        );
        onChangeVolume(nextVolume);
        setVolumeShortcutValue(Math.round(nextVolume * 100));
        if (volumeShortcutTimerRef.current !== null)
          window.clearTimeout(volumeShortcutTimerRef.current);
        volumeShortcutTimerRef.current = window.setTimeout(
          () => setVolumeShortcutValue(null),
          900,
        );
      } else if (!isLive && event.key === "Home") {
        event.preventDefault();
        onSeek(0);
      } else if (!isLive && event.key === "End" && duration > 0) {
        event.preventDefault();
        onSeek(duration);
      } else if (!isLive && /^[0-9]$/.test(event.key) && duration > 0) {
        event.preventDefault();
        onSeek((Number(event.key) / 10) * duration);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (volumeShortcutTimerRef.current !== null)
        window.clearTimeout(volumeShortcutTimerRef.current);
    };
  }, [
    duration,
    isLive,
    onChangeVolume,
    onSeek,
    onToggleMute,
    onTogglePlay,
    queueSeek,
    revealControls,
    toggleFullscreen,
    videoRef,
  ]);

  return {
    aspectRatio,
    contentListOpen,
    controlsVisible,
    liveGuideOpen,
    seekPreview,
    queueSeek,
    revealControls,
    setAspectRatio,
    setContentListOpen,
    setLiveGuideOpen,
    setSettingsOpen,
    settingsOpen,
    toggleFullscreen,
    volumeShortcutValue,
  };
}
