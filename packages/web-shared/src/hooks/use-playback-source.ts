import { useEffect, useState } from "react";
import { resolveMediaUrl } from "../http/media-resolve";
import { getSharedRuntime } from "../runtime-config";

export function usePlaybackSource(
  url: string | undefined,
  shouldProxy: boolean,
) {
  const [source, setSource] = useState<string | undefined>();
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let cancelled = false;
    const useDirectSource = getSharedRuntime().mediaSourceMode === "direct";
    if (!url || !shouldProxy || useDirectSource) {
      setSource(url);
      setError(null);
      return;
    }
    setSource(undefined);
    setError(null);
    const sourcePromise = resolveMediaUrl(url);
    void sourcePromise
      .then(({ resolvedUrl }) => {
        if (!cancelled) setSource(resolvedUrl);
      })
      .catch((caught) => {
        if (!cancelled)
          setError(
            caught instanceof Error
              ? caught
              : new Error("Não foi possível preparar o stream."),
          );
      });
    return () => {
      cancelled = true;
    };
  }, [shouldProxy, url]);
  return {
    source,
    error,
    isLoading: Boolean(url && shouldProxy && !source && !error),
  };
}
