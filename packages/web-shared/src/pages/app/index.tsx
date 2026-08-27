import { Link } from "@tanstack/react-router";
import { Info, Radio } from "lucide-react";
import {
  type CSSProperties,
  lazy,
  type ReactNode,
  Suspense,
  useEffect,
  useState,
} from "react";
import { Carousel } from "../../components/carousel";
import { HomePageSkeleton } from "../../components/catalog-skeleton";
import { Icon } from "../../components/icon";
import type { SourceFormValues } from "../../components/source-form";
import { ProductState } from "../../components/ui";
import type {
  CatalogItem,
  CatalogSeries,
} from "../../features/catalog/catalog";
import {
  useCatalogItems,
  useCatalogSeries,
  useCatalogSources,
} from "../../hooks/use-catalog-data";
import {
  defaultHeroAspectRatio,
  useImageAspectRatio,
} from "../../hooks/use-image-aspect-ratio";
import {
  getXtreamCredentialsFromM3uUrl,
  importM3uSource,
  saveM3uSource,
  saveXtreamSource,
} from "../../services/catalog-service";
import { usePlaybackProgress } from "../../services/playback-progress";
import {
  loadRecentChannels,
  type RecentChannel,
  recentChannelsEvent,
} from "../../services/recent-channels";

const SourceOnboardingDialog = lazy(() =>
  import("../../components/source-onboarding-dialog").then(
    ({ SourceOnboardingDialog: dialog }) => ({ default: dialog }),
  ),
);

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <h2 className="m-0 font-display text-[1.125rem] font-semibold tracking-[-0.03em] text-text">
      {children}
    </h2>
  );
}

