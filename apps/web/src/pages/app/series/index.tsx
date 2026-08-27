import { Link } from "@tanstack/react-router";
import { memo, useMemo, useRef, useState } from "react";
import { CatalogGridSkeleton } from "../../../components/catalog-skeleton";
import {
  CategoryDialog,
  CategoryFilterTrigger,
  CategorySidebar,
} from "../../../components/category-dialog";
import {
  ProductState,
  ScrollArea,
  SearchField,
  SelectField,
  VirtualizedGrid,
} from "../../../components/ui";
import { useCatalogSeries } from "../../../hooks/use-catalog-data";
import { useInfiniteCatalog } from "../../../hooks/use-infinite-catalog";
import { useSearchShortcut } from "../../../hooks/use-search-shortcut";
import { usePlaybackProgress } from "../../../services/playback-progress";
import { AppHeader } from "../components";

type Series = {
  accent: string;
  categories?: string[];
  genre: string;
  id: string;
  posterUrl?: string;
  seasons: number;
  title: string;
};

type SortOption = "recent" | "title";

const _series: Series[] = [
  {
    accent: "from-[#243442] to-[#171510]",
    genre: "Drama",
    id: "alem-do-veu-1",
    seasons: 1,
    title: "Além do Véu",
  },
  {
    accent: "from-[#78502a] to-[#171510]",
    genre: "Ação",
    id: "rota-norte-1",
    seasons: 2,
    title: "Rota Norte",
  },
  {
    accent: "from-[#243442] to-[#171510]",
    genre: "Ficção",
    id: "neon-selvagem-1",
    seasons: 3,
    title: "Neon Selvagem",
  },
  {
    accent: "from-[#78502a] to-[#171510]",
    genre: "Documentário",
    id: "arquivo-zero-1",
    seasons: 1,
    title: "Arquivo Zero",
  },
  {
    accent: "from-[#243442] to-[#171510]",
    genre: "Drama",
    id: "mare-alta-1",
    seasons: 2,
    title: "Maré Alta",
  },
  {
    accent: "from-[#78502a] to-[#171510]",
    genre: "Ação",
    id: "o-visitante-1",
    seasons: 3,
    title: "O Visitante",
  },
  {
    accent: "from-[#78502a] to-[#171510]",
    genre: "Ficção",
    id: "alem-do-veu-2",
    seasons: 1,
    title: "Além do Véu",
  },
  {
    accent: "from-[#243442] to-[#171510]",
    genre: "Drama",
    id: "rota-norte-2",
    seasons: 2,
    title: "Rota Norte",
  },
  {
    accent: "from-[#78502a] to-[#171510]",
    genre: "Ficção",
    id: "neon-selvagem-2",
    seasons: 3,
    title: "Neon Selvagem",
  },
  {
    accent: "from-[#243442] to-[#171510]",
    genre: "Documentário",
    id: "arquivo-zero-2",
    seasons: 1,
    title: "Arquivo Zero",
  },
  {
    accent: "from-[#78502a] to-[#171510]",
    genre: "Drama",
    id: "mare-alta-2",
    seasons: 2,
    title: "Maré Alta",
  },
  {
    accent: "from-[#243442] to-[#171510]",
    genre: "Ação",
    id: "o-visitante-2",
    seasons: 3,
    title: "O Visitante",
  },
];

