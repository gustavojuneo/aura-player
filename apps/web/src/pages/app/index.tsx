import { ChevronRight, Info } from "lucide-react";
import type { ReactNode } from "react";

import {
  Button,
  LiveBadge,
  ProductState,
  ProgressBar,
  SearchField,
} from "../../components/ui";
import {
  useCatalogItems,
  useCatalogSources,
} from "../../hooks/use-catalog-data";
import { AppHeader, AppLayout, Icon } from "./app-shell";

type ContentCard = {
  accent: string;
  category?: string;
  meta: string;
  progress?: number;
  title: string;
};

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="m-0 font-display text-[18px] font-semibold tracking-[-0.03em] text-text">
        {children}
      </h2>
      <button
        className="shrink-0 text-xs font-bold text-gold-bright hover:text-text"
        type="button"
      >
        Ver tudo{" "}
        <ChevronRight
          aria-hidden="true"
          className="inline size-4 align-[-3px]"
        />
      </button>
    </div>
  );
}

function ContentCardView({
  card,
  compact = false,
}: {
  card: ContentCard;
  compact?: boolean;
}) {
  return (
    <article
      className={`group relative flex shrink-0 flex-col justify-end overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br ${card.accent} p-3.5 transition-transform hover:-translate-y-1 ${compact ? "h-[110px] w-[calc((100%-36px)/4)] min-w-[180px]" : "h-[210px] w-[calc((100%-36px)/4)] min-w-[190px]"}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-white/5" />
      {card.category && (
        <span className="relative mb-auto self-start">
          <LiveBadge />
        </span>
      )}
      <div className="relative">
        {card.title ? (
          <h3 className="m-0 truncate text-sm font-bold text-text">
            {card.title}
          </h3>
        ) : (
          <div className="relative">
            <ProductState compact kind="metadata" />
          </div>
        )}
        <p className="m-1.5 truncate text-[11px] text-[#d0c8bb]">{card.meta}</p>
        {card.progress !== undefined && (
          <ProgressBar className="h-1" value={card.progress} />
        )}
      </div>
      <button
        aria-label={`Assistir ${card.title}`}
        className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/30 text-text opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-focus"
        type="button"
      >
        <Icon className="size-4" name="play" />
      </button>
    </article>
  );
}

function FeaturedHero({ title }: { title: string }) {
  return (
    <section className="relative isolate flex min-h-[250px] overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#5f4c43] via-[#273c4d] to-[#171510] p-6 md:min-h-[240px] md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(227,168,59,0.18),transparent_30%),linear-gradient(90deg,rgba(22,19,15,0.96),rgba(22,19,15,0.2))]" />
      <div className="relative flex max-w-[510px] flex-col items-start justify-end gap-3">
        <p className="m-0 text-[11px] font-extrabold tracking-[0.1em] text-gold-bright">
          EM DESTAQUE
        </p>
        <h1 className="m-0 font-display text-[28px] font-bold leading-tight tracking-[-0.05em] text-text md:text-[35px]">
          {title}
        </h1>
        <p className="m-0 max-w-[470px] text-sm leading-[1.45] text-[#ddd5c8]">
          Uma expedição atravessa o último sinal conhecido para encontrar uma
          cidade que não deveria existir.
        </p>
        <div className="flex flex-wrap gap-2.5 pt-1">
          <Button className="h-11 px-5" variant="primary">
            <Icon className="size-4" name="play" /> Assistir
          </Button>
          <Button className="h-11 px-5" variant="secondary">
            <Info className="size-4" /> Ver detalhes
          </Button>
        </div>
      </div>
    </section>
  );
}

function ContentRail({
  cards,
  compact = false,
}: {
  cards: ContentCard[];
  compact?: boolean;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {cards.map((card) => (
        <ContentCardView card={card} compact={compact} key={card.title} />
      ))}
    </div>
  );
}

export function HomePage() {
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
  const { sources } = useCatalogSources();
  const isLoading = liveLoading || movieLoading;
  const retry = () => {
    retryLive();
    retryMovies();
  };
  const recentChannels: ContentCard[] = liveItems.slice(0, 8).map((item) => ({
    accent: "from-[#33526a] to-[#171510]",
    category: "AO VIVO",
    meta: item.groupTitle ?? "Ao vivo",
    title: item.title,
  }));
  const featuredMovies: ContentCard[] = movieItems.slice(0, 8).map((item) => ({
    accent: "from-[#6f4b39] to-[#171510]",
    meta: item.year ? String(item.year) : "Filme",
    title: item.title,
  }));

  return (
    <AppLayout>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:gap-5 lg:px-8 lg:pb-10">
        <AppHeader>
          <SearchField
            aria-label="Buscar no catálogo"
            className="max-w-[420px]"
            placeholder="Buscar filmes, séries e canais"
          />
        </AppHeader>
        <p className="m-0 text-[13px] font-semibold text-muted">
          Boa noite <span className="text-line">·</span>{" "}
          {sources.find((source) => source.status === "ready")?.name ??
            "Nenhuma fonte ativa"}
        </p>
        {isLoading ? (
          <ProductState
            action={{ label: "Tentar novamente", onClick: retry }}
            className="min-h-[420px] justify-center"
            kind="loading"
          />
        ) : (
          <>
            <FeaturedHero title={movieItems[0]?.title ?? "Seu catálogo IPTV"} />
            <section className="flex flex-col gap-3">
              <SectionHeader>Continuar assistindo</SectionHeader>
              <ProductState
                className="min-h-[110px]"
                compact
                kind="catalog-empty"
              />
            </section>
            <section className="flex flex-col gap-3">
              <SectionHeader>Canais recentes</SectionHeader>
              {recentChannels.length ? (
                <ContentRail cards={recentChannels} compact />
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
                <ContentRail cards={featuredMovies} />
              ) : (
                <ProductState className="min-h-[210px]" kind="catalog-empty" />
              )}
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
