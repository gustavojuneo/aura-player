import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import { LandingPage } from "../pages";
import { HomePage } from "../pages/app";
import { FavoritesPage } from "../pages/app/favorites";
import { MoviesPage } from "../pages/app/movies";
import { MovieDetailsPage } from "../pages/app/movies/$movieId";
import { MoviePlayerPage } from "../pages/app/movies/$movieId/watch";
import { OnboardingPage } from "../pages/app/onboarding";
import { SeriesPage } from "../pages/app/series";
import { SeriesDetailsPage } from "../pages/app/series/$seriesId";
import { EpisodePlayerPage } from "../pages/app/series/$seriesId/episodes/$episodeId/watch";
import { SettingsPage } from "../pages/app/settings";
import { SourcesPage } from "../pages/app/sources";
import { TvPage } from "../pages/app/tv";
import { LivePlayerPage } from "../pages/app/tv/$channelId/watch";

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
  component: LivePlayerPage,
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
const favoriteMoviesRoute = createRoute({
  component: () => <FavoritesPage category="movie" />,
  getParentRoute: () => appRoute,
  path: "favorites/movies",
});
const favoriteSeriesRoute = createRoute({
  component: () => <FavoritesPage category="series" />,
  getParentRoute: () => appRoute,
  path: "favorites/series",
});
const favoriteChannelsRoute = createRoute({
  component: () => <FavoritesPage category="channel" />,
  getParentRoute: () => appRoute,
  path: "favorites/channels",
});
const sourcesRoute = createRoute({
  component: SourcesPage,
  getParentRoute: () => appRoute,
  path: "sources",
});
const settingsRoute = createRoute({
  component: SettingsPage,
  getParentRoute: () => appRoute,
  path: "settings",
});
const movieDetailsRoute = createRoute({
  component: MovieDetailsPage,
  getParentRoute: () => appRoute,
  path: "movies/$movieId",
});
const moviePlayerRoute = createRoute({
  component: MoviePlayerPage,
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
  component: EpisodePlayerPage,
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
    favoriteMoviesRoute,
    favoriteSeriesRoute,
    favoriteChannelsRoute,
    sourcesRoute,
    settingsRoute,
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
