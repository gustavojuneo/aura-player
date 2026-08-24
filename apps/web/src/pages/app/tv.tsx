import { useNavigate } from "@tanstack/react-router";
import { Heart, Play, Radio } from "lucide-react";

import { Button, ProductState, SearchField } from "../../components/ui";
import { useCatalogState } from "../../hooks/use-catalog-state";
import { useFavorites } from "../../services/favorites";
import { AppHeader, AppLayout } from "./app-shell";

type Channel = {
  current: string;
  id: string;
  name: string;
};

const categories = [
  ["Todos", "186"],
  ["Notícias", "24"],
  ["Esportes", "38"],
  ["Filmes", "31"],
  ["Infantil", "18"],
  ["Documentários", "12"],
] as const;

const channels: Channel[] = [
  { current: "Final 38'", id: "arena-sports", name: "Arena Sports" },
  { current: "Programa 20:00", id: "prime-news", name: "Prime News" },
  { current: "Programa 20:00", id: "cinema-24", name: "Cinema 24" },
  { current: "Programa 20:00", id: "mundo-kids", name: "Mundo Kids" },
  { current: "Programa 20:00", id: "natureza-plus", name: "Natureza+" },
  { current: "Programa 20:00", id: "canal-uno", name: "Canal Uno" },
];

function ChannelRow({
  channel,
  favorite,
  onToggle,
}: {
  channel: Channel;
  favorite: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-pressed={favorite}
      className={`flex min-w-0 items-center gap-3 rounded-[11px] border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-focus ${favorite ? "border-gold bg-[#3b2d18]" : "border-line bg-panel hover:border-gold/50"}`}
      onClick={onToggle}
      type="button"
    >
      <span className="grid size-[46px] shrink-0 place-items-center rounded-[9px] bg-panel-2 text-muted">
        <Radio aria-hidden="true" className="size-5" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-bold text-text">
          {channel.name}
        </strong>
        <span className="mt-1 block truncate text-[11px] text-muted">
          {channel.current}
        </span>
      </span>
      <Heart
        aria-hidden="true"
        className={`size-5 shrink-0 ${favorite ? "fill-gold text-gold" : "text-gold-bright"}`}
        strokeWidth={1.8}
      />
    </button>
  );
}

function CategoryList() {
  return (
    <aside className="rounded-xl bg-search p-3 lg:w-[190px] lg:shrink-0">
      <h2 className="m-0 px-2 pb-2 text-[11px] font-extrabold tracking-[0.08em] text-muted">
        CATEGORIAS
      </h2>
      <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {categories.map(([label, count]) => (
          <button
            className={`flex h-10 shrink-0 items-center rounded-[9px] px-3 text-left text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-focus ${label === "Esportes" ? "bg-[#3a2b16] font-bold text-text" : "text-muted hover:bg-panel hover:text-text"}`}
            key={label}
            type="button"
          >
            {label} {count}
          </button>
        ))}
      </div>
    </aside>
  );
}

function ProgramPanel() {
  const navigate = useNavigate();
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-xl bg-panel p-4 sm:p-[18px] lg:flex-1">
      <div className="flex h-[190px] items-center justify-center rounded-xl bg-gradient-to-br from-[#74451f] to-[#191713] sm:h-[230px]">
        <span className="grid size-11 place-items-center rounded-full bg-black/20 text-text">
          <Play aria-hidden="true" className="ml-0.5 size-5 fill-current" />
        </span>
      </div>
      <div>
        <h2 className="m-0 font-display text-[21px] font-bold tracking-[-0.04em] text-text">
          Arena Sports
        </h2>
        <p className="m-1.5 mb-0 text-sm font-bold text-gold-bright">
          Final continental
        </p>
        <p className="m-1.5 mb-0 text-xs text-muted">
          20:00 <span className="text-line">·</span> 22:15
          <span className="text-line"> · </span>38 decorridos
        </p>
      </div>
      <Button
        className="h-10 self-start px-4 text-xs"
        onClick={() =>
          void navigate({
            to: "/app/tv/$channelId/watch",
            params: { channelId: "arena-sports" },
          })
        }
        variant="primary"
      >
        <Play aria-hidden="true" className="size-4 fill-current" />
        Assistir ao vivo
      </Button>
    </section>
  );
}

export function TvPage() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isLoading, retry } = useCatalogState();

  return (
    <AppLayout>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:gap-6 lg:px-[30px] lg:pb-10">
        <AppHeader>
          <SearchField
            aria-label="Buscar no catálogo"
            className="max-w-[420px]"
            placeholder="Buscar filmes, séries e canais"
          />
        </AppHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="m-0 font-display text-[28px] font-bold tracking-[-0.05em] text-text">
            TV ao vivo
          </h1>
          <SearchField
            aria-label="Buscar canais"
            className="h-11 w-full sm:max-w-[320px]"
            placeholder="Buscar canais, programas..."
          />
        </div>
        {isLoading ? (
          <ProductState
            action={{ label: "Tentar novamente", onClick: retry }}
            className="min-h-[420px] justify-center"
            kind="loading"
          />
        ) : (
          <div className="flex min-h-0 flex-col gap-3 lg:flex-row lg:items-stretch">
            <CategoryList />
            <div className="flex min-w-0 flex-col gap-2 lg:w-[500px] lg:shrink-0">
              {channels.map((channel) => (
                <ChannelRow
                  channel={channel}
                  favorite={isFavorite("channel", channel.id)}
                  key={channel.id}
                  onToggle={() => toggleFavorite("channel", channel.id)}
                />
              ))}
            </div>
            <ProgramPanel />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
