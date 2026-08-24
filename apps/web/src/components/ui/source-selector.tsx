import { ChevronDown } from "lucide-react";
import type { CatalogSource } from "../../features/catalog/catalog";
import { cn } from "../../utils/cn";

export function SourceSelector({
  source,
  sources = [],
  activeSourceId,
  onChange,
  className,
}: {
  source?: string;
  sources?: CatalogSource[];
  activeSourceId?: string;
  onChange?: (sourceId: string) => void;
  className?: string;
}) {
  const selected = sources.find((item) => item.id === activeSourceId);
  const label = selected
    ? `${selected.name} · M3U`
    : (source ?? "Nenhuma fonte");
  const active = selected?.status === "ready";
  return (
    <label
      aria-label={`Fonte ativa: ${label}`}
      className={cn(
        "relative flex h-12 items-center gap-2.5 rounded-xl border border-line bg-panel px-3.5 text-sm font-semibold text-text transition-colors hover:border-gold/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        className,
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          active ? "bg-success" : "bg-muted",
        )}
      />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      <select
        aria-label="Selecionar fonte IPTV"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onChange={(event) => onChange?.(event.target.value)}
        value={activeSourceId ?? ""}
      >
        <option value="">Selecionar fonte</option>
        {sources.map((item) => (
          <option
            disabled={item.status !== "ready"}
            key={item.id}
            value={item.id}
          >
            {item.name} · {item.status === "ready" ? "pronta" : item.status}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="size-[18px] shrink-0 text-muted"
        strokeWidth={1.8}
      />
    </label>
  );
}
