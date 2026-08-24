import { Heart, Play, SlidersHorizontal, Star, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button, SearchField } from "../../components/ui";
import { AppHeader, AppLayout } from "./app-shell";

type Movie = {
  accent: string;
  category: string;
  duration: string;
  rating: number;
  title: string;
  year: number;
};

const categories = [
  "Todos",
  "Ação",
  "Drama",
  "Comédia",
  "Ficção",
  "Documentário",
];

const movies: Movie[] = [
  {
    accent: "from-[#6f4b39] via-[#9b6a42] to-[#201713]",
    category: "Ficção",
    duration: "2h 08min",
    rating: 8.7,
    title: "Horizonte de Âmbar",
    year: 2024,
  },
  {
    accent: "from-[#455b68] via-[#6d8990] to-[#18232a]",
    category: "Drama",
    duration: "1h 52min",
    rating: 8.2,
    title: "Depois da Chuva",
    year: 2023,
  },
  {
    accent: "from-[#765c3c] via-[#b28a4e] to-[#241b12]",
    category: "Drama",
    duration: "2h 14min",
    rating: 8.5,
    title: "O Último Farol",
    year: 2022,
  },
  {
    accent: "from-[#3c4f4e] via-[#668078] to-[#17201e]",
    category: "Documentário",
    duration: "1h 47min",
    rating: 8.9,
    title: "Cidade Velada",
    year: 2024,
  },
  {
    accent: "from-[#683f49] via-[#a55a63] to-[#241419]",
    category: "Ação",
    duration: "2h 01min",
    rating: 7.9,
    title: "Linha de Fuga",
    year: 2024,
  },
  {
    accent: "from-[#596b42] via-[#8fa05c] to-[#1a2015]",
    category: "Comédia",
    duration: "1h 38min",
    rating: 7.6,
    title: "Férias em Marte",
    year: 2023,
  },
  {
    accent: "from-[#5e4c72] via-[#8676a2] to-[#1c1824]",
    category: "Ficção",
    duration: "2h 20min",
    rating: 8.4,
    title: "A Frequência",
    year: 2021,
  },
  {
    accent: "from-[#345866] via-[#4c8792] to-[#142429]",
    category: "Ação",
    duration: "1h 55min",
    rating: 7.8,
    title: "Maré Alta",
    year: 2022,
  },
  {
    accent: "from-[#765445] via-[#a9785c] to-[#261912]",
    category: "Drama",
    duration: "1h 44min",
    rating: 8.1,
    title: "As Cartas de Junho",
    year: 2020,
  },
];

type SortOption = "recent" | "rating" | "title";

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/5 bg-panel transition-transform hover:-translate-y-1">
      <div
        className={`relative flex aspect-[3/4] items-end overflow-hidden bg-gradient-to-br ${movie.accent} p-3.5`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.2),transparent_25%),linear-gradient(to_top,rgba(0,0,0,0.72),transparent_55%)]" />
        <span className="relative rounded-md border border-white/15 bg-black/25 px-2 py-1 text-[10px] font-extrabold tracking-[0.08em] text-white/85">
          {movie.category.toUpperCase()}
        </span>
        <button
          aria-label={`Reproduzir ${movie.title}`}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/35 text-text opacity-0 transition-opacity hover:bg-gold hover:text-ink group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-focus"
          type="button"
        >
          <Play aria-hidden="true" className="ml-0.5 size-4 fill-current" />
        </button>
        <button
          aria-label={`Adicionar ${movie.title} aos favoritos`}
          className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-black/25 text-text opacity-0 transition-opacity hover:text-gold-bright group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-focus"
          type="button"
        >
          <Heart aria-hidden="true" className="size-4" />
        </button>
      </div>
      <div className="min-w-0 p-3.5">
        <h2 className="truncate text-sm font-bold text-text">{movie.title}</h2>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted">
          <span>{movie.year}</span>
          <span className="text-line">·</span>
          <span>{movie.duration}</span>
          <span className="ml-auto flex items-center gap-1 font-bold text-gold-bright">
            <Star aria-hidden="true" className="size-3 fill-current" />
            {movie.rating}
          </span>
        </div>
      </div>
    </article>
  );
}

