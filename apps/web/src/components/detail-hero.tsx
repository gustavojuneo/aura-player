import { Link } from "@tanstack/react-router";
import { Heart, Play } from "lucide-react";
import { type CSSProperties, type ReactNode, useState } from "react";
import {
  defaultHeroAspectRatio,
  useImageAspectRatio,
} from "../hooks/use-image-aspect-ratio";
import { markPlaybackNavigation } from "../services/playback-autoplay";
import { cn } from "../utils/cn";
import { Button } from "./ui";

type DetailHeroProps = {
  kind: "movie" | "series";
  title: string;
  imageUrl?: string;
  badge: string;
  metadata: string;
  description: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  watchTo:
    | "/app/movies/$movieId/watch"
    | "/app/series/$seriesId/episodes/$episodeId/watch";
  watchParams: Record<string, string>;
  watchLabel: string;
  extraContent?: ReactNode;
  fitViewport?: boolean;
};

export function DetailHero({
  kind,
  title,
  imageUrl,
  badge,
  metadata,
  description,
  isFavorite,
  onToggleFavorite,
  watchTo,
  watchParams,
  watchLabel,
  extraContent,
  fitViewport = false,
}: DetailHeroProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const imageAspectRatio = useImageAspectRatio(imageUrl);
  const canExpandDescription = description.length > 180;
  const backdropFade =
    kind === "movie"
      ? "linear-gradient(to bottom, transparent 0%, transparent 42%, rgb(21 19 15 / 11%) 51%, rgb(21 19 15 / 40%) 68%, rgb(21 19 15 / 94%) 84%, #15130fff 90%, #15130fff 100%)"
      : "linear-gradient(to bottom, transparent 0%, transparent 28%, rgb(21 19 15 / 11%) 39%, rgb(21 19 15 / 40%) 68%, rgb(21 19 15 / 94%) 90%, #15130fff 98%, #15130fff 100%)";

  return (
    <section
      className={cn(
        "relative overflow-visible px-5 sm:px-10 lg:px-[70px]",
        fitViewport
          ? "min-h-0 flex-1 overflow-hidden"
          : "min-h-[430px] sm:min-h-[650px]",
      )}
      data-tv-detail-hero="true"
    >
      <div
        className={cn(
          fitViewport
            ? "absolute inset-x-0 top-0 h-full"
            : "-mx-5 h-[clamp(430px,calc(100vw/var(--hero-aspect-ratio)),900px)] w-[calc(100%+2.5rem)] sm:-mx-10 sm:h-[clamp(650px,calc(100vw/var(--hero-aspect-ratio)),900px)] sm:w-[calc(100%+5rem)] lg:-mx-[70px] lg:w-[calc(100%+140px)]",
          "overflow-hidden bg-top bg-no-repeat shadow-[inset_0_80px_100px_-35px_rgb(0_0_0_/_88%)]",
          kind === "movie" ? "bg-[#6f441e]" : "bg-[#284151]",
        )}
        style={
          {
            backgroundImage: imageUrl
              ? `${backdropFade}, url(${imageUrl})`
              : backdropFade,
            backgroundPosition: "center top, center top",
            backgroundSize: `100% 100%, ${imageAspectRatio >= 1 ? "100% auto" : "auto 100%"}`,
            "--hero-aspect-ratio": defaultHeroAspectRatio,
          } as CSSProperties
        }
      />
      <div
        className={cn(
          "relative z-20 flex max-w-[720px] flex-col justify-end gap-3.5",
          fitViewport
            ? "h-full pb-8 sm:pb-10"
            : "-mt-[105px] pb-4 sm:-mt-[336px] sm:pb-0",
        )}
      >
        <p className="m-0 text-[0.625rem] font-extrabold uppercase tracking-[0.08em] text-gold-bright">
          {badge}
        </p>
        <h1 className="m-0 font-display text-[1.875rem] font-bold leading-tight text-text sm:text-[2.875rem]">
          {title}
        </h1>
        <p className="m-0 text-xs font-semibold text-[#d6d0c5] sm:text-sm">
          {metadata}
        </p>
        <div className="min-h-[76px] w-full max-w-[680px] min-w-0">
          <p
            className={cn(
              "m-0 overflow-hidden break-words text-sm leading-[1.45] text-[#d6d0c5] sm:text-[0.9375rem]",
              !isDescriptionExpanded &&
                "[display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]",
            )}
          >
            {description}
          </p>
          {canExpandDescription && (
            <button
              className="mt-1 inline-flex min-h-7 items-center rounded-md text-xs font-bold text-gold-bright underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-focus"
              onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}
              type="button"
            >
              {isDescriptionExpanded ? "Ver menos" : "Ver mais"}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-gold bg-gold px-5 text-xs font-bold text-ink transition-colors hover:bg-gold-bright focus-visible:outline-2 focus-visible:outline-focus sm:h-12 sm:w-[260px] sm:text-sm"
            data-tv-detail-watch="true"
            params={watchParams}
            onClick={markPlaybackNavigation}
            to={watchTo}
          >
            <Play className="size-4 fill-current" /> {watchLabel}
          </Link>
          <Button
            className="h-10 px-5 text-xs sm:h-12 sm:text-sm"
            onClick={onToggleFavorite}
            variant="secondary"
          >
            <Heart
              className={cn("size-4", isFavorite && "fill-gold text-gold")}
            />
            Favorito
          </Button>
        </div>
        {extraContent}
      </div>
    </section>
  );
}

export function DetailHeroSkeleton() {
  return (
    <main className="min-h-screen animate-pulse bg-bg px-5 pt-20 text-text sm:px-10 lg:px-[70px]">
      <div className="mx-auto flex min-h-[620px] max-w-[1300px] flex-col justify-end gap-4 pb-12">
        <div className="h-3 w-28 rounded bg-panel-2" />
        <div className="h-12 w-2/3 rounded bg-panel-2 sm:h-16" />
        <div className="h-4 w-48 rounded bg-panel-2" />
        <div className="h-16 max-w-2xl rounded bg-panel-2" />
        <div className="h-12 w-40 rounded-xl bg-panel-2" />
      </div>
    </main>
  );
}

export function DetailCard({
  accent,
  children,
  className,
  imageUrl,
}: {
  accent: "blue" | "amber";
  children: ReactNode;
  className?: string;
  imageUrl?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex aspect-[2/3] min-w-0 cursor-pointer flex-col justify-end gap-1.5 overflow-hidden rounded-xl border border-line p-3 shadow-[inset_0_-90px_70px_-28px_rgba(0,0,0,0.9)] transition-transform hover:-translate-y-1",
        accent === "blue" ? "bg-[#253844]" : "bg-[#633f20]",
        className,
      )}
    >
      {imageUrl && (
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          decoding="async"
          loading="lazy"
          referrerPolicy="no-referrer"
          src={imageUrl}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-white/5" />
      <div className="relative z-10 flex min-w-0 flex-col gap-1.5">
        {children}
      </div>
    </div>
  );
}
