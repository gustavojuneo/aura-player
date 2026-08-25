import { useEffect, useState } from "react";
import { env } from "../env";
import { createMediaTarget } from "../http/media-target";

export function usePlaybackSource(
  url: string | undefined,
  shouldProxy: boolean,
) {
  const [source, setSource] = useState<string | undefined>();
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!url || !shouldProxy) {
      setSource(url);
      setError(null);
      return;
    }
    setSource(undefined);
    setError(null);
    void createMediaTarget(url)
      .then((targetId) => {
        if (!cancelled) setSource(`${env.VITE_API_URL}/media/${targetId}`);
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
