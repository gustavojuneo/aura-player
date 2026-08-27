import { type AnyRoute, createRoute } from "@tanstack/react-router";
import {
  EpisodePlayerPage,
  LivePlayerPage,
  MovieDetailsPage,
  MoviePlayerPage,
  MoviesPage,
  SeriesDetailsPage,
  SeriesPage,
  TvPage,
} from "./pages";

export function createCatalogRoutes(parentRoute: AnyRoute) {
  const tvRoute = createRoute({
    component: TvPage,
    getParentRoute: () => parentRoute,
    path: "tv",
  });
  const livePlayerRoute = createRoute({
    component: LivePlayerPage,
    getParentRoute: () => parentRoute,
    path: "tv/$channelId/watch",
  });
  const moviesRoute = createRoute({
    component: MoviesPage,
    getParentRoute: () => parentRoute,
    path: "movies",
  });
  const movieDetailsRoute = createRoute({
    component: MovieDetailsPage,
    getParentRoute: () => parentRoute,
    path: "movies/$movieId",
  });
  const moviePlayerRoute = createRoute({
    component: MoviePlayerPage,
    getParentRoute: () => parentRoute,
    path: "movies/$movieId/watch",
  });
  const seriesRoute = createRoute({
    component: SeriesPage,
    getParentRoute: () => parentRoute,
    path: "series",
  });
  const seriesDetailsRoute = createRoute({
    component: SeriesDetailsPage,
    getParentRoute: () => parentRoute,
    path: "series/$seriesId",
  });
  const episodePlayerRoute = createRoute({
    component: EpisodePlayerPage,
    getParentRoute: () => parentRoute,
    path: "series/$seriesId/episodes/$episodeId/watch",
  });

  return [
    tvRoute,
    livePlayerRoute,
    moviesRoute,
    movieDetailsRoute,
    moviePlayerRoute,
    seriesRoute,
    seriesDetailsRoute,
    episodePlayerRoute,
  ] as const;
}
