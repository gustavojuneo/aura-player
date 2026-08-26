import { useEffect } from "react";
import { clearCatalogMemory } from "../services/catalog-db";
import { clearCatalogDataCaches } from "./use-catalog-data";

export function useAppLifecycle() {
  useEffect(() => {
    const handlePageHide = () => {
      clearCatalogMemory();
      clearCatalogDataCaches();
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);
}
