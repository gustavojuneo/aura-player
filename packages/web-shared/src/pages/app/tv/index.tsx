import { useNavigate } from "@tanstack/react-router";
import type Hls from "hls.js";
import {
  Heart,
  LoaderCircle,
  Play,
  Radio,
  Volume2,
  VolumeX,
} from "lucide-react";
import type mpegts from "mpegts.js";
import { useEffect, useRef, useState } from "react";
import { LivePageSkeleton } from "../../../components/catalog-skeleton";
import {
  CategoryDialog,
  CategoryFilterTrigger,
} from "../../../components/category-dialog";
import {
  AllChannelsGuide,
  ProgramGuide,
} from "../../../components/program-guide";
import { ScrollArea, SearchField } from "../../../components/ui";
import type {
  CatalogItem,
  EpgProgram,
} from "../../../features/catalog/catalog";
import {
  useCatalogItems,
  useXtreamEpg,
  useXtreamEpgForChannels,
} from "../../../hooks/use-catalog-data";
import { useInfiniteCatalog } from "../../../hooks/use-infinite-catalog";
import { usePlaybackSource } from "../../../hooks/use-playback-source";
import { useSearchShortcut } from "../../../hooks/use-search-shortcut";
import { useFavorites } from "../../../services/favorites";
import { markPlaybackNavigation } from "../../../services/playback-autoplay";
import { usePlaybackPreferences } from "../../../services/playback-preferences";
import { AppHeader } from "../components";

type Channel = {
  current: string;
  delivery: CatalogItem["delivery"];
  id: string;
  name: string;
  providerId?: string;
  logoUrl?: string;
  sourceId: string;
  streamUrl: string;
  variantCount?: number;
};

function channelGroupName(name: string) {
  return (
    name
      .replace(
        /\s*(?:\(|\[)?\s*(?:8K|4K|UHD|FHD|QHD|HD|SD)\s*(?:\)|\])?\s*$/i,
        "",
      )
      .replace(/\s{2,}/g, " ")
      .trim() || name
  );
}

