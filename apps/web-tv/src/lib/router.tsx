import { HomePageSkeleton } from "@iptv/web-shared/components/catalog-skeleton";
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { type ComponentType, lazy, type ReactNode, Suspense } from "react";
import { AppLayout } from "../pages/app/layout";

function lazyPage(
  load: () => Promise<{ default: ComponentType }>,
  fallback: ReactNode = null,
) {
  const Page = lazy(load);
  return function LazyPage() {
    return (
      <Suspense fallback={fallback}>
        <Page />
      </Suspense>
    );
  };
}

const HomePage = lazyPage(
  () =>
    import("@iptv/web-shared/pages/app").then(({ HomePage: page }) => ({
      default: page,
    })),
  <HomePageSkeleton onRetry={() => window.location.reload()} />,
);
const FavoritesPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/favorites").then(
    ({ FavoritesPage: page }) => ({ default: page }),
  ),
);
const FavoriteMoviesPage = lazyPage(async () => {
  const { FavoritesPage: Page } = await import(
    "@iptv/web-shared/pages/app/favorites"
  );
  return { default: () => <Page category="movie" /> };
});
const FavoriteSeriesPage = lazyPage(async () => {
  const { FavoritesPage: Page } = await import(
    "@iptv/web-shared/pages/app/favorites"
  );
  return { default: () => <Page category="series" /> };
});
const FavoriteChannelsPage = lazyPage(async () => {
  const { FavoritesPage: Page } = await import(
    "@iptv/web-shared/pages/app/favorites"
  );
  return { default: () => <Page category="channel" /> };
});
const MoviesPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/movies").then(({ MoviesPage: page }) => ({
    default: page,
  })),
);
const MovieDetailsPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/movies/$movieId").then(
    ({ MovieDetailsPage: page }) => ({ default: page }),
  ),
);
const MoviePlayerPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/movies/$movieId/watch").then(
    ({ MoviePlayerPage: page }) => ({ default: page }),
  ),
);
const SeriesPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/series").then(({ SeriesPage: page }) => ({
    default: page,
  })),
);
const SeriesDetailsPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/series/$seriesId").then(
    ({ SeriesDetailsPage: page }) => ({ default: page }),
  ),
);
const EpisodePlayerPage = lazyPage(() =>
  import(
    "@iptv/web-shared/pages/app/series/$seriesId/episodes/$episodeId/watch"
  ).then(({ EpisodePlayerPage: page }) => ({ default: page })),
);
const SettingsPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/settings").then(
    ({ SettingsPage: page }) => ({ default: page }),
  ),
);
const SourcesPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/sources").then(
    ({ SourcesPage: page }) => ({ default: page }),
  ),
);
const TvPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/tv").then(({ TvPage: page }) => ({
    default: page,
  })),
);
const LivePlayerPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/tv/$channelId/watch").then(
    ({ LivePlayerPage: page }) => ({ default: page }),
  ),
);

const rootRoute = createRootRoute({ component: Outlet });
const appRoute = createRoute({
  component: AppLayout,
  getParentRoute: () => rootRoute,
  path: "app",
});
const homeRoute = createRoute({
  component: HomePage,
  getParentRoute: () => appRoute,
  path: "/",
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
  component: FavoriteMoviesPage,
  getParentRoute: () => appRoute,
  path: "favorites/movies",
});
const favoriteSeriesRoute = createRoute({
  component: FavoriteSeriesPage,
  getParentRoute: () => appRoute,
  path: "favorites/series",
});
const favoriteChannelsRoute = createRoute({
  component: FavoriteChannelsPage,
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

export const router = createRouter({
  history: createHashHistory(),
  routeTree: rootRoute.addChildren([
    appRoute.addChildren([
      homeRoute,
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
  ]),
});
