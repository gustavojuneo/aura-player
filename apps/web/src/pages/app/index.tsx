import {
  Bell,
  ChevronRight,
  Clapperboard,
  Clock3,
  Database,
  Heart,
  House,
  Info,
  type LucideIcon,
  Play,
  Radio,
  Search,
  Settings,
  Tv,
  User,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  Button,
  LiveBadge,
  ProgressBar,
  SearchField,
  SourceSelector,
} from "../../components/ui";

type IconName =
  | "bell"
  | "clapperboard"
  | "clock"
  | "database"
  | "heart"
  | "home"
  | "play"
  | "radio"
  | "search"
  | "settings"
  | "tv"
  | "user";

const icons: Record<IconName, LucideIcon> = {
  bell: Bell,
  clapperboard: Clapperboard,
  clock: Clock3,
  database: Database,
  heart: Heart,
  home: House,
  play: Play,
  radio: Radio,
  search: Search,
  settings: Settings,
  tv: Tv,
  user: User,
};

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

function Icon({
  name,
  className = "size-5",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />,
    clapperboard: <path d="m4 4 16 0M4 4v16h16V4M4 9h16M8 4l3 5m2-5 3 5" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="7.5" ry="3" />
        <path d="M4.5 5v7c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V5m-15 7v7c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-7" />
      </>
    ),
    heart: (
      <path d="M20.8 8.6c0 5.5-8.8 10.3-8.8 10.3S3.2 14.1 3.2 8.6A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.8 2.2Z" />
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7v10H3V10Z" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    play: <path d="m8 5 11 7-11 7V5Z" />,
    radio: (
      <>
        <circle cx="12" cy="12" r="2" />
        <path d="M5.6 5.6a9 9 0 0 0 0 12.8m12.8 0a9 9 0 0 0 0-12.8M2.8 2.8a13 13 0 0 0 0 18.4m18.4 0a13 13 0 0 0 0-18.4" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.4a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V14h-.2a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    tv: (
      <>
        <rect height="14" rx="2" width="18" x="3" y="5" />
        <path d="m8 2 4 3 4-3M8 19h8" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
  };

  void paths;
  const Component = icons[name];
  return (
    <Component aria-hidden="true" className={className} strokeWidth={1.8} />
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-7 place-items-center rounded-full bg-gold text-[10px] font-extrabold text-ink">
        A
      </span>
      <span className="font-display text-[19px] font-bold tracking-[-0.04em] text-text">
        AURA
      </span>
    </div>
  );
}

const navigation: Array<{ icon: IconName; label: string }> = [
  { icon: "home", label: "Início" },
  { icon: "radio", label: "TV ao vivo" },
  { icon: "clapperboard", label: "Filmes" },
  { icon: "tv", label: "Séries" },
  { icon: "heart", label: "Favoritos" },
  { icon: "clock", label: "Continuar assistindo" },
  { icon: "database", label: "Fontes IPTV" },
];

function NavigationItem({
  active,
  item,
}: {
  active?: boolean;
  item: (typeof navigation)[number];
}) {
  return (
    <button
      className={`flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${active ? "border border-gold/80 bg-[#3b2e18] text-text" : "border border-transparent text-muted hover:bg-panel hover:text-text"}`}
      type="button"
    >
      <Icon
        className={`size-5 shrink-0 ${active ? "text-gold-bright" : "text-muted"}`}
        name={item.icon}
      />
      <span className="truncate">{item.label}</span>
    </button>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-2 border-r border-line bg-[#11100d] p-[26px_18px] lg:flex">
      <Brand />
      <SourceSelector className="mt-5 w-full" />
      <nav
        aria-label="Navegação principal"
        className="mt-2 flex flex-col gap-1"
      >
        {navigation.map((item, index) => (
          <NavigationItem active={index === 0} item={item} key={item.label} />
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1">
        <NavigationItem item={{ icon: "settings", label: "Configurações" }} />
        <button
          className="mt-3 flex items-center gap-2 border-t border-line px-3 pt-4 text-xs font-semibold text-muted hover:text-text"
          type="button"
        >
          <span className="grid size-8 place-items-center rounded-full bg-gold text-xs font-extrabold text-ink">
            M
          </span>
          <span className="truncate">Marina</span>
        </button>
      </div>
    </aside>
  );
}

function MobileNavigation() {
  const items = navigation.slice(0, 5);
  return (
    <nav
      aria-label="Navegação mobile"
      className="fixed inset-x-0 bottom-0 z-20 flex h-[72px] items-center justify-around border-t border-line bg-[#16140fF2] px-2 backdrop-blur-lg lg:hidden"
    >
      {items.map((item, index) => (
        <button
          className={`flex w-16 flex-col items-center gap-1 text-[10px] font-semibold ${index === 0 ? "text-gold-bright" : "text-muted"}`}
          key={item.label}
          type="button"
        >
          {index === 2 ? (
            <Search className="size-5" strokeWidth={1.8} />
          ) : (
            <Icon className="size-5" name={item.icon} />
          )}
          {index === 1 ? "Ao vivo" : index === 2 ? "Buscar" : item.label}
        </button>
      ))}
    </nav>
  );
}

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
    <main className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:gap-5 lg:px-8 lg:pb-10">
          <header className="flex h-12 items-center justify-between gap-4">
            <div className="lg:hidden">
              <Brand />
            </div>
            <SearchField
              aria-label="Buscar no catálogo"
              className="hidden max-w-[420px] flex-1 md:flex"
              placeholder="Buscar filmes, séries e canais"
            />
            <div className="ml-auto flex items-center gap-4 text-muted">
              <button aria-label="Buscar" className="md:hidden" type="button">
                <Icon name="search" />
              </button>
              <button
                aria-label="Notificações"
                className="hidden sm:block"
                type="button"
              >
                <Icon name="bell" />
              </button>
              <span className="grid size-9 place-items-center rounded-full bg-gold text-xs font-extrabold text-ink">
                M
              </span>
            </div>
          </header>
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
      </div>
      <MobileNavigation />
    </main>
  );
}