function ChannelRow({
  channel,
  favorite,
  onToggle,
  onSelect,
  selected,
}: {
  channel: Channel;
  favorite: boolean;
  onToggle: () => void;
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <article
      className={`relative grid min-h-[4.75rem] w-full max-w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 rounded-[11px] border border-line bg-panel p-2.5 text-left transition-colors hover:border-gold/50 ${selected ? "!border-gold !bg-[#3b2d18] shadow-[inset_3px_0_0_#e3a83b]" : ""}`}
      data-tv-channel-row="true"
    >
      <button
        aria-current={selected ? "true" : undefined}
        className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-2.5 text-left"
        data-tv-navigation-zone="catalog-items"
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Yellow" || event.keyCode === 405) {
            event.preventDefault();
            event.stopPropagation();
            onToggle();
          }
        }}
        type="button"
      >
        <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-[9px] bg-panel-2 text-muted">
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
          <strong className="block truncate text-[clamp(0.875rem,1vw,1rem)] font-bold text-text">
            {channel.name}
          </strong>
          <span className="mt-0.5 block truncate text-[clamp(0.75rem,0.85vw,0.875rem)] text-muted">
            {channel.current}
            {channel.variantCount && channel.variantCount > 1
              ? ` · ${channel.variantCount} versões`
              : ""}
          </span>
        </span>
      </button>
      <span
        aria-label={
          favorite
            ? `${channel.name} está nos favoritos`
            : `${channel.name} não está nos favoritos. Use a tecla amarela para favoritar`
        }
        className="grid size-9 shrink-0 place-items-center rounded-md p-1"
        role="img"
      >
        <Heart
          aria-hidden="true"
          className={`size-5 shrink-0 ${favorite ? "fill-gold text-gold" : "text-gold-bright"}`}
          strokeWidth={1.8}
        />
      </span>
    </article>
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
      className={`sticky top-20 mb-6 h-[calc(100vh-8rem)] overflow-hidden rounded-xl bg-search lg:w-auto lg:shrink-0 lg:basis-[27%] ${className ?? ""}`}
      data-tv-navigation-region="catalog-categories"
    >
      <h2 className="m-0 shrink-0 px-6 pt-3 pb-2 text-[0.6875rem] font-extrabold tracking-[0.08em] text-muted">
        CATEGORIAS
      </h2>
      <ScrollArea
        className="h-[calc(100%-2.5rem)]"
        contentClassName="px-3 pt-2 pb-3 pr-6"
      >
        <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {categories.map(([label, count]) => (
            <button
              className={`flex min-h-10 h-auto shrink-0 items-center justify-between gap-3 rounded-[9px] px-3 py-2 text-left text-[0.8125rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-focus ${label === selected ? "bg-[#3a2b16] font-bold text-text" : "text-muted hover:bg-panel hover:text-text"}`}
              data-tv-navigation-zone="catalog-categories"
              key={label}
              onClick={() => onSelect(label)}
              type="button"
            >
              <span className="min-w-0 break-words">{label}</span>
              <span className="shrink-0 text-xs font-bold text-muted">
                {count}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}

function ChannelPreview({
  channel,
  onOpen,
}: {
  channel?: Channel;
  onOpen: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const engineRef = useRef<Hls | mpegts.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { preferences, updatePreference } = usePlaybackPreferences();
  const playbackSource = usePlaybackSource(
    channel?.streamUrl,
    Boolean(channel?.streamUrl),
  );
  const previewError = hasError || Boolean(playbackSource.error);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackSource.source || !channel) return;
    const url = playbackSource.source;
    const cleanEngine = () => {
      const engine = engineRef.current;
      if (engine && "detachMediaElement" in engine) {
        engine.pause();
        engine.unload();
        engine.detachMediaElement();
        engine.destroy();
      }
      engineRef.current = null;
      video.pause();
      video.removeAttribute("src");
      video.load();
    };

    cleanEngine();
    setIsReady(false);
    setHasError(false);
    video.muted = preferences.previewMuted;
    video.volume = 1;
    setIsMuted(preferences.previewMuted);

    const play = () => {
      void video.play().catch(() => undefined);
    };
    const fail = () => setHasError(true);

    if (channel.delivery === "hls") {
      void import("hls.js")
        .then(({ default: Hls }) => {
          if (!Hls.isSupported()) {
            fail();
            return;
          }
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          engineRef.current = hls;
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) fail();
          });
          hls.on(Hls.Events.MANIFEST_PARSED, play);
          hls.attachMedia(video);
          hls.loadSource(url);
        })
        .catch(fail);
    } else if (channel.delivery === "mpeg-ts") {
      void import("mpegts.js")
        .then(({ default: mpegts }) => {
          if (!mpegts.isSupported()) {
            fail();
            return;
          }
          const player = mpegts.createPlayer({
            type: "mpegts",
            isLive: true,
            url,
          });
          engineRef.current = player;
          player.on(mpegts.Events.ERROR, fail);
          player.attachMediaElement(video);
          player.load();
          void Promise.resolve(player.play()).catch(() => undefined);
        })
        .catch(fail);
    } else {
      video.src = url;
      video.addEventListener("loadedmetadata", play, { once: true });
    }

    return () => cleanEngine();
  }, [channel, playbackSource.source, preferences.previewMuted]);

  return (
    <div className="group relative flex aspect-video min-w-0 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#74451f] to-[#191713]">
      <video
        aria-label={channel?.name ?? "Preview do canal"}
        className={`absolute size-full object-cover ${isReady ? "opacity-100" : "opacity-0"}`}
        playsInline
        onCanPlay={() => setIsReady(true)}
        ref={videoRef}
      >
        <track
          kind="captions"
          label="Português"
          src="data:text/vtt,WEBVTT"
          srcLang="pt-BR"
        />
      </video>
      {channel?.logoUrl && !isReady && (
        <img
          alt=""
          className="absolute size-full object-contain p-10 opacity-35"
          decoding="async"
          src={channel.logoUrl}
        />
      )}
      {(playbackSource.isLoading || (channel && !isReady && !previewError)) && (
        <LoaderCircle
          aria-hidden="true"
          className="size-8 animate-spin text-text"
        />
      )}
      {previewError && (
        <span className="px-5 text-center text-xs text-muted">
          Preview indisponível. Clique para abrir o canal.
        </span>
      )}
      {channel && !playbackSource.isLoading && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/65 px-2.5 py-1 text-[0.5625rem] font-extrabold tracking-[0.08em] text-text">
          ● AO VIVO
        </span>
      )}
      <button
        data-tv-preview-player="true"
        aria-label={
          channel ? `Assistir ${channel.name}` : "Nenhum canal selecionado"
        }
        className="absolute inset-0 grid place-items-center focus-visible:outline-2 focus-visible:outline-focus"
        disabled={!channel}
        onClick={onOpen}
        type="button"
      >
        <span className="grid size-11 place-items-center rounded-full bg-black/45 text-text opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Play aria-hidden="true" className="ml-0.5 size-5 fill-current" />
        </span>
      </button>
      {channel && (
        <button
          aria-label={isMuted ? "Ativar som do preview" : "Silenciar preview"}
          className="absolute right-3 bottom-3 z-20 grid size-9 place-items-center rounded-full bg-black/65 text-text transition-colors hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-focus"
          onClick={(event) => {
            event.stopPropagation();
            const video = videoRef.current;
            if (!video) return;
            video.muted = !video.muted;
            setIsMuted(video.muted);
            updatePreference("previewMuted", video.muted);
          }}
          type="button"
        >
          {isMuted ? (
            <VolumeX aria-hidden="true" className="size-4" />
          ) : (
            <Volume2 aria-hidden="true" className="size-4" />
          )}
        </button>
      )}
    </div>
  );
}

