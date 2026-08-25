import { useNavigate } from "@tanstack/react-router";
import { Heart, Play, Radio } from "lucide-react";
import { useMemo, useState } from "react";

import { Button, ScrollArea, SearchField } from "../../components/ui";
import { useCatalogItems } from "../../hooks/use-catalog-data";
import { useCatalogState } from "../../hooks/use-catalog-state";
import { useFavorites } from "../../services/favorites";
import { AppHeader, AppLayout } from "./app-shell";
import { LivePageSkeleton } from "./components/catalog-skeleton";
import {
  CategoryDialog,
  CategoryFilterTrigger,
} from "./components/category-dialog";

type Channel = {
  current: string;
  id: string;
  name: string;
  logoUrl?: string;
};

function ChannelRow({
  channel,
  favorite,
  onToggle,
  onWatch,
}: {
  channel: Channel;
  favorite: boolean;
  onToggle: () => void;
  onWatch: () => void;
}) {
  return (
    <button
      aria-pressed={favorite}
      className={`flex min-w-0 items-center gap-3 rounded-[11px] border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-focus ${favorite ? "border-gold bg-[#3b2d18]" : "border-line bg-panel hover:border-gold/50"}`}
      onClick={onWatch}
      type="button"
    >
      <span className="grid size-[46px] shrink-0 place-items-center overflow-hidden rounded-[9px] bg-panel-2 text-muted">
        {channel.logoUrl ? (
          <img
            alt=""
            className="size-full object-cover"
            decoding="async"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            referrerPolicy="no-referrer"
            src={channel.logoUrl}
          />
        ) : (
          <Radio aria-hidden="true" className="size-5" strokeWidth={1.8} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-bold text-text">
          {channel.name}
        </strong>
        <span className="mt-1 block truncate text-[11px] text-muted">
          {channel.current}
        </span>
      </span>
      <button
        aria-label={
          favorite
            ? `Remover ${channel.name} dos favoritos`
            : `Favoritar ${channel.name}`
        }
        className="shrink-0 rounded-md p-1 focus-visible:outline-2 focus-visible:outline-focus"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        type="button"
      >
        <Heart
          aria-hidden="true"
          className={`size-5 shrink-0 ${favorite ? "fill-gold text-gold" : "text-gold-bright"}`}
          strokeWidth={1.8}
        />
      </button>
    </button>
  );
}

function CategoryList({
  categories,
  className,
  selected,
  onSelect,
}: {
  categories: Array<[string, number]>;
  className?: string;
  selected: string;
  onSelect: (category: string) => void;
}) {
  return (
    <aside
      className={`sticky top-20 mb-6 h-[calc(100dvh-8rem)] overflow-hidden rounded-xl bg-search lg:w-[250px] lg:shrink-0 ${className ?? ""}`}
    >
      <h2 className="m-0 shrink-0 px-6 pt-3 pb-2 text-[11px] font-extrabold tracking-[0.08em] text-muted">
        CATEGORIAS
      </h2>
      <ScrollArea
        className="h-[calc(100%-2.5rem)]"
        contentClassName="px-3 pt-0 pb-3 pr-6"
      >
        <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {categories.map(([label, count]) => (
            <button
              className={`flex min-h-10 h-auto shrink-0 items-center rounded-[9px] px-3 py-2 text-left text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-focus ${label === selected ? "bg-[#3a2b16] font-bold text-text" : "text-muted hover:bg-panel hover:text-text"}`}
              key={label}
              onClick={() => onSelect(label)}
              type="button"
            >
              <span className="min-w-0 break-words">
                {label} {count}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}

function ProgramPanel({ channel }: { channel?: Channel }) {
  const navigate = useNavigate();
  return (
    <section className="sticky top-20 hidden min-w-0 self-start flex-col gap-3 rounded-xl bg-panel p-4 sm:p-[18px] lg:flex lg:flex-1">
      <div className="flex h-[190px] items-center justify-center rounded-xl bg-gradient-to-br from-[#74451f] to-[#191713] sm:h-[230px]">
        <span className="grid size-11 place-items-center rounded-full bg-black/20 text-text">
          <Play aria-hidden="true" className="ml-0.5 size-5 fill-current" />
        </span>
      </div>
      <div>
        <h2 className="m-0 font-display text-[21px] font-bold tracking-[-0.04em] text-text">
          {channel?.name ?? "Selecione um canal"}
        </h2>
        <p className="m-1.5 mb-0 text-sm font-bold text-gold-bright">
          {channel?.current ?? "Nenhum canal selecionado"}
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
            params: { channelId: channel?.id ?? "" },
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
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isLoading } = useCatalogState();
  const { items } = useCatalogItems("live");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const categories = useMemo<Array<[string, number]>>(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const group = item.groupTitle ?? item.categories?.[0] ?? "Sem categoria";
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
    return [["Todos", items.length], ...counts.entries()];
  }, [items]);
  const visibleChannels = useMemo<Channel[]>(() => {
    const importedChannels = items.map((item) => ({
      current: item.groupTitle ?? item.categories?.[0] ?? "Sem categoria",
      id: item.id,
      logoUrl: item.logoUrl,
      name: item.title,
    }));
    return importedChannels.filter(
      (channel) =>
        channel.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()) &&
        (category === "Todos" || channel.current === category),
    );
  }, [category, items, query]);

  return (
    <AppLayout fixedViewport>
      <div className="flex h-dvh w-full flex-col gap-5 overflow-hidden px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:gap-6 lg:px-[30px] lg:pb-10">
        <AppHeader className="sticky top-0 z-30 -mx-4 bg-bg/95 px-4 py-2 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-[30px] lg:px-[30px]">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <h1 className="hidden min-w-0 truncate font-display text-[28px] font-bold tracking-[-0.05em] text-text md:block">
              TV ao vivo
            </h1>
            <SearchField
              aria-label="Buscar canais"
              className="hidden h-11 w-[320px] lg:flex"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar canais, programas..."
              value={query}
            />
          </div>
        </AppHeader>
        <div className="md:hidden">
          <h1 className="m-0 font-display text-[28px] font-bold tracking-[-0.05em] text-text">
            TV ao vivo
          </h1>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.slice(0, 3).map(([label]) => (
            <button
              aria-pressed={category === label}
              className={`h-9 shrink-0 rounded-[9px] border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-focus ${category === label ? "border-gold bg-[#3a2b16] text-text" : "border-line bg-panel text-text hover:border-gold/60"}`}
              key={label}
              onClick={() => setCategory(label)}
              type="button"
            >
              {label}
            </button>
          ))}
          <CategoryFilterTrigger onClick={() => setCategoryDialogOpen(true)} />
        </div>
        {isLoading ? (
          <LivePageSkeleton />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch">
            <CategoryList
              categories={categories}
              className="hidden lg:block"
              onSelect={setCategory}
              selected={category}
            />
            <ScrollArea className="h-[calc(100dvh-8rem)] min-h-0 min-w-0 flex-1 lg:w-[500px] lg:flex-none">
              <div className="flex flex-col gap-2">
                {visibleChannels.map((channel) => (
                  <ChannelRow
                    channel={channel}
                    favorite={isFavorite("channel", channel.id)}
                    key={channel.id}
                    onToggle={() => toggleFavorite("channel", channel.id)}
                    onWatch={() =>
                      void navigate({
                        to: "/app/tv/$channelId/watch",
                        params: { channelId: channel.id },
                      })
                    }
                  />
                ))}
              </div>
            </ScrollArea>
            <ProgramPanel channel={visibleChannels[0]} />
          </div>
        )}
      </div>
      {categoryDialogOpen && (
        <CategoryDialog
          categories={categories.map(([label]) => label)}
          onClose={() => setCategoryDialogOpen(false)}
          onSelect={setCategory}
          selected={category}
        />
      )}
    </AppLayout>
  );
}
