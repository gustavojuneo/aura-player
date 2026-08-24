import { Link } from "@tanstack/react-router";
import { Heart, Menu } from "lucide-react";
import { useState } from "react";

import { type FavoriteKind, useFavorites } from "../../services/favorites";
import { AppHeader, AppLayout } from "./app-shell";

type Tab = FavoriteKind;
const tabs: Array<{ kind: Tab; label: string }> = [
  { kind: "channel", label: "Canais" },
  { kind: "movie", label: "Filmes" },
  { kind: "series", label: "Séries" },
];
const channels = [
  ["arena-sports", "Arena Sports", "Programa atual · 20:00"],
  ["prime-news", "Prime News", "Programa atual · 20:00"],
  ["cinema-24", "Cinema 24", "Programa atual · 20:00"],
  ["natureza-plus", "Natureza+", "Programa atual · 20:00"],
  ["mundo-kids", "Mundo Kids", "Programa atual"],
] as const;
const movies = [
  [
    "alem-veu-1",
    "Horizonte de Âmbar",
    "2024 · 2h 08min",
    "from-[#30475d] to-[#171510]",
  ],
  [
    "rota-norte-1",
    "Rota Norte",
    "2021 · 1h 55min",
    "from-[#78502a] to-[#171510]",
  ],
  [
    "arquivo-zero-1",
    "Arquivo Zero",
    "2023 · 1h 42min",
    "from-[#78502a] to-[#171510]",
  ],
  [
    "mare-alta-1",
    "Maré Alta",
    "2024 · 1h 48min",
    "from-[#30475d] to-[#171510]",
  ],
] as const;
const series = [
  [
    "alem-do-veu-1",
    "Cidade Velada",
    "T1:E4 · 22 min",
    "from-[#30475d] to-[#171510]",
  ],
  [
    "rota-norte-1",
    "Rota Norte",
    "T1:E6 · 42 min",
    "from-[#78502a] to-[#171510]",
  ],
  [
    "neon-selvagem-1",
    "Neon Selvagem",
    "2 temporadas",
    "from-[#30475d] to-[#171510]",
  ],
] as const;

function FavoriteButton({
  id,
  active,
  onToggle,
}: {
  id: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-label={`${active ? "Remover" : "Adicionar"} ${id} dos favoritos`}
      aria-pressed={active}
      className="grid size-9 shrink-0 place-items-center rounded-full text-gold-bright transition-colors hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-focus"
      onClick={onToggle}
      type="button"
    >
      <Heart className={`size-4 ${active ? "fill-current" : ""}`} />
    </button>
  );
}

function EmptyFavorites({ kind }: { kind: Tab }) {
  const label = tabs
    .find((tab) => tab.kind === kind)
    ?.label.toLocaleLowerCase();
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-panel/40 px-5 text-center">
      <Heart aria-hidden="true" className="mb-3 size-7 text-muted" />
      <h2 className="m-0 font-display text-lg font-bold text-text">
        Nenhum favorito em {label}
      </h2>
      <p className="mt-2 mb-0 max-w-[360px] text-sm text-muted">
        Toque no coração em um conteúdo para adicioná-lo à sua lista.
      </p>
    </div>
  );
}

