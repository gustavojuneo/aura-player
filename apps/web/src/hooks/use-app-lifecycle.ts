import { useCallback, useEffect } from "react";
import { clearCatalogMemory, getActiveSourceId } from "../services/catalog-db";
import {
  loadCatalogSources,
  refreshCatalogSource,
  setAppStartupLoading,
} from "../services/catalog-service";
import { clearCatalogDataCaches } from "./use-catalog-data";

let hasInitializedApp = false;

export function useAppLifecycle() {
  const refreshActiveSource = useCallback(async () => {
    const sources = await loadCatalogSources();
    const activeSourceId = getActiveSourceId();
    const activeSource = sources.find((source) => source.id === activeSourceId);
    if (activeSource) await refreshCatalogSource(activeSource);
  }, []);

  useEffect(() => {
    const handlePageHide = () => {
      clearCatalogMemory();
      clearCatalogDataCaches();
    };
    window.addEventListener("pagehide", handlePageHide);
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void refreshActiveSource().catch(() => undefined);
    };
    window.addEventListener("pageshow", handlePageShow);
    if (!hasInitializedApp) {
      hasInitializedApp = true;
      setAppStartupLoading(true);
      void refreshActiveSource()
        .catch(() => undefined)
        .finally(() => setAppStartupLoading(false));
    }
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [refreshActiveSource]);
}
