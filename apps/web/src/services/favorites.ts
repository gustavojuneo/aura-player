import { useEffect, useState } from "react";

export type FavoriteKind = "channel" | "movie" | "series";
export type Favorite = { id: string; kind: FavoriteKind };

const storageKey = "aura:favorites";
const initialFavorites: Favorite[] = [];

function notifyFavoritesChanged() {
  window.dispatchEvent(new Event("aura-favorites-change"));
}

function readFavorites(): Favorite[] {
  if (typeof window === "undefined") return initialFavorites;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return initialFavorites;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return initialFavorites;
    return parsed.filter(
      (item): item is Favorite =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        (item.kind === "channel" ||
          item.kind === "movie" ||
          item.kind === "series"),
    );
  } catch {
    return initialFavorites;
  }
}

function persistFavorites(favorites: Favorite[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(favorites));
  } catch {
    // Storage can be unavailable in private browsing or restricted embeds.
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(readFavorites);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    window.addEventListener("aura-favorites-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("aura-favorites-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isFavorite = (kind: FavoriteKind, id: string) =>
    favorites.some((favorite) => favorite.kind === kind && favorite.id === id);

  const toggleFavorite = (kind: FavoriteKind, id: string) => {
    const current = readFavorites();
    const exists = current.some(
      (favorite) => favorite.kind === kind && favorite.id === id,
    );
    const next = exists
      ? current.filter(
          (favorite) => !(favorite.kind === kind && favorite.id === id),
        )
      : [...current, { id, kind }];
    setFavorites(next);
    persistFavorites(next);
    notifyFavoritesChanged();
  };

  return { favorites, isFavorite, toggleFavorite };
}

export function clearFavorites() {
  try {
    window.localStorage.removeItem(storageKey);
    notifyFavoritesChanged();
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }
}
