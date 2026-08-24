import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import { LandingPage } from "../pages";
import { HomePage } from "../pages/app";
import { FavoritesPage } from "../pages/app/favorites";
import { MovieDetailsPage } from "../pages/app/movie-details";
import { MoviesPage } from "../pages/app/movies";
import { PlayerPage } from "../pages/app/player";
import { SeriesPage } from "../pages/app/series";
import { SeriesDetailsPage } from "../pages/app/series-details";
import { TvPage } from "../pages/app/tv";
import { OnboardingPage } from "../pages/onboarding";

const rootRoute = createRootRoute({ component: Outlet });
const landingRoute = createRoute({
  component: LandingPage,
  getParentRoute: () => rootRoute,
  path: "/",
});
const appRoute = createRoute({
  component: Outlet,
  getParentRoute: () => rootRoute,
  path: "app",
});
const homeRoute = createRoute({
  component: HomePage,
  getParentRoute: () => appRoute,
  path: "/",
});
const onboardingRoute = createRoute({
  component: OnboardingPage,
  getParentRoute: () => appRoute,
  path: "onboarding",
});
const tvRoute = createRoute({
  component: TvPage,
  getParentRoute: () => appRoute,
  path: "tv",
});
const livePlayerRoute = createRoute({
  component: () => <PlayerPage kind="live" />,
  getParentRoute: () => appRoute,
  path: "tv/$channelId/watch",
});
const moviesRoute = createRoute({
  component: MoviesPage,
  getParentRoute: () => appRoute,
  path: "movies",
});
const favoritesRoute = createRoute({
  component: FavoritesPage,
  getParentRoute: () => appRoute,
  path: "favorites",
});
const movieDetailsRoute = createRoute({
  component: MovieDetailsPage,
  getParentRoute: () => appRoute,
  path: "movies/$movieId",
});
const moviePlayerRoute = createRoute({
  component: () => <PlayerPage kind="movie" />,
  getParentRoute: () => appRoute,
  path: "movies/$movieId/watch",
});
const seriesRoute = createRoute({
  component: SeriesPage,
  getParentRoute: () => appRoute,
  path: "series",
});
const seriesDetailsRoute = createRoute({
  component: SeriesDetailsPage,
  getParentRoute: () => appRoute,
  path: "series/$seriesId",
});
const episodePlayerRoute = createRoute({
  component: () => <PlayerPage kind="episode" />,
  getParentRoute: () => appRoute,
  path: "series/$seriesId/episodes/$episodeId/watch",
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  appRoute.addChildren([
    homeRoute,
    onboardingRoute,
    tvRoute,
    livePlayerRoute,
    moviesRoute,
    favoritesRoute,
    movieDetailsRoute,
    moviePlayerRoute,
    seriesRoute,
    seriesDetailsRoute,
    episodePlayerRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
});