function ProgramPanel({
  channel,
  guides,
  isEpgLoading,
}: {
  channel?: Channel;
  guides: Array<{ channel: string; programs: EpgProgram[] }>;
  isEpgLoading: boolean;
}) {
  const navigate = useNavigate();
  const watchChannel = () => {
    if (!channel) return;
    markPlaybackNavigation();
    void navigate({
      to: "/app/tv/$channelId/watch",
      params: { channelId: channel.id },
    });
  };
  const epg = useXtreamEpg(
    channel?.sourceId,
    channel?.providerId,
    channel?.name,
  );

  return (
    <section
      className="sticky top-20 hidden min-h-0 min-w-0 self-start flex-col gap-3 overflow-hidden rounded-xl bg-panel p-4 sm:p-[18px] lg:flex lg:h-[calc(100vh-8rem)] lg:w-auto lg:flex-none lg:basis-[38%]"
      data-tv-navigation-region="catalog-preview"
    >
      {channel ? (
        <>
          <ChannelPreview channel={channel} onOpen={watchChannel} />
          <div className="shrink-0">
            <h2 className="m-0 font-display text-[1.312rem] font-bold tracking-[-0.04em] text-text">
              {channel.name}
            </h2>
            <div className="mt-1.5 flex min-w-0 items-center justify-between gap-3">
              <p className="m-0 min-w-0 truncate text-sm font-bold text-gold-bright">
                {channel.current}
              </p>
              <p className="m-0 shrink-0 text-xs text-muted">
                20:00 <span className="text-line">·</span> 22:15
                <span className="text-line"> · </span>38 decorridos
              </p>
            </div>
          </div>
          <ProgramGuide
            error={epg.error}
            isLoading={epg.isLoading}
            programs={epg.data ?? []}
          />
        </>
      ) : (
        <AllChannelsGuide guides={guides} isLoading={isEpgLoading} />
      )}
    </section>
  );
}

