import { useEffect, useState } from "react";
import { z } from "zod";

export const playbackPreferencesSchema = z.object({
  autoResume: z.boolean(),
  autoNextEpisode: z.boolean(),
  hideControls: z.boolean(),
  reduceMotion: z.boolean(),
  quality: z.enum(["auto", "720p", "1080p"]),
  previewMuted: z.boolean(),
});

export type PlaybackPreferences = z.infer<typeof playbackPreferencesSchema>;

export const defaultPlaybackPreferences: PlaybackPreferences = {
  autoResume: true,
  autoNextEpisode: true,
  hideControls: true,
  reduceMotion: false,
  quality: "auto",
  previewMuted: true,
};

export const playbackPreferencesKey = "aura:playback-preferences";

function readPreferences(): PlaybackPreferences {
  if (typeof window === "undefined") return defaultPlaybackPreferences;
  try {
    const raw = window.localStorage.getItem(playbackPreferencesKey);
    if (!raw) return defaultPlaybackPreferences;
    const result = playbackPreferencesSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : defaultPlaybackPreferences;
  } catch {
    return defaultPlaybackPreferences;
  }
}

export function usePlaybackPreferences() {
  const [preferences, setPreferences] = useState(readPreferences);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        playbackPreferencesKey,
        JSON.stringify(preferences),
      );
    } catch {
      // Preferences remain available for the current session.
    }
  }, [preferences]);

  const updatePreference = <K extends keyof PlaybackPreferences>(
    key: K,
    value: PlaybackPreferences[K],
  ) => setPreferences((current) => ({ ...current, [key]: value }));

  return { preferences, updatePreference };
}

export function clearPlaybackPreferences() {
  try {
    window.localStorage.removeItem(playbackPreferencesKey);
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }
}
