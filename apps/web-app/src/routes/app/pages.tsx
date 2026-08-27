import { HomePageSkeleton } from "@iptv/web-shared/components/catalog-skeleton";
import { type ComponentType, lazy, type ReactNode, Suspense } from "react";
import { MoviesPage as BrowserMoviesPage, SeriesPage as BrowserSeriesPage, TvPage as BrowserTvPage } from "../../pages/catalog";

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

export const HomePage = lazyPage(
  () =>
    import("@iptv/web-shared/pages/app").then(({ HomePage: page }) => ({
      default: page,
    })),
  <HomePageSkeleton onRetry={() => window.location.reload()} />,
);
export const FavoritesPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/favorites").then(
    ({ FavoritesPage: page }) => ({ default: page }),
  ),
);
export const FavoriteMoviesPage = lazyPage(async () => {
  const { FavoritesPage: Page } = await import(
    "@iptv/web-shared/pages/app/favorites"
  );
  return { default: () => <Page category="movie" /> };
});
export const FavoriteSeriesPage = lazyPage(async () => {
  const { FavoritesPage: Page } = await import(
    "@iptv/web-shared/pages/app/favorites"
  );
  return { default: () => <Page category="series" /> };
});
export const FavoriteChannelsPage = lazyPage(async () => {
  const { FavoritesPage: Page } = await import(
    "@iptv/web-shared/pages/app/favorites"
  );
  return { default: () => <Page category="channel" /> };
});
export const MoviesPage = BrowserMoviesPage;
export const MovieDetailsPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/movies/$movieId").then(
    ({ MovieDetailsPage: page }) => ({ default: page }),
  ),
);
export const MoviePlayerPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/movies/$movieId/watch").then(
    ({ MoviePlayerPage: page }) => ({ default: page }),
  ),
);
export const SeriesPage = BrowserSeriesPage;
export const SeriesDetailsPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/series/$seriesId").then(
    ({ SeriesDetailsPage: page }) => ({ default: page }),
  ),
);
export const EpisodePlayerPage = lazyPage(() =>
  import(
    "@iptv/web-shared/pages/app/series/$seriesId/episodes/$episodeId/watch"
  ).then(({ EpisodePlayerPage: page }) => ({ default: page })),
);
export const SettingsPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/settings").then(
    ({ SettingsPage: page }) => ({ default: page }),
  ),
);
export const SourcesPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/sources").then(
    ({ SourcesPage: page }) => ({ default: page }),
  ),
);
export const TvPage = BrowserTvPage;
export const LivePlayerPage = lazyPage(() =>
  import("@iptv/web-shared/pages/app/tv/$channelId/watch").then(
    ({ LivePlayerPage: page }) => ({ default: page }),
  ),
);
