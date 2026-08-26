export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-full bg-gold text-xs font-extrabold text-ink">
        A
      </span>
      <span
        className={`font-display text-[20px] font-bold tracking-[-0.04em] text-text ${collapsed ? "hidden group-hover/sidebar:inline" : ""}`}
      >
        AURA
      </span>
    </div>
  );
}