const SeriesCard = memo(function SeriesCard({ item }: { item: Series }) {
  return (
    <article
      className={`[content-visibility:auto] group relative flex aspect-[2/3] min-w-0 flex-col justify-end overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br ${item.accent} p-3.5 transition-transform hover:-translate-y-1`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(255,255,255,0.1),transparent_25%),linear-gradient(to_top,rgba(0,0,0,0.62),transparent_62%)]" />
      <Link
        aria-label={`Abrir ${item.title}`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-2 focus-visible:outline-focus"
        data-tv-navigation-zone="catalog-items"
        params={{ seriesId: item.id }}
        to="/app/series/$seriesId"
      />
      {item.posterUrl && (
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          decoding="async"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          referrerPolicy="no-referrer"
          src={item.posterUrl}
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 shadow-[inset_0_-90px_70px_-28px_rgba(0,0,0,0.9)]"
      />
      <div className="relative min-w-0">
        {item.title ? (
          <h2 className="truncate text-sm font-bold text-text">{item.title}</h2>
        ) : (
          <ProductState compact kind="metadata" />
        )}
        <p className="mt-1 mb-0 truncate text-[0.6875rem] text-[#d0c8bb]">
          {item.seasons} {item.seasons === 1 ? "temporada" : "temporadas"}
        </p>
      </div>
    </article>
  );
});

export function SeriesPage() {
  const [genre, setGenre] = useState("Todos");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const searchInputRef = useRef<HTMLInputElement>(null);
  useSearchShortcut(searchInputRef);
  const { items: importedSeries, isLoading } = useCatalogSeries();
  const progress = usePlaybackProgress();
  const continueIds = new Set(
    progress
      .filter((p) => p.mediaType === "episode" && p.seriesId)
      .map((p) => p.seriesId as string),
  );
  const seriesCatalog = useMemo<Series[]>(
    () =>
      importedSeries.map((item) => ({
        accent: "from-[#243442] to-[#171510]",
        categories: item.categories?.length
          ? item.categories
          : item.groupTitle
            ? [item.groupTitle]
            : ["Sem categoria"],
        genre: item.categories?.[0] ?? item.groupTitle ?? "Sem categoria",
        id: item.id,
        posterUrl: item.posterUrl,
        seasons: item.seasonCount,
        title: item.title,
      })),
    [importedSeries],
  );

  const categories = useMemo(
    () => [
      "Todos",
      ...(continueIds.size ? ["Continuar Assistindo"] : []),
      ...new Set(
        seriesCatalog.flatMap((item) =>
          item.categories?.length ? item.categories : [item.genre],
        ),
      ),
    ],
    [continueIds.size, seriesCatalog],
  );
  const {
    visibleItems: visibleSeries,
    filteredCount,
    hasMore,
    sentinelRef,
  } = useInfiniteCatalog(
    seriesCatalog,
    (item, search, category) =>
      (search.length > 0 ||
        category === "Todos" ||
        (category === "Continuar Assistindo" && continueIds.has(item.id)) ||
        (item.categories?.length ? item.categories : [item.genre]).includes(
          category,
        )) &&
      item.title.toLocaleLowerCase().includes(search),
    sort === "title"
      ? (first, second) => first.title.localeCompare(second.title)
      : () => 0,
    query,
    genre,
  );

  return (
    <>
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:gap-6 lg:px-[30px] lg:pb-16">
        <AppHeader className="sticky top-0 z-30 bg-bg/95 py-2 backdrop-blur-sm">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <h1 className="hidden min-w-0 truncate font-display text-[1.75rem] font-bold tracking-[-0.05em] text-text md:block">
              Séries
            </h1>
            <div className="hidden min-w-0 items-center gap-2 lg:flex">
              <SearchField
                aria-label="Buscar séries"
                className="h-10 w-[330px]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar séries, temporadas..."
                ref={searchInputRef}
                value={query}
              />
              <SelectField
                aria-label="Ordenar séries"
                className="min-w-[132px]"
                onValueChange={(value) => setSort(value as SortOption)}
                options={[
                  { label: "Mais recentes", value: "recent" },
                  { label: "Título A-Z", value: "title" },
                ]}
                value={sort}
                valueLabel={sort === "recent" ? "Mais recentes" : "Título A-Z"}
              />
            </div>
          </div>
        </AppHeader>
        <div className="md:hidden">
          <h1 className="m-0 font-display text-[1.75rem] font-bold tracking-[-0.05em] text-text">
            Séries
          </h1>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CategoryFilterTrigger onClick={() => setCategoryDialogOpen(true)} />
        </div>
        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start">
          <CategorySidebar
            categories={categories}
            isLoading={isLoading}
            onSelect={setGenre}
            selected={genre}
          />
          <ScrollArea
            className="h-[calc(100vh-8rem)] min-w-0 flex-1"
            contentClassName="pb-12"
          >
            {isLoading ? (
              <CatalogGridSkeleton />
            ) : visibleSeries.length > 0 ? (
              <div
                className="relative"
                data-tv-navigation-region="catalog-grid"
              >
                <VirtualizedGrid
                  columnCount={(width) =>
                    width < 640 ? 2 : width < 1024 ? 4 : width < 1280 ? 5 : 6
                  }
                  getItemKey={(item) => item.id}
                  items={visibleSeries}
                  renderItem={(item) => <SeriesCard item={item} />}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1"
                  ref={sentinelRef}
                />
              </div>
            ) : (
              <ProductState
                action={{
                  label: "Limpar filtros",
                  onClick: () => {
                    setGenre("Todos");
                    setQuery("");
                  },
                }}
                className="min-h-[240px] justify-center"
                kind="catalog-empty"
              />
            )}
            {hasMore && visibleSeries.length > 0 && (
              <p
                className="mt-5 mb-0 text-center text-xs text-muted"
                role="status"
              >
                Mostrando {visibleSeries.length} de {filteredCount} séries...
              </p>
            )}
          </ScrollArea>
        </div>
      </div>
      {categoryDialogOpen && (
        <CategoryDialog
          categories={categories}
          onClose={() => setCategoryDialogOpen(false)}
          onSelect={setGenre}
          selected={genre}
        />
      )}
    </>
  );
}