function EmptyMovies({ onClear }: { onClear: () => void }) {
  return (
    <div className="col-span-full flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-panel/50 px-5 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-panel-2 text-muted">
        <SlidersHorizontal aria-hidden="true" className="size-5" />
      </span>
      <h2 className="mt-4 mb-1 font-display text-lg font-bold text-text">
        Nenhum filme encontrado
      </h2>
      <p className="m-0 max-w-sm text-sm text-muted">
        Tente buscar por outro título ou remova os filtros para ver todo o
        catálogo.
      </p>
      <Button
        className="mt-5 h-10 px-4 text-xs"
        onClick={onClear}
        variant="quiet"
      >
        Limpar filtros
      </Button>
    </div>
  );
}

export function MoviesPage() {
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");

  const visibleMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = movies.filter((movie) => {
      const matchesCategory =
        category === "Todos" || movie.category === category;
      const matchesQuery = movie.title
        .toLocaleLowerCase()
        .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });

    return [...filtered].sort((first, second) => {
      if (sort === "rating") return second.rating - first.rating;
      if (sort === "title") return first.title.localeCompare(second.title);
      return second.year - first.year;
    });
  }, [category, query, sort]);

  const clearFilters = () => {
    setCategory("Todos");
    setQuery("");
    setSort("recent");
  };

  return (
    <AppLayout>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-5 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:gap-6 lg:px-8 lg:pb-10">
        <AppHeader>
          <SearchField
            aria-label="Buscar no catálogo"
            className="max-w-[420px]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar filmes, séries e canais"
            value={query}
          />
        </AppHeader>
        <section className="relative isolate overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#5d463c] via-[#313b42] to-[#171510] px-5 py-6 sm:px-7 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(227,168,59,0.2),transparent_27%),linear-gradient(90deg,rgba(22,19,15,0.88),rgba(22,19,15,0.16))]" />
          <div className="relative max-w-xl">
            <p className="m-0 text-[11px] font-extrabold tracking-[0.1em] text-gold-bright">
              CATÁLOGO DE FILMES
            </p>
            <h1 className="mt-2 mb-2 font-display text-[28px] font-bold leading-tight tracking-[-0.05em] text-text sm:text-[34px]">
              Histórias para cada momento
            </h1>
            <p className="m-0 max-w-lg text-sm leading-relaxed text-[#ddd5c8]">
              Explore sua coleção, descubra novos favoritos e encontre o próximo
              filme para assistir.
            </p>
          </div>
        </section>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((item) => (
              <button
                aria-pressed={category === item}
                className={`h-10 shrink-0 rounded-[9px] px-3.5 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-focus ${category === item ? "bg-gold text-ink" : "border border-line bg-panel text-muted hover:border-gold/60 hover:text-text"}`}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <SearchField
              aria-label="Buscar filmes"
              className="h-10 w-full sm:w-[260px]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título..."
              value={query}
            />
            <label className="flex h-10 items-center gap-2 rounded-xl border border-line bg-panel px-3 text-xs font-semibold text-muted">
              <span className="sr-only">Ordenar filmes</span>
              <span>Ordenar:</span>
              <select
                aria-label="Ordenar filmes"
                className="bg-transparent text-text outline-none"
                onChange={(event) => setSort(event.target.value as SortOption)}
                value={sort}
              >
                <option value="recent">Mais recentes</option>
                <option value="rating">Melhor avaliados</option>
                <option value="title">Título A-Z</option>
              </select>
            </label>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="m-0 font-display text-xl font-bold tracking-[-0.04em] text-text">
              Todos os filmes
            </h2>
            <p className="mt-1 mb-0 text-xs text-muted">
              {visibleMovies.length}{" "}
              {visibleMovies.length === 1
                ? "título disponível"
                : "títulos disponíveis"}
            </p>
          </div>
          {(query || category !== "Todos") && (
            <button
              className="flex items-center gap-1.5 text-xs font-bold text-gold-bright hover:text-text focus-visible:outline-2 focus-visible:outline-focus"
              onClick={clearFilters}
              type="button"
            >
              <X aria-hidden="true" className="size-3.5" />
              Limpar busca
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visibleMovies.length > 0 ? (
            visibleMovies.map((movie) => (
              <MovieCard key={movie.title} movie={movie} />
            ))
          ) : (
            <EmptyMovies onClear={clearFilters} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
