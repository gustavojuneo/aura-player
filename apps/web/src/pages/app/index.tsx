import { ChevronRight, Info } from "lucide-react";
import type { ReactNode } from "react";

import {
  Button,
  LiveBadge,
  ProgressBar,
  SearchField,
} from "../../components/ui";
import { AppHeader, AppLayout, Icon } from "./app-shell";

type ContentCard = {
  accent: string;
  category?: string;
  meta: string;
  progress?: number;
  title: string;
};

const continueWatching: ContentCard[] = [
  {
    accent: "from-[#30475d] via-[#243442] to-[#171510]",
    meta: "42 min restantes",
    progress: 61,
    title: "Último sinal",
  },
  {
    accent: "from-[#9b642e] via-[#78502a] to-[#171510]",
    meta: "Ao vivo · 21:10",
    title: "Arena 4K",
  },
  {
    accent: "from-[#526b76] via-[#243442] to-[#171510]",
    meta: "2024 · 14",
    progress: 34,
    title: "Cidade Velada",
  },
  {
    accent: "from-[#a77736] via-[#78502a] to-[#171510]",
    meta: "T1:E6",
    progress: 78,
    title: "Rota Norte",
  },
];

const recentChannels: ContentCard[] = [
  {
    accent: "from-[#8a5b2f] to-[#171510]",
    category: "AO VIVO",
    meta: "Notícias · Agora",
    title: "Jornal 24h",
  },
  {
    accent: "from-[#33526a] to-[#171510]",
    category: "AO VIVO",
    meta: "Esportes · 21:30",
    title: "Arena Sports",
  },
  {
    accent: "from-[#6e3f3c] to-[#171510]",
    category: "AO VIVO",
    meta: "Filmes · 22:00",
    title: "Cine Classic",
  },
  {
    accent: "from-[#566340] to-[#171510]",
    category: "AO VIVO",
    meta: "Documentários",
    title: "Mundo Aberto",
  },
];

const featuredMovies: ContentCard[] = [
  {
    accent: "from-[#6f4b39] to-[#171510]",
    meta: "2024 · 2h 08min",
    title: "Horizonte de Âmbar",
  },
  {
    accent: "from-[#455b68] to-[#171510]",
    meta: "2023 · 1h 52min",
    title: "Depois da Chuva",
  },
  {
    accent: "from-[#765c3c] to-[#171510]",
    meta: "2022 · 2h 14min",
    title: "O Último Farol",
  },
  {
    accent: "from-[#3c4f4e] to-[#171510]",
    meta: "2024 · 1h 47min",
    title: "Cidade Velada",
  },
];

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
        <h3 className="m-0 truncate text-sm font-bold text-text">
          {card.title}
        </h3>
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

function FeaturedHero() {
  return (
    <section className="relative isolate flex min-h-[250px] overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#5f4c43] via-[#273c4d] to-[#171510] p-6 md:min-h-[240px] md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(227,168,59,0.18),transparent_30%),linear-gradient(90deg,rgba(22,19,15,0.96),rgba(22,19,15,0.2))]" />
      <div className="relative flex max-w-[510px] flex-col items-start justify-end gap-3">
        <p className="m-0 text-[11px] font-extrabold tracking-[0.1em] text-gold-bright">
          EM DESTAQUE
        </p>
        <h1 className="m-0 font-display text-[28px] font-bold leading-tight tracking-[-0.05em] text-text md:text-[35px]">
          Horizonte de Âmbar
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
          Boa noite, Marina <span className="text-line">·</span> Casa ativa
        </p>
        <FeaturedHero />
        <section className="flex flex-col gap-3">
          <SectionHeader>Continuar assistindo</SectionHeader>
          <ContentRail cards={continueWatching} compact />
        </section>
        <section className="flex flex-col gap-3">
          <SectionHeader>Canais recentes</SectionHeader>
          <ContentRail cards={recentChannels} compact />
        </section>
        <section className="flex flex-col gap-3">
          <SectionHeader>Filmes em destaque</SectionHeader>
          <ContentRail cards={featuredMovies} />
        </section>
      </div>
    </AppLayout>
  );
}
