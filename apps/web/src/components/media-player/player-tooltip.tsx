import type { ReactNode } from "react";
import { env } from "../../env";
import { Tooltip } from "../ui";

export function PlayerTooltip({
  children,
  label,
  shortcut,
}: {
  children: ReactNode;
  label: string;
  shortcut?: string;
}) {
  if (env.VITE_DEVICE_TYPE === "tv") return children;
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
      {children}
    </Tooltip>
  );
}
