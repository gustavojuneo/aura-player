import type { ReactNode } from "react";
import { env } from "../../env";
import { Tooltip } from "../ui";

export function ControlButton({
  active = false,
  label,
  children,
  disabled = false,
  onClick,
  shortcut,
}: {
  active?: boolean;
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  shortcut?: string;
}) {
  const control = (
    <button
      aria-keyshortcuts={shortcut}
      aria-label={label}
      aria-pressed={active || undefined}
      className={`grid size-7 cursor-pointer place-items-center rounded-md text-text transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-35 sm:size-8 ${active ? "bg-gold/20 text-gold-bright" : ""}`}
      disabled={disabled}
      data-player-focus-anchor
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
  if (env.VITE_DEVICE_TYPE === "tv") return control;
  return (
    <Tooltip
      content={
        <>
          {label}
          {shortcut && (
            <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[0.625rem] font-bold text-gold-bright">
              {shortcut}
            </kbd>
          )}
        </>
      }
    >
      {control}
    </Tooltip>
  );
}
