import { type AnyRoute, createRoute } from "@tanstack/react-router";
import {
  FavoriteChannelsPage,
  FavoriteMoviesPage,
  FavoriteSeriesPage,
  FavoritesPage,
} from "./pages";

export function createFavoriteRoutes(parentRoute: AnyRoute) {
  const favoritesRoute = createRoute({
    component: FavoritesPage,
    getParentRoute: () => parentRoute,
    path: "favorites",
  });
  const favoriteMoviesRoute = createRoute({
    component: FavoriteMoviesPage,
    getParentRoute: () => parentRoute,
    path: "favorites/movies",
  });
  const favoriteSeriesRoute = createRoute({
    component: FavoriteSeriesPage,
    getParentRoute: () => parentRoute,
    path: "favorites/series",
  });
  const favoriteChannelsRoute = createRoute({
    component: FavoriteChannelsPage,
    getParentRoute: () => parentRoute,
    path: "favorites/channels",
  });

  return [
    favoritesRoute,
    favoriteMoviesRoute,
    favoriteSeriesRoute,
    favoriteChannelsRoute,
  ] as const;
}
