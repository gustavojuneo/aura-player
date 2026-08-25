import { Link } from "@tanstack/react-router";
import { Heart, Play } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "../../../components/ui";
import { cn } from "../../../utils/cn";

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
}: DetailHeroProps) {
  return (
    <section className="relative h-[430px] overflow-hidden px-5 sm:h-[650px] sm:px-10 lg:px-[70px]">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-[390px] bg-cover bg-center sm:h-[570px]",
          kind === "movie" ? "bg-[#6f441e]" : "bg-[#284151]",
        )}
      >
        {imageUrl && (
          <img
            alt=""
            className="size-full object-cover"
            decoding="async"
            src={imageUrl}
          />
        )}
      </div>
      <div className="absolute inset-x-0 top-0 h-[430px] bg-gradient-to-b from-transparent via-bg/20 to-bg sm:h-[650px]" />
      <div className="relative flex h-full max-w-[720px] flex-col justify-end gap-3.5 pb-4 sm:h-[435px] sm:pb-0">
        <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.08em] text-gold-bright">
          {badge}
        </p>
        <h1 className="m-0 font-display text-[30px] font-bold leading-tight text-text sm:text-[46px]">
          {title}
        </h1>
        <p className="m-0 text-xs font-semibold text-[#d6d0c5] sm:text-sm">
          {metadata}
        </p>
        <p className="m-0 max-w-[680px] text-sm leading-[1.45] text-[#d6d0c5] sm:text-[15px]">
          {description}
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gold bg-gold px-5 text-xs font-bold text-ink transition-colors hover:bg-gold-bright focus-visible:outline-2 focus-visible:outline-focus sm:h-12 sm:text-sm"
            params={watchParams}
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
            {isFavorite ? "Favorito" : "♡  Favorito"}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function DetailCard({
  accent,
  children,
  className,
}: {
  accent: "blue" | "amber";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-[160px] min-w-0 flex-1 flex-col justify-end gap-1.5 overflow-hidden rounded-xl border border-line p-3",
        accent === "blue" ? "bg-[#253844]" : "bg-[#633f20]",
        className,
      )}
    >
      {children}
    </div>
  );
}
