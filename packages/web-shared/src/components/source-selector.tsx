import type { CatalogSource } from "../features/catalog/catalog";
import { SelectField } from "./ui";

export function SourceSelector({
  source,
  sources = [],
  activeSourceId,
  onChange,
  onOpenChange,
  className,
}: {
  source?: string;
  sources?: CatalogSource[];
  activeSourceId?: string;
  onChange?: (sourceId: string) => void;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  const selected = sources.find((item) => item.id === activeSourceId);
  const label = selected
    ? `${selected.name} · M3U`
    : (source ?? "Nenhuma fonte");
  const active = selected?.status === "ready";
  return (
    <SelectField
      aria-label="Selecionar fonte IPTV"
      className={className}
      leading={
        <span
          className={`size-2 shrink-0 rounded-full ${active ? "bg-success" : "bg-muted"}`}
        />
      }
      onValueChange={(value) => onChange?.(value)}
      onOpenChange={onOpenChange}
      options={sources.map((item) => ({
        disabled: item.status !== "ready",
        label: `${item.name} · ${item.status === "ready" ? "pronta" : item.status}`,
        value: item.id,
      }))}
      placeholder="Selecionar fonte"
      triggerClassName="h-12 w-full rounded-xl bg-panel px-3.5 text-sm"
      value={activeSourceId}
      valueLabel={label}
    />
  );
}
