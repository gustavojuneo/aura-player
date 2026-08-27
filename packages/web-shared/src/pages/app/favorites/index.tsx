import { Link, useNavigate } from "@tanstack/react-router";
import { HeartOff, Menu, Radio } from "lucide-react";
import { useState } from "react";
import { Carousel } from "../../../components/carousel";
import { FavoriteButton } from "../../../components/favorite-button";
import {
  Button,
  ProgressBar,
  Skeleton,
  VirtualizedGrid,
} from "../../../components/ui";
import type {
  CatalogItem,
  CatalogSeries,
} from "../../../features/catalog/catalog";
import {
  useCatalogItems,
  useCatalogSeries,
  useXtreamEpg,
} from "../../../hooks/use-catalog-data";
import { useInfiniteCatalog } from "../../../hooks/use-infinite-catalog";
import { appRoute } from "../../../runtime-config";
import {
  type Favorite,
  type FavoriteKind,
  useFavorites,
} from "../../../services/favorites";
import { markPlaybackNavigation } from "../../../services/playback-autoplay";

const favoriteRoutes = {
  channel: "/favorites/channels",
  movie: "/favorites/movies",
  series: "/favorites/series",
} as const;

function newestFavorites<T extends { id: string }>(
  items: T[],
  favorites: Favorite[],
  kind: FavoriteKind,
) {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  return favorites
    .filter((favorite) => favorite.kind === kind)
    .slice()
    .reverse()
    .flatMap((favorite) => {
      const item = itemsById.get(favorite.id);
      return item ? [item] : [];
    });
}

function EmptyFavorites({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="flex min-h-[560px] flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
      <span className="grid size-[72px] place-items-center rounded-full bg-[#3a2b16]">
        <HeartOff aria-hidden="true" className="size-[30px] text-gold-bright" />
      </span>
      <h2 className="m-0 font-display text-xl font-bold text-text">
        Você ainda não tem favoritos
      </h2>
      <p className="m-0 max-w-[440px] text-[0.8125rem] font-medium leading-[1.45] text-muted">
        Salve canais, filmes e séries para encontrar tudo rapidamente aqui.
      </p>
      <Button className="mt-1" onClick={onExplore} variant="secondary">
        Explorar conteúdos
      </Button>
    </div>
  );
}

