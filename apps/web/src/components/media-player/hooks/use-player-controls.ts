import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerAspectRatio } from "../../../utils/constants";

type UsePlayerControlsParams = {
  contentId: string;
  duration: number;
  hideControls: boolean;
  isLive: boolean;
  isPlaying: boolean;
  isReady: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
};

export function usePlayerControls({
  contentId,
  duration,
  hideControls,
  isLive,
  isPlaying,
  isReady,
  videoRef,
}: UsePlayerControlsParams) {
  const [aspectRatio, setAspectRatio] = useState<PlayerAspectRatio>("original");
  const [contentListOpen, setContentListOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [liveGuideOpen, setLiveGuideOpen] = useState(false);
  const [pendingSeek, setPendingSeek] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const seekTimerRef = useRef<number | null>(null);
  const pendingSeekRef = useRef(0);

  useEffect(() => {
    void contentId;
    pendingSeekRef.current = 0;
    setPendingSeek(0);
    return () => {
      if (seekTimerRef.current !== null)
        window.clearTimeout(seekTimerRef.current);
    };
  }, [contentId]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current !== null)
      window.clearTimeout(hideTimerRef.current);
    if (hideControls && isPlaying)
      hideTimerRef.current = window.setTimeout(
        () => setControlsVisible(false),
        3000,
      );
  }, [hideControls, isPlaying]);

  useEffect(() => {
    if (!hideControls || !isPlaying) {
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
  }, [hideControls, isPlaying, revealControls]);

  const queueSeek = useCallback(
    (delta: number) => {
      if (isLive || !isReady) return;
      pendingSeekRef.current += delta;
      setPendingSeek(pendingSeekRef.current);
      if (seekTimerRef.current !== null)
        window.clearTimeout(seekTimerRef.current);
      seekTimerRef.current = window.setTimeout(() => {
        const video = videoRef.current;
        if (!video) return;
        const max =
          duration > 0
            ? duration
            : Number.isFinite(video.duration)
              ? video.duration
              : Number.POSITIVE_INFINITY;
        const time = Math.min(
          max,
          Math.max(0, video.currentTime + pendingSeekRef.current),
        );
        video.currentTime = time;
        pendingSeekRef.current = 0;
        setPendingSeek(0);
        seekTimerRef.current = null;
      }, 400);
    },
    [duration, isLive, isReady, videoRef],
  );

  const toggleFullscreen = useCallback(() => {
    const element = videoRef.current?.parentElement;
    if (element && !document.fullscreenElement)
      void element.requestFullscreen();
    else if (document.fullscreenElement) void document.exitFullscreen();
  }, [videoRef]);

  return {
    aspectRatio,
    contentListOpen,
    controlsVisible,
    liveGuideOpen,
    pendingSeek,
    queueSeek,
    revealControls,
    setAspectRatio,
    setContentListOpen,
    setLiveGuideOpen,
    setSettingsOpen,
    settingsOpen,
    toggleFullscreen,
  };
}
