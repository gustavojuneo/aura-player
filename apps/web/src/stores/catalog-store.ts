import { create } from "zustand";
import type { CatalogItem, CatalogSeries } from "../features/catalog/catalog";

type CatalogDetails = {
  episodes: CatalogItem[];
  series?: CatalogSeries;
};

type CatalogStore = {
  itemById: Record<string, CatalogItem | undefined>;
  seriesDetailsById: Record<string, CatalogDetails | undefined>;
  setItem: (item: CatalogItem) => void;
  setSeriesDetails: (id: string, details: CatalogDetails) => void;
};

export const useCatalogStore = create<CatalogStore>((set) => ({
  itemById: {},
  seriesDetailsById: {},
  setItem: (item) =>
    set((state) => ({
      itemById: { ...state.itemById, [item.id]: item },
    })),
  setSeriesDetails: (id, details) =>
    set((state) => ({
      seriesDetailsById: { ...state.seriesDetailsById, [id]: details },
    })),
}));