function FavoritesSkeleton({ category }: { category?: FavoriteKind }) {
  const kinds: FavoriteKind[] = category
    ? [category]
    : ["movie", "series", "channel"];
  return (
    <div
      aria-label="Carregando favoritos"
      className="flex flex-col gap-7"
      role="status"
    >
      {kinds.map((kind) => (
        <section className="flex flex-col gap-3" key={kind}>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          {kind === "channel" ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map((index) => (
                <div
                  className="flex h-[70px] items-center gap-3 rounded-[10px] border border-line bg-panel p-2.5"
                  key={`favorite-channel-skeleton-${index}`}
                >
                  <Skeleton className="size-[46px] shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="mt-2 h-3 w-1/4" />
                  </div>
                  <Skeleton className="size-9 shrink-0 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-w-0 flex-nowrap gap-3 overflow-hidden">
              {[0, 1, 2, 3].map((index) => (
                <Skeleton
                  className="h-[230px] w-[calc((100%-36px)/4)] min-w-[180px] shrink-0 rounded-xl"
                  key={`favorite-media-skeleton-${kind}-${index}`}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function SectionControls({
  expanded,
  onViewAll,
  onToggleExpanded,
  showMore = true,
}: {
  expanded: boolean;
  onViewAll?: () => void;
  onToggleExpanded: () => void;
  showMore?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {showMore && (
        <Button
          className="h-8 rounded-lg px-3 text-xs"
          onClick={onViewAll ?? onToggleExpanded}
          variant="text"
        >
          {expanded ? "Ver menos" : "Ver mais"}
        </Button>
      )}
    </div>
  );
}

function ChannelList({
  channels,
  carousel = false,
  grid = false,
  onToggle,
}: {
  channels: CatalogItem[];
  carousel?: boolean;
  grid?: boolean;
  onToggle: (kind: FavoriteKind, id: string) => void;
}) {
  return (
    <div
      className={
        grid && carousel
          ? "flex min-w-max flex-nowrap gap-3"
          : grid
            ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "flex flex-col gap-2"
      }
      data-tv-navigation-region={grid && !carousel ? "catalog-grid" : undefined}
    >
      {channels.map((channel) => (
        <FavoriteChannelCard
          channel={channel}
          carousel={carousel}
          grid={grid}
          key={channel.id}
          onToggle={() => onToggle("channel", channel.id)}
        />
      ))}
    </div>
  );
}

function FavoriteChannelCard({
  channel,
  carousel,
  grid,
  onToggle,
}: {
  channel: CatalogItem;
  carousel: boolean;
  grid: boolean;
  onToggle: () => void;
}) {
  const epg = useXtreamEpg(channel.sourceId, channel.providerId, channel.title);
  const currentProgram = (epg.data ?? []).find((program) => {
    const start = Date.parse(program.start);
    const stop = Date.parse(program.stop);
    const now = Date.now();
    return (
      Number.isFinite(start) &&
      Number.isFinite(stop) &&
      start <= now &&
      now < stop
    );
  });
  const formatProgramTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "--:--"
      : new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
  };
  const programProgress = currentProgram
    ? Math.round(
        ((Date.now() - Date.parse(currentProgram.start)) /
          (Date.parse(currentProgram.stop) -
            Date.parse(currentProgram.start))) *
          100,
      )
    : 0;
  return (
    <div
      className={
        grid && carousel
          ? "relative flex min-h-[126px] w-[220px] min-w-[220px] cursor-pointer flex-col gap-2 rounded-[10px] border border-line bg-panel p-3 transition-colors hover:border-gold/60"
          : grid
            ? "relative flex min-h-[126px] min-w-0 cursor-pointer flex-col gap-2 rounded-[10px] border border-line bg-panel p-3 transition-colors hover:border-gold/60"
            : "flex min-w-0 cursor-pointer items-center gap-3 rounded-[10px] border border-line bg-panel p-2.5 transition-colors hover:border-gold/60"
      }
    >
      <Link
        aria-label={`Assistir ${channel.title}`}
        className="absolute inset-0 z-0 rounded-[10px] focus-visible:outline-2 focus-visible:outline-focus"
        onClick={() => {
          markPlaybackNavigation();
        }}
        params={{ channelId: channel.id } as never}
        to={appRoute("/tv/$channelId/watch") as never}
      />
      <span className="relative z-10 grid size-[46px] shrink-0 place-items-center overflow-hidden rounded-lg bg-panel-2 text-muted">
        {channel.logoUrl ? (
          <img
            alt=""
            className="size-full object-cover"
            src={channel.logoUrl}
          />
        ) : (
          <Radio aria-hidden="true" className="size-5" />
        )}
      </span>
      <span className="relative z-10 min-w-0 flex-1">
        <strong className="block truncate text-sm font-bold text-text">
          {channel.title}
        </strong>
        {epg.isLoading ? (
          <span className="mt-1 block truncate text-[0.6875rem] text-muted">
            Carregando programação...
          </span>
        ) : currentProgram ? (
          <span className="mt-1 block min-w-0">
            <span className="block truncate text-[0.6875rem] text-muted">
              <strong className="font-extrabold text-gold-bright">
                AGORA:
              </strong>{" "}
              {currentProgram.title}
            </span>
            <span className="mt-1 block text-[0.625rem] text-muted">
              {formatProgramTime(currentProgram.start)} –{" "}
              {formatProgramTime(currentProgram.stop)}
            </span>
            <ProgressBar className="mt-1 h-1" value={programProgress} />
          </span>
        ) : (
          <span className="mt-1 block truncate text-[0.6875rem] text-muted">
            {channel.groupTitle ?? channel.categories?.[0] ?? "Ao vivo"}
          </span>
        )}
      </span>
      <span className={grid ? "absolute top-3 right-3 z-10" : "relative z-10"}>
        <FavoriteButton
          active
          label={`Remover ${channel.title} dos favoritos`}
          onToggle={onToggle}
        />
      </span>
    </div>
  );
}

function MediaGrid({
  kind,
  items,
  onToggle,
  carousel = true,
}: {
  kind: "movie" | "series";
  items: Array<CatalogItem | CatalogSeries>;
  onToggle: (kind: FavoriteKind, id: string) => void;
  carousel?: boolean;
}) {
  const media = items.map((item) =>
    kind === "movie"
      ? {
          id: item.id,
          imageUrl: (item as CatalogItem).logoUrl,
          meta: (item as CatalogItem).year
            ? String((item as CatalogItem).year)
            : "Filme",
          title: item.title,
        }
      : {
          id: item.id,
          imageUrl: (item as CatalogSeries).posterUrl,
          meta: `${(item as CatalogSeries).seasonCount} ${(item as CatalogSeries).seasonCount === 1 ? "temporada" : "temporadas"}`,
          title: item.title,
        },
  );
  const renderCard = (item: MediaCardItem, index: number) => (
    <MediaCard
      carousel={carousel}
      item={item}
      key={`${kind}-${item.id}`}
      kind={kind}
      onToggle={onToggle}
      variant={index % 2 ? "amber" : "blue"}
    />
  );

  if (!carousel) {
    return (
      <div data-tv-navigation-region="catalog-grid">
        <VirtualizedGrid
          columnCount={(width) =>
            width < 640 ? 2 : width < 1024 ? 4 : width < 1280 ? 5 : 6
          }
          getItemKey={(item) => item.id}
          items={media}
          renderItem={renderCard}
        />
      </div>
    );
  }

  return (
    <div className="flex min-w-max flex-nowrap gap-3">
      {media.map(renderCard)}
    </div>
  );
}

type MediaCardItem = {
  id: string;
  imageUrl?: string;
  meta: string;
  title: string;
};

const MediaCard = function MediaCard({
  carousel,
  item,
  kind,
  onToggle,
  variant,
}: {
  carousel: boolean;
  item: MediaCardItem;
  kind: "movie" | "series";
  onToggle: (kind: FavoriteKind, id: string) => void;
  variant: "amber" | "blue";
}) {
  const handleToggle = () => onToggle(kind, item.id);
  return (
    <article
      className={`[content-visibility:auto] group relative flex aspect-[2/3] min-w-0 cursor-pointer flex-col justify-end overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br p-3.5 shadow-[inset_0_-90px_70px_-28px_rgba(0,0,0,0.9)] transition-transform hover:-translate-y-1 focus-within:border-gold focus-within:ring-2 focus-within:ring-focus ${carousel ? "w-[240px] min-w-[240px] shrink-0" : "w-full"} ${variant === "amber" ? "from-[#78502a] to-[#171510]" : "from-[#30475d] to-[#171510]"}`}
    >
      {item.imageUrl && (
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          decoding="async"
          loading="lazy"
          referrerPolicy="no-referrer"
          src={item.imageUrl}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-white/5" />
      <Link
        aria-label={`Abrir ${item.title}`}
        className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-focus"
        params={
          (kind === "movie"
            ? { movieId: item.id }
            : { seriesId: item.id }) as never
        }
        to={
          appRoute(
            kind === "movie" ? "/movies/$movieId" : "/series/$seriesId",
          ) as never
        }
      />
      <div className="relative min-w-0">
        <h2 className="truncate text-sm font-bold text-text">{item.title}</h2>
        <p className="mt-1 mb-0 truncate text-[0.6875rem] text-[#d0c8bb]">
          {item.meta}
        </p>
      </div>
      <span className="absolute top-3 right-3">
        <FavoriteButton
          active
          label={`Remover ${item.title} dos favoritos`}
          onToggle={handleToggle}
        />
      </span>
    </article>
  );
};

function CategoryFavoritesContent({
  category,
  channels,
  movies,
  series,
  onToggle,
}: {
  category: FavoriteKind;
  channels: CatalogItem[];
  movies: CatalogItem[];
  series: CatalogSeries[];
  onToggle: (kind: FavoriteKind, id: string) => void;
}) {
  const moviePage = useInfiniteCatalog(
    movies,
    () => true,
    () => 0,
    "",
    "",
  );
  const seriesPage = useInfiniteCatalog(
    series,
    () => true,
    () => 0,
    "",
    "",
  );
  const channelPage = useInfiniteCatalog(
    channels,
    () => true,
    () => 0,
    "",
    "",
  );

  if (category === "movie") {
    return (
      <>
        <MediaGrid
          carousel={false}
          items={moviePage.visibleItems}
          kind="movie"
          onToggle={onToggle}
        />
        {moviePage.hasMore && (
          <div className="h-1" ref={moviePage.sentinelRef} />
        )}
      </>
    );
  }
  if (category === "series") {
    return (
      <>
        <MediaGrid
          carousel={false}
          items={seriesPage.visibleItems}
          kind="series"
          onToggle={onToggle}
        />
        {seriesPage.hasMore && (
          <div className="h-1" ref={seriesPage.sentinelRef} />
        )}
      </>
    );
  }
  return (
    <>
      <ChannelList
        channels={channelPage.visibleItems}
        grid
        onToggle={onToggle}
      />
      {channelPage.hasMore && (
        <div className="h-1" ref={channelPage.sentinelRef} />
      )}
    </>
  );
}

export function FavoritesPage({ category }: { category?: FavoriteKind }) {
  const navigate = useNavigate();
  const [expandedKinds, setExpandedKinds] = useState<Set<FavoriteKind>>(
    () => new Set(),
  );
  const { favorites, toggleFavorite } = useFavorites();
  const { items: channels, isLoading: channelsLoading } =
    useCatalogItems("live");
  const { items: movies, isLoading: moviesLoading } = useCatalogItems("movie");
  const { items: series, isLoading: seriesLoading } = useCatalogSeries();
  const favoriteChannels = newestFavorites(channels, favorites, "channel");
  const favoriteMovies = newestFavorites(movies, favorites, "movie");
  const favoriteSeries = newestFavorites(series, favorites, "series");
  const previewMovies = favoriteMovies.slice(0, 10);
  const previewSeries = favoriteSeries.slice(0, 10);
  const previewChannels = favoriteChannels.slice(0, 20);
  const toggleExpanded = (kind: FavoriteKind) => {
    setExpandedKinds((current) => {
      const next = new Set(current);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };
  const count =
    favoriteChannels.length + favoriteMovies.length + favoriteSeries.length;
  const isLoading = channelsLoading || moviesLoading || seriesLoading;
  const hasVisibleFavorites = category
    ? (category === "movie"
        ? favoriteMovies.length
        : category === "series"
          ? favoriteSeries.length
          : favoriteChannels.length) > 0
    : count > 0;
  const shouldRender = (kind: FavoriteKind) => !category || category === kind;
  const categoryLabel =
    category === "movie"
      ? "Filmes"
      : category === "series"
        ? "Séries"
        : "Canais";
  const categoryCount =
    category === "movie"
      ? favoriteMovies.length
      : category === "series"
        ? favoriteSeries.length
        : favoriteChannels.length;

  return (
    <div className="flex min-h-screen w-full flex-col gap-5 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:gap-6 lg:px-8 lg:pb-16">
      <div className="flex items-center justify-between gap-4">
        <h1
          aria-busy={Boolean(category && isLoading)}
          className="m-0 font-display text-[1.75rem] font-bold tracking-[-0.05em] text-text sm:text-[1.875rem]"
        >
          {category && isLoading ? (
            <Skeleton className="h-8 w-72 sm:h-9" />
          ) : category ? (
            `Favoritos - ${categoryLabel} (${categoryCount})`
          ) : (
            "Favoritos"
          )}
        </h1>
        <button
          aria-label="Abrir menu"
          className="text-text lg:hidden"
          type="button"
        >
          <Menu className="size-5" />
        </button>
      </div>
      {isLoading ? (
        <FavoritesSkeleton category={category} />
      ) : !hasVisibleFavorites ? (
        <EmptyFavorites
          onExplore={() => void navigate({ to: appRoute("/") })}
        />
      ) : category ? (
        <CategoryFavoritesContent
          category={category}
          channels={favoriteChannels}
          movies={favoriteMovies}
          onToggle={toggleFavorite}
          series={favoriteSeries}
        />
      ) : (
        <div className="flex flex-col gap-7">
          {shouldRender("movie") && favoriteMovies.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="m-0 font-display text-[1.25rem] font-bold text-text">
                  Filmes{" "}
                  <span className="font-medium text-muted">
                    ({favoriteMovies.length})
                  </span>
                </h2>
                <SectionControls
                  expanded={expandedKinds.has("movie")}
                  onViewAll={
                    category
                      ? undefined
                      : () => void navigate({ to: favoriteRoutes.movie })
                  }
                  onToggleExpanded={() => toggleExpanded("movie")}
                  showMore={!category}
                />
              </div>
              <Carousel>
                <MediaGrid
                  items={previewMovies}
                  kind="movie"
                  onToggle={toggleFavorite}
                />
              </Carousel>
            </section>
          )}
          {shouldRender("series") && favoriteSeries.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="m-0 font-display text-[1.25rem] font-bold text-text">
                  Séries{" "}
                  <span className="font-medium text-muted">
                    ({favoriteSeries.length})
                  </span>
                </h2>
                <SectionControls
                  expanded={expandedKinds.has("series")}
                  onViewAll={
                    category
                      ? undefined
                      : () => void navigate({ to: favoriteRoutes.series })
                  }
                  onToggleExpanded={() => toggleExpanded("series")}
                  showMore={!category}
                />
              </div>
              <Carousel>
                <MediaGrid
                  items={previewSeries}
                  kind="series"
                  onToggle={toggleFavorite}
                />
              </Carousel>
            </section>
          )}
          {shouldRender("channel") && favoriteChannels.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="m-0 font-display text-[1.25rem] font-bold text-text">
                  Canais{" "}
                  <span className="font-medium text-muted">
                    ({favoriteChannels.length})
                  </span>
                </h2>
                <SectionControls
                  expanded={expandedKinds.has("channel")}
                  onToggleExpanded={() => toggleExpanded("channel")}
                  onViewAll={
                    category
                      ? undefined
                      : () => void navigate({ to: favoriteRoutes.channel })
                  }
                  showMore={!category}
                />
              </div>
              <ChannelList
                channels={previewChannels}
                grid
                onToggle={toggleFavorite}
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
