import { useEffect, useState } from "react";
import { env } from "../env";
import { createMediaTarget, resolveMediaUrl } from "../http/media-target";

export function usePlaybackSource(
  url: string | undefined,
  shouldProxy: boolean,
  resolveRedirect = false,
) {
  const [source, setSource] = useState<string | undefined>();
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let cancelled = false;
    const useDirectSource = env.VITE_DEVICE_TYPE === "tv";
    if (!url || !shouldProxy || useDirectSource) {
      setSource(url);
      setError(null);
      return;
    }
    setSource(undefined);
    setError(null);
    const sourcePromise = resolveRedirect
      ? resolveMediaUrl(url)
      : createMediaTarget(url).then(
          (targetId) => `${env.VITE_API_URL}/media/${targetId}`,
        );
    void sourcePromise
      .then((resolvedSource) => {
        if (!cancelled) setSource(resolvedSource);
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
  }, [resolveRedirect, shouldProxy, url]);
  return {
    source,
    error,
    isLoading: Boolean(url && shouldProxy && !source && !error),
  };
}
