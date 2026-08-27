import { useEffect, useState } from "react";

export type PlaybackProgress = {
  contentId: string;
  mediaType: "movie" | "episode";
  seriesId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  positionSecs: number;
  durationSecs: number;
  updatedAt: number;
};

export type WatchedEpisode = {
  seriesId: string;
  episodeKey: string;
  watchedAt: number;
};

const progressKey = "aura:playback-progress";
const watchedKey = "aura:watched-episodes";
const eventName = "aura-playback-progress-change";
const maxMovies = 5;
const ttlMs = 15 * 24 * 60 * 60 * 1000;

function read<T>(key: string, fallback: T): T {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    return parsed === null ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* local storage unavailable */
  }
}

function validProgress(value: unknown): value is PlaybackProgress {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.contentId === "string" &&
    (item.mediaType === "movie" || item.mediaType === "episode") &&
    typeof item.positionSecs === "number" &&
    typeof item.durationSecs === "number" &&
    typeof item.updatedAt === "number"
  );
}

export function loadPlaybackProgress(): PlaybackProgress[] {
  const now = Date.now();
  const current = read<unknown[]>(progressKey, []).filter(validProgress);
  const active = current.filter((item) => now - item.updatedAt < ttlMs);
  if (active.length !== current.length) write(progressKey, active);
  return active.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function selectContinueWatchingProgress(
  progressList: PlaybackProgress[],
): PlaybackProgress[] {
  const seenSeries = new Set<string>();

  return progressList.filter((progress) => {
    if (progress.mediaType !== "episode" || !progress.seriesId) return true;
    if (seenSeries.has(progress.seriesId)) return false;

    seenSeries.add(progress.seriesId);
    return true;
  });
}

export function loadContinueWatchingProgress(): PlaybackProgress[] {
  return selectContinueWatchingProgress(loadPlaybackProgress());
}

export function savePlaybackProgress(progress: PlaybackProgress) {
  const current = loadPlaybackProgress().filter(
    (item) => item.contentId !== progress.contentId,
  );
  const movies = [progress, ...current]
    .filter((item) => item.mediaType === "movie")
    .slice(0, maxMovies);
  const episodes = [progress, ...current].filter(
    (item) => item.mediaType === "episode",
  );
  write(progressKey, [...movies, ...episodes]);
  window.dispatchEvent(new Event(eventName));
}

export function removePlaybackProgress(contentId: string) {
  const next = loadPlaybackProgress().filter(
    (item) => item.contentId !== contentId,
  );
  write(progressKey, next);
  window.dispatchEvent(new Event(eventName));
}

export function markEpisodeWatched(seriesId: string, episodeKey: string) {
  const current = read<WatchedEpisode[]>(watchedKey, []).filter(
    (item) => item.seriesId !== seriesId || item.episodeKey !== episodeKey,
  );
  write(watchedKey, [
    { seriesId, episodeKey, watchedAt: Date.now() },
    ...current,
  ]);
  window.dispatchEvent(new Event(eventName));
}

export function loadWatchedEpisodes(seriesId?: string) {
  const current = read<WatchedEpisode[]>(watchedKey, []);
  return seriesId
    ? current.filter((item) => item.seriesId === seriesId)
    : current;
}

export function usePlaybackProgress() {
  const [progress, setProgress] =
    useState<PlaybackProgress[]>(loadPlaybackProgress);
  useEffect(() => {
    const sync = () => setProgress(loadPlaybackProgress());
    window.addEventListener(eventName, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(eventName, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return progress;
}

export function clearPlaybackProgress() {
  write(progressKey, []);
  write(watchedKey, []);
  window.dispatchEvent(new Event(eventName));
}

export { eventName as playbackProgressEvent };
