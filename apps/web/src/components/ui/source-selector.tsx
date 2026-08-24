import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

export function SourceSelector({
  source = "Casa · Xtream",
  active = true,
  className,
}: {
  source?: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      aria-label={`Fonte ativa: ${source}`}
      className={cn(
        "flex h-12 items-center gap-2.5 rounded-xl border border-line bg-panel px-3.5 text-sm font-semibold text-text transition-colors hover:border-gold/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        className,
      )}
      type="button"
    >
      <span
        className={cn(
          "size-2 rounded-full",
          active ? "bg-success" : "bg-muted",
        )}
      />
      <span className="min-w-0 flex-1 truncate text-left">{source}</span>
      <ChevronDown
        aria-hidden="true"
        className="size-[18px] shrink-0 text-muted"
        strokeWidth={1.8}
      />
    </button>
  );
}