function MediaCard({
  item,
  kind,
  index,
}: {
  item: CatalogItem | CatalogSeries;
  kind: "movie" | "series";
  index: number;
}) {
  const isMovie = kind === "movie";
  const imageUrl = isMovie
    ? (item as CatalogItem).logoUrl
    : (item as CatalogSeries).posterUrl;
  const meta = isMovie
    ? (item as CatalogItem).year
      ? String((item as CatalogItem).year)
      : "Filme"
    : `${(item as CatalogSeries).seasonCount} ${(item as CatalogSeries).seasonCount === 1 ? "temporada" : "temporadas"}`;
  return (
    <article
      className={`group relative flex aspect-[2/3] w-[190px] min-w-[190px] shrink-0 flex-col justify-end overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br p-3.5 shadow-[inset_0_-90px_70px_-28px_rgba(0,0,0,0.9)] transition-transform hover:-translate-y-1 focus-within:border-gold focus-within:ring-2 focus-within:ring-focus sm:w-[220px] sm:min-w-[220px] ${index % 2 ? "from-[#78502a] to-[#171510]" : "from-[#30475d] to-[#171510]"}`}
    >
      {imageUrl && (
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          src={imageUrl}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-white/5" />
      <Link
        aria-label={`Abrir ${item.title}`}
        className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-focus"
        data-tv-home-card
        params={isMovie ? { movieId: item.id } : { seriesId: item.id }}
        to={isMovie ? "/app/movies/$movieId" : "/app/series/$seriesId"}
      />
      <div className="relative min-w-0">
        <h3 className="truncate text-sm font-bold text-text">{item.title}</h3>
        <p className="mt-1 mb-0 truncate text-[0.6875rem] text-[#d0c8bb]">
          {meta}
        </p>
      </div>
    </article>
  );
}

function ChannelCard({ channel }: { channel: RecentChannel }) {
  return (
    <article className="relative flex min-h-[126px] w-[220px] min-w-[220px] shrink-0 cursor-pointer flex-col gap-2 rounded-[10px] border border-line bg-panel p-3 transition-colors hover:border-gold/60 focus-within:border-gold focus-within:ring-2 focus-within:ring-focus">
      <Link
        aria-label={`Assistir ${channel.title}`}
        className="absolute inset-0 z-0 rounded-[10px] focus-visible:outline-2 focus-visible:outline-focus"
        data-tv-home-card
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
      <span className="relative z-10 min-w-0">
        <strong className="block truncate text-sm font-bold text-text">
          {channel.title}
        </strong>
        <span className="mt-1 block truncate text-[0.6875rem] text-muted">
          {channel.groupTitle ?? "Ao vivo"}
        </span>
      </span>
    </article>
  );
}

function FeaturedHero({ item }: { item?: CatalogItem | CatalogSeries }) {
  const isMovie = Boolean(item && "kind" in item && item.kind === "movie");
  const imageUrl =
    item &&
    (isMovie
      ? ((item as CatalogItem).backdropUrl ?? (item as CatalogItem).logoUrl)
      : ((item as CatalogSeries).backdropUrl ??
        (item as CatalogSeries).posterUrl));
  const imageAspectRatio = useImageAspectRatio(imageUrl);
  const backdropFade =
    "linear-gradient(to bottom, rgb(21 19 15 / 0%) 0%, rgb(21 19 15 / 2%) 32%, rgb(21 19 15 / 20%) 52%, rgb(21 19 15 / 62%) 74%, #15130f 100%)";
  const detailsTo = isMovie ? "/app/movies/$movieId" : "/app/series/$seriesId";
  const detailsParams = isMovie
    ? { movieId: item?.id ?? "" }
    : { seriesId: item?.id ?? "" };
  return (
    <section
      className="relative -mx-4 min-h-[clamp(500px,calc(100vw/var(--hero-aspect-ratio)),900px)] w-[calc(100%+2rem)] overflow-visible px-5 sm:-mx-6 sm:min-h-[clamp(650px,calc(100vw/var(--hero-aspect-ratio)),900px)] sm:w-[calc(100%+3rem)] sm:px-10 lg:-mx-8 lg:w-[calc(100%+4rem)] lg:px-[70px]"
      style={{ "--hero-aspect-ratio": defaultHeroAspectRatio } as CSSProperties}
    >
      <div
        className={`absolute inset-x-0 top-0 h-full overflow-hidden bg-top bg-no-repeat ${isMovie ? "bg-[#6f441e]" : "bg-[#284151]"}`}
        style={{
          backgroundImage: imageUrl
            ? `${backdropFade}, url(${imageUrl})`
            : backdropFade,
          backgroundPosition: "center top, center top",
          backgroundSize: `100% 100%, ${imageAspectRatio >= 1 ? "100% auto" : "auto 100%"}`,
        }}
      />
      <div className="absolute inset-x-5 bottom-8 z-20 flex max-w-[720px] flex-col gap-3.5 sm:inset-x-10 sm:bottom-10 lg:inset-x-[70px]">
        <p className="m-0 text-[0.6875rem] font-extrabold tracking-[0.1em] text-gold-bright">
          EM DESTAQUE
        </p>
        <h1 className="m-0 font-display text-[1.75rem] font-bold leading-tight tracking-[-0.05em] text-text md:text-[2.188rem]">
          {item?.title ?? "Seu catálogo IPTV"}
        </h1>
        <p className="m-0 max-w-[470px] text-sm leading-[1.45] text-[#ddd5c8]">
          {item?.description ??
            "O conteúdo mais recente do seu catálogo, pronto para assistir."}
        </p>
        {item ? (
          <div
            className="flex flex-wrap gap-2.5 pt-1"
            data-tv-home-hero-actions
          >
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-gold bg-gold px-5 text-sm font-bold text-ink hover:bg-gold-bright"
              params={isMovie ? { movieId: item.id } : { seriesId: item.id }}
              to={
                isMovie ? "/app/movies/$movieId/watch" : "/app/series/$seriesId"
              }
            >
              <Icon className="size-4" name="play" /> Assistir
            </Link>
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-panel-2 px-5 text-sm font-bold text-text hover:border-gold/60 hover:bg-panel-2/80"
              params={detailsParams}
              to={detailsTo}
            >
              <Info className="size-4" /> Ver detalhes
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function HomePage() {
  const { isLoading: sourcesLoading, sources } = useCatalogSources();
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    items: liveItems,
    isLoading: liveLoading,
    retry: retryLive,
  } = useCatalogItems("live");
  const {
    items: movieItems,
    isLoading: movieLoading,
    retry: retryMovies,
  } = useCatalogItems("movie");
  const {
    items: seriesItems,
    isLoading: seriesLoading,
    retry: retrySeries,
  } = useCatalogSeries();
  const [recentChannels, setRecentChannels] =
    useState<RecentChannel[]>(loadRecentChannels);
  const playbackProgress = usePlaybackProgress();
  const progressCards = playbackProgress
    .map((progress) => {
      const item =
        movieItems.find((candidate) => candidate.id === progress.contentId) ??
        (progress.mediaType === "episode"
          ? seriesItems.find((candidate) => candidate.id === progress.seriesId)
          : undefined);
      return item ? { progress, item } : undefined;
    })
    .filter((value): value is NonNullable<typeof value> => Boolean(value));
  useEffect(() => {
    const update = () => setRecentChannels(loadRecentChannels());
    window.addEventListener(recentChannelsEvent, update);
    return () => window.removeEventListener(recentChannelsEvent, update);
  }, []);
  const recentChannelCards: RecentChannel[] = recentChannels
    .map((recent) => {
      const current = liveItems.find((item) => item.id === recent.id);
      return current
        ? { ...recent, ...current, accessedAt: recent.accessedAt }
        : recent;
    })
    .slice(0, 5);
  const featuredMovies = movieItems.slice(0, 20);
  const featuredSeries = seriesItems.slice(0, 20);
  const featured = movieItems[0] ?? seriesItems[0];
  const isLoading =
    sourcesLoading || liveLoading || movieLoading || seriesLoading;
  const retry = () => {
    retryLive();
    retryMovies();
    retrySeries();
  };

  async function saveFirstSource(values: SourceFormValues) {
    setError(null);
    try {
      setProgress("Carregando catálogo Xtream...");
      const m3uXtream =
        values.type === "m3u"
          ? getXtreamCredentialsFromM3uUrl(values.url)
          : null;
      if (values.type === "xtream" || m3uXtream) {
        await saveXtreamSource({
          name: values.name,
          ...(m3uXtream ?? {
            server: values.server,
            username: values.username,
            password: values.password,
          }),
        });
      } else {
        const source = await saveM3uSource({
          name: values.name,
          url: values.url,
        });
        await importM3uSource(source, {
          onProgress: (phase) =>
            setProgress(
              phase === "fetching"
                ? "Baixando playlist..."
                : phase === "parsing"
                  ? "Analisando conteúdo..."
                  : "Indexando catálogo...",
            ),
        });
      }
      setProgress(null);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível importar a fonte.",
      );
      setProgress(null);
    }
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col gap-4 px-4 pb-24 sm:px-6 lg:gap-5 lg:px-8 lg:pb-16">
        {isLoading ? (
          <HomePageSkeleton onRetry={retry} />
        ) : (
          <>
            <FeaturedHero item={featured} />
            <section className="flex flex-col gap-3">
              <SectionHeader>Continuar assistindo</SectionHeader>
              {progressCards.length ? (
                <Carousel ariaLabel="Continuar assistindo">
                  {progressCards.map(({ item, progress }, index) => (
                    <MediaCard
                      index={index}
                      item={item}
                      key={progress.contentId}
                      kind={progress.mediaType === "movie" ? "movie" : "series"}
                    />
                  ))}
                </Carousel>
              ) : (
                <ProductState
                  className="min-h-[110px]"
                  compact
                  kind="catalog-empty"
                />
              )}
            </section>
            <section className="flex flex-col gap-3">
              <SectionHeader>Canais recentes</SectionHeader>
              {recentChannelCards.length ? (
                <Carousel ariaLabel="Canais recentes">
                  {recentChannelCards.map((channel) => (
                    <ChannelCard channel={channel} key={channel.id} />
                  ))}
                </Carousel>
              ) : (
                <ProductState
                  className="min-h-[110px]"
                  compact
                  kind="catalog-empty"
                />
              )}
            </section>
            <section className="flex flex-col gap-3">
              <SectionHeader>Filmes em destaque</SectionHeader>
              {featuredMovies.length ? (
                <Carousel ariaLabel="Filmes em destaque">
                  {featuredMovies.map((item, index) => (
                    <MediaCard
                      index={index}
                      item={item}
                      key={item.id}
                      kind="movie"
                    />
                  ))}
                </Carousel>
              ) : (
                <ProductState className="min-h-[210px]" kind="catalog-empty" />
              )}
            </section>
            <section className="flex flex-col gap-3">
              <SectionHeader>Séries em destaque</SectionHeader>
              {featuredSeries.length ? (
                <Carousel ariaLabel="Séries em destaque">
                  {featuredSeries.map((item, index) => (
                    <MediaCard
                      index={index}
                      item={item}
                      key={item.id}
                      kind="series"
                    />
                  ))}
                </Carousel>
              ) : (
                <ProductState className="min-h-[210px]" kind="catalog-empty" />
              )}
            </section>
          </>
        )}
      </div>
      {!sourcesLoading && !sources.length && (
        <Suspense fallback={null}>
          <SourceOnboardingDialog
            error={error}
            onSave={saveFirstSource}
            progress={progress}
          />
        </Suspense>
      )}
    </>
  );
}