function ChannelList({
  ids,
  onToggle,
}: {
  ids: Set<string>;
  onToggle: (kind: FavoriteKind, id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {channels
        .filter(([id]) => ids.has(id))
        .map(([id, name, current], index) => (
          <article
            className="flex min-w-0 items-center gap-3 rounded-[10px] border border-line bg-panel p-2.5"
            key={id}
          >
            <span
              className={`grid size-[46px] shrink-0 place-items-center rounded-lg text-xs font-extrabold text-white/70 ${index % 2 ? "bg-[#68431f]" : "bg-[#263b4a]"}`}
            >
              TV
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-sm font-bold text-text">
                {name}
              </strong>
              <span className="mt-1 block truncate text-[11px] text-muted">
                {current}
              </span>
            </span>
            <FavoriteButton
              active
              id={name}
              onToggle={() => onToggle("channel", id)}
            />
          </article>
        ))}
    </div>
  );
}

function MediaGrid({
  kind,
  ids,
  onToggle,
}: {
  kind: "movie" | "series";
  ids: Set<string>;
  onToggle: (kind: FavoriteKind, id: string) => void;
}) {
  const items = kind === "movie" ? movies : series;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {items
        .filter(([id]) => ids.has(id))
        .map(([id, title, meta, accent]) => (
          <article
            className={`group relative flex h-[230px] min-w-0 flex-col justify-end overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br p-3.5 ${accent}`}
            key={id}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/5" />
            <Link
              aria-label={`Abrir ${title}`}
              className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-focus"
              params={kind === "movie" ? { movieId: id } : { seriesId: id }}
              to={
                kind === "movie"
                  ? "/app/movies/$movieId"
                  : "/app/series/$seriesId"
              }
            />
            <div className="relative min-w-0">
              <h2 className="truncate text-sm font-bold text-text">{title}</h2>
              <p className="mt-1 mb-0 truncate text-[11px] text-[#d0c8bb]">
                {meta}
              </p>
            </div>
            <span className="relative self-end">
              <FavoriteButton
                active
                id={title}
                onToggle={() => onToggle(kind, id)}
              />
            </span>
          </article>
        ))}
    </div>
  );
}

export function FavoritesPage() {
  const [tab, setTab] = useState<Tab>("channel");
  const { favorites, toggleFavorite } = useFavorites();
  const ids = new Set(
    favorites
      .filter((favorite) => favorite.kind === tab)
      .map((favorite) => favorite.id),
  );
  const count = (kind: Tab) =>
    favorites.filter((favorite) => favorite.kind === kind).length;

  return (
    <AppLayout>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:gap-6 lg:px-[30px] lg:pb-10">
        <AppHeader />
        <div className="flex items-center justify-between gap-4">
          <h1 className="m-0 font-display text-[28px] font-bold tracking-[-0.05em] text-text sm:text-[30px]">
            Favoritos
          </h1>
          <button
            aria-label="Abrir menu"
            className="text-text lg:hidden"
            type="button"
          >
            <Menu className="size-5" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map(({ kind, label }) => (
            <button
              aria-pressed={tab === kind}
              className={`h-9 shrink-0 rounded-[9px] border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-focus ${tab === kind ? "border-gold bg-[#3a2b16] text-text" : "border-line bg-panel text-muted hover:border-gold/60 hover:text-text"}`}
              key={kind}
              onClick={() => setTab(kind)}
              type="button"
            >
              <span className="sm:hidden">{label}</span>
              <span className="hidden sm:inline">
                {label} {count(kind)}
              </span>
            </button>
          ))}
        </div>
        {tab === "channel" && (
          <>
            <section className="hidden flex-col gap-3 lg:flex">
              <h2 className="m-0 font-display text-[20px] font-bold text-text">
                Continuar assistindo
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {[
                  ["Horizonte de Âmbar", "42 min restantes"],
                  ["Cidade Velada", "T1:E4 · 22 min"],
                  ["Rota Norte", "42 min restantes"],
                  ["Arquivo Zero", "42 min restantes"],
                ].map(([title, meta], index) => (
                  <article
                    className={`flex h-[230px] flex-col justify-end rounded-xl bg-gradient-to-br p-3.5 ${index % 2 ? "from-[#78502a] to-[#171510]" : "from-[#30475d] to-[#171510]"}`}
                    key={title}
                  >
                    <h3 className="m-0 truncate text-sm font-bold text-text">
                      {title}
                    </h3>
                    <p className="mt-1 mb-0 text-[11px] text-muted">{meta}</p>
                    <span className="mt-2 h-1 rounded-full bg-gold" />
                  </article>
                ))}
              </div>
            </section>
            <section className="flex flex-col gap-3">
              <h2 className="m-0 font-display text-[20px] font-bold text-text">
                Canais
              </h2>
              {ids.size ? (
                <ChannelList ids={ids} onToggle={toggleFavorite} />
              ) : (
                <EmptyFavorites kind="channel" />
              )}
            </section>
          </>
        )}
        {tab !== "channel" &&
          (ids.size ? (
            <MediaGrid ids={ids} kind={tab} onToggle={toggleFavorite} />
          ) : (
            <EmptyFavorites kind={tab} />
          ))}
      </div>
    </AppLayout>
  );
}
