import type { ReactNode } from "react";

export function PlayerTooltip({
  children,
  label,
  shortcut,
}: {
  children: ReactNode;
  label: string;
  shortcut?: string;
}) {
  return (
    <span className="group/player-tooltip relative inline-flex">
      {children}
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 flex -translate-x-1/2 translate-y-1 items-center gap-2 whitespace-nowrap rounded-md bg-black/90 px-2.5 py-1.5 text-[11px] font-semibold text-text opacity-0 shadow-xl transition-[opacity,transform] group-hover/player-tooltip:pointer-events-auto group-hover/player-tooltip:translate-y-0 group-hover/player-tooltip:opacity-100"
        role="tooltip"
      >
        {label}
        {shortcut && (
          <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-gold-bright">
            {shortcut}
          </kbd>
        )}
      </span>
    </span>
  );
}
