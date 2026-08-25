import { useCallback, useEffect, useState } from "react";

const hiddenSeriesKey = "aura:hidden-next-episode-series";

function readHiddenSeries() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const value = JSON.parse(
      window.localStorage.getItem(hiddenSeriesKey) ?? "[]",
    );
    return new Set(
      Array.isArray(value)
        ? value.filter(
            (seriesId): seriesId is string => typeof seriesId === "string",
          )
        : [],
    );
  } catch {
    return new Set<string>();
  }
}

function writeHiddenSeries(seriesIds: Set<string>) {
  try {
    window.localStorage.setItem(
      hiddenSeriesKey,
      JSON.stringify([...seriesIds]),
    );
  } catch {
    // The preference remains active for the current session.
  }
}

export function useNextEpisodePreference(seriesId?: string) {
  const [hidden, setHidden] = useState(() =>
    seriesId ? readHiddenSeries().has(seriesId) : false,
  );

  useEffect(() => {
    setHidden(seriesId ? readHiddenSeries().has(seriesId) : false);
  }, [seriesId]);

  const hideForSeries = useCallback(() => {
    if (!seriesId) return;
    const hiddenSeries = readHiddenSeries();
    hiddenSeries.add(seriesId);
    writeHiddenSeries(hiddenSeries);
    setHidden(true);
  }, [seriesId]);

  return { hidden, hideForSeries };
}
