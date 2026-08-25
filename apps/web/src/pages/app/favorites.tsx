import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, HeartOff, Menu, Radio } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button, ProgressBar, Skeleton } from "../../components/ui";
import type {
  CatalogItem,
  CatalogSeries,
} from "../../features/catalog/catalog";
import {
  useCatalogItems,
  useCatalogSeries,
  useXtreamEpg,
} from "../../hooks/use-catalog-data";
import { useInfiniteCatalog } from "../../hooks/use-infinite-catalog";
import {
  type Favorite,
  type FavoriteKind,
  useFavorites,
} from "../../services/favorites";
import { AppLayout } from "./app-shell";
import { FavoriteButton } from "./components/favorite-button";

const favoriteRoutes = {
  channel: "/app/favorites/channels",
  movie: "/app/favorites/movies",
  series: "/app/favorites/series",
} as const;

function newestFavorites<T extends { id: string }>(
  items: T[],
  favorites: Favorite[],
  kind: FavoriteKind,
) {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  return favorites
    .filter((favorite) => favorite.kind === kind)
    .toReversed()
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
      <p className="m-0 max-w-[440px] text-[13px] font-medium leading-[1.45] text-muted">
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
        <button
          className="text-xs font-bold text-gold-bright hover:text-text focus-visible:outline-2 focus-visible:outline-focus"
          onClick={onViewAll ?? onToggleExpanded}
          type="button"
        >
          {expanded ? "Ver menos" : "Ver mais"}
        </button>
      )}
    </div>
  );
}

function CarouselViewport({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setCanPrevious(viewport.scrollLeft > 1);
    setCanNext(
      viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1,
    );
  }, []);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    updateScrollState();
    viewport.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(viewport);
    return () => {
      viewport.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);
  const move = (direction: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({
      behavior: "smooth",
      left: direction * Math.max(viewport.clientWidth * 0.82, 240),
    });
  };

  return (
    <div className="relative -mx-4 min-w-0 sm:-mx-6 lg:-mx-8">
      <div
        className="overflow-x-auto overflow-y-visible scroll-smooth px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 lg:px-8"
        ref={viewportRef}
      >
        {children}
      </div>
      {canPrevious && (
        <button
          aria-label="Favoritos anteriores"
          className="absolute inset-y-0 left-0 z-20 flex w-14 items-center justify-center bg-gradient-to-r from-bg via-bg/75 to-transparent text-text opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-focus"
          onClick={() => move(-1)}
          type="button"
        >
          <span className="grid size-9 place-items-center rounded-full border border-line bg-panel/95 shadow-lg">
            <ChevronLeft aria-hidden="true" className="size-5" />
          </span>
        </button>
      )}
      {canNext && (
        <button
          aria-label="Próximos favoritos"
          className="absolute inset-y-0 right-0 z-20 flex w-14 items-center justify-center bg-gradient-to-l from-bg via-bg/75 to-transparent text-text opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-focus"
          onClick={() => move(1)}
          type="button"
        >
          <span className="grid size-9 place-items-center rounded-full border border-line bg-panel/95 shadow-lg">
            <ChevronRight aria-hidden="true" className="size-5" />
          </span>
        </button>
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
        params={{ channelId: channel.id }}
        to="/app/tv/$channelId/watch"
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
          <span className="mt-1 block truncate text-[11px] text-muted">
            Carregando programação...
          </span>
        ) : currentProgram ? (
          <span className="mt-1 block min-w-0">
            <span className="block truncate text-[11px] text-muted">
              <strong className="font-extrabold text-gold-bright">
                AGORA:
              </strong>{" "}
              {currentProgram.title}
            </span>
            <span className="mt-1 block text-[10px] text-muted">
              {formatProgramTime(currentProgram.start)} –{" "}
              {formatProgramTime(currentProgram.stop)}
            </span>
            <ProgressBar className="mt-1 h-1" value={programProgress} />
          </span>
        ) : (
          <span className="mt-1 block truncate text-[11px] text-muted">
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
  return (
    <div
      className={
        carousel
          ? "flex min-w-max flex-nowrap gap-3"
          : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:gap-3.5"
      }
    >
      {media.map((item, index) => {
        return (
          <article
            className={`group relative flex h-[230px] min-w-0 cursor-pointer flex-col justify-end overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br p-3.5 transition-transform hover:-translate-y-1 ${carousel ? "w-[240px] min-w-[240px] shrink-0" : "w-full"} ${index % 2 ? "from-[#78502a] to-[#171510]" : "from-[#30475d] to-[#171510]"}`}
            key={item.id}
          >
            {item.imageUrl && (
              <img
                alt=""
                className="absolute inset-0 size-full object-cover"
                src={item.imageUrl}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-white/5" />
            <Link
              aria-label={`Abrir ${item.title}`}
              className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-focus"
              params={
                kind === "movie" ? { movieId: item.id } : { seriesId: item.id }
              }
              to={
                kind === "movie"
                  ? "/app/movies/$movieId"
                  : "/app/series/$seriesId"
              }
            />
            <div className="relative min-w-0">
              <h2 className="truncate text-sm font-bold text-text">
                {item.title}
              </h2>
              <p className="mt-1 mb-0 truncate text-[11px] text-[#d0c8bb]">
                {item.meta}
              </p>
            </div>
            <span className="absolute top-3 right-3">
              <FavoriteButton
                active
                label={`Remover ${item.title} dos favoritos`}
                onToggle={() => onToggle(kind, item.id)}
              />
            </span>
          </article>
        );
      })}
    </div>
  );
}

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
  const favoriteChannels = useMemo(
    () => newestFavorites(channels, favorites, "channel"),
    [channels, favorites],
  );
  const favoriteMovies = useMemo(
    () => newestFavorites(movies, favorites, "movie"),
    [favorites, movies],
  );
  const favoriteSeries = useMemo(
    () => newestFavorites(series, favorites, "series"),
    [favorites, series],
  );
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
    <AppLayout>
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:gap-6 lg:px-8 lg:pb-10">
        <div className="flex items-center justify-between gap-4">
          <h1
            aria-busy={Boolean(category && isLoading)}
            className="m-0 font-display text-[28px] font-bold tracking-[-0.05em] text-text sm:text-[30px]"
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
          <EmptyFavorites onExplore={() => void navigate({ to: "/app" })} />
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
                  <h2 className="m-0 font-display text-[20px] font-bold text-text">
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
                <CarouselViewport>
                  <MediaGrid
                    items={previewMovies}
                    kind="movie"
                    onToggle={toggleFavorite}
                  />
                </CarouselViewport>
              </section>
            )}
            {shouldRender("series") && favoriteSeries.length > 0 && (
              <section className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="m-0 font-display text-[20px] font-bold text-text">
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
                <CarouselViewport>
                  <MediaGrid
                    items={previewSeries}
                    kind="series"
                    onToggle={toggleFavorite}
                  />
                </CarouselViewport>
              </section>
            )}
            {shouldRender("channel") && favoriteChannels.length > 0 && (
              <section className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="m-0 font-display text-[20px] font-bold text-text">
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
    </AppLayout>
  );
}