export function TvPage() {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { items, isLoading } = useCatalogItems("live");
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  useSearchShortcut(searchInputRef);
  const [category, setCategory] = useState("Todos");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string>();
  const handleChannelSelect = (channelId: string) => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setSelectedChannelId((currentId) =>
        currentId === channelId ? undefined : channelId,
      );
      return;
    }
    void navigate({
      to: "/app/tv/$channelId/watch",
      params: { channelId },
    });
  };
  const channels = items.map((item) => ({
    current: item.groupTitle ?? item.categories?.[0] ?? "Sem categoria",
    delivery: item.delivery,
    id: item.id,
    logoUrl: item.logoUrl,
    name: item.title,
    providerId: item.providerId,
    sourceId: item.sourceId,
    streamUrl: item.streamUrl,
  }));
  const categories: Array<[string, number]> = (() => {
    const counts = new Map<string, number>();
    for (const channel of channels) {
      counts.set(channel.current, (counts.get(channel.current) ?? 0) + 1);
    }
    return [
      ["Todos", channels.length] as [string, number],
      ...counts.entries(),
    ];
  })();
  const {
    visibleItems: visibleChannels,
    filteredCount,
    hasMore,
    sentinelRef,
  } = useInfiniteCatalog(
    channels,
    (channel, search, selectedCategory) =>
      channel.name.toLocaleLowerCase().includes(search) &&
      (search.length > 0 ||
        selectedCategory === "Todos" ||
        channel.current === selectedCategory),
    () => 0,
    query,
    category,
    category === "Todos",
  );
  const epgChannelsForView = (() => {
    const grouped = new Map<string, Channel>();
    for (const channel of visibleChannels) {
      const name = channelGroupName(channel.name);
      const key = `${channel.sourceId}:${name.toLocaleLowerCase()}`;
      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, { ...channel, name, variantCount: 1 });
        continue;
      }
      grouped.set(key, {
        ...existing,
        logoUrl: existing.logoUrl ?? channel.logoUrl,
        variantCount: (existing.variantCount ?? 1) + 1,
      });
    }
    return [...grouped.values()];
  })();
  const epgChannelsForRequest = (() => {
    if (category !== "Todos") return epgChannelsForView;
    const categoriesSeen = new Set<string>();
    return epgChannelsForView.filter((channel) => {
      if (categoriesSeen.has(channel.current)) return false;
      categoriesSeen.add(channel.current);
      return true;
    });
  })();
  const epgForChannels = useXtreamEpgForChannels(epgChannelsForRequest);
  const guides = epgChannelsForRequest.map((channel) => ({
    category: channel.current,
    channel: channel.name,
    programs:
      epgForChannels.programsByChannel.get(
        `${channel.sourceId}:${channel.providerId}`,
      ) ?? [],
  }));
  const displayGuides = (() => {
    if (category !== "Todos") {
      return guides.filter((guide) => guide.category === category);
    }
    const categoriesSeen = new Set<string>();
    return guides.filter((guide) => {
      if (categoriesSeen.has(guide.category)) return false;
      categoriesSeen.add(guide.category);
      return true;
    });
  })();

  return (
    <>
      <div className="flex h-screen min-w-0 w-full flex-col gap-5 overflow-x-hidden overflow-y-hidden px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:gap-6 lg:px-[30px] lg:pb-10">
        <AppHeader className="sticky top-0 z-30 bg-bg/95 py-2 backdrop-blur-sm">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <h1 className="hidden min-w-0 truncate font-display text-[1.75rem] font-bold tracking-[-0.05em] text-text md:block">
              TV ao vivo
            </h1>
            <SearchField
              aria-label="Buscar canais"
              className="hidden h-11 w-[320px] lg:flex"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar canais, programas..."
              ref={searchInputRef}
              value={query}
            />
          </div>
        </AppHeader>
        <div className="md:hidden">
          <h1 className="m-0 font-display text-[1.75rem] font-bold tracking-[-0.05em] text-text">
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
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-[minmax(13rem,27fr)_minmax(0,35fr)_minmax(16rem,38fr)] lg:items-stretch">
            <CategoryList
              categories={categories}
              className="hidden lg:block"
              onSelect={setCategory}
              selected={category}
            />
            <section
              className="flex h-[calc(100vh-8rem)] min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-hidden"
              data-tv-navigation-region="catalog-grid"
            >
              <h2 className="m-0 shrink-0 px-1 pb-2 text-[0.6875rem] font-extrabold tracking-[0.08em] text-muted">
                Canais
              </h2>
              <ScrollArea
                className="min-h-0 min-w-0 max-w-full flex-1"
                contentClassName="min-w-0 max-w-full px-1 py-1 pr-5"
              >
                <div className="flex min-w-0 max-w-full flex-col gap-2">
                  {visibleChannels.map((channel) => (
                    <ChannelRow
                      channel={channel}
                      favorite={isFavorite("channel", channel.id)}
                      key={channel.id}
                      onToggle={() => toggleFavorite("channel", channel.id)}
                      onSelect={() => handleChannelSelect(channel.id)}
                      selected={selectedChannelId === channel.id}
                    />
                  ))}
                </div>
                {hasMore && visibleChannels.length > 0 && (
                  <p
                    className="mt-4 mb-0 text-center text-xs text-muted"
                    role="status"
                  >
                    Mostrando {visibleChannels.length} de {filteredCount}{" "}
                    canais...
                  </p>
                )}
                <div className="h-1" ref={sentinelRef} />
              </ScrollArea>
            </section>
            <ProgramPanel
              channel={channels.find(({ id }) => id === selectedChannelId)}
              guides={displayGuides}
              isEpgLoading={epgForChannels.isLoading}
            />
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
    </>
  );
}
