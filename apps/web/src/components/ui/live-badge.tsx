import type { ReactNode } from "react";

export function LiveBadge({ children = "AO VIVO" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-live px-2.5 py-1.5 text-[11px] font-extrabold tracking-[0.12em] text-white">
      <span className="size-1.5 rounded-full bg-white" />
      {children}
    </span>
  );
}
