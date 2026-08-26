import { useCallback, useEffect, useRef, useState } from "react";

type UseNextEpisodeCountdownParams = {
  contentId: string;
  currentTime: number;
  duration: number;
  enabled: boolean;
  isLive: boolean;
  isLoading: boolean;
  isReady: boolean;
  onNext?: () => void;
};

export function useNextEpisodeCountdown({
  contentId,
  currentTime,
  duration,
  enabled,
  isLive,
  isLoading,
  isReady,
  onNext,
}: UseNextEpisodeCountdownParams) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const startTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const countdownValueRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const clear = useCallback(() => {
    if (startTimerRef.current !== null)
      window.clearTimeout(startTimerRef.current);
    if (countdownTimerRef.current !== null)
      window.clearInterval(countdownTimerRef.current);
    startTimerRef.current = null;
    countdownTimerRef.current = null;
    countdownValueRef.current = null;
    setCountdown(null);
  }, []);

  useEffect(() => {
    void contentId;
    startedRef.current = false;
    clear();
    return clear;
  }, [clear, contentId]);

  useEffect(() => {
    if (
      !enabled ||
      isLive ||
      duration <= 0 ||
      !isReady ||
      isLoading ||
      startedRef.current
    ) {
      if (!isReady || isLoading) clear();
      return;
    }
    const remaining = duration - currentTime;
    if (remaining <= 0) return;
    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      countdownValueRef.current = 20;
      setCountdown(20);
      countdownTimerRef.current = window.setInterval(() => {
        const value = countdownValueRef.current;
        if (value === null) return;
        if (value <= 1) {
          clear();
          onNext?.();
          return;
        }
        countdownValueRef.current = value - 1;
        setCountdown(value - 1);
      }, 1000);
    };
    if (remaining <= 60) start();
    else
      startTimerRef.current = window.setTimeout(start, (remaining - 60) * 1000);
    return () => {
      if (startTimerRef.current !== null)
        window.clearTimeout(startTimerRef.current);
    };
  }, [
    clear,
    currentTime,
    duration,
    enabled,
    isLive,
    isLoading,
    isReady,
    onNext,
  ]);

  return { clearNextEpisode: clear, nextEpisodeCountdown: countdown };
}
