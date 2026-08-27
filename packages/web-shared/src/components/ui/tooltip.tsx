import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ReactNode } from "react";

export function Tooltip({
  children,
  content,
  delay = 1000,
  side = "top",
}: {
  children: ReactNode;
  content: ReactNode;
  delay?: number;
  side?: "bottom" | "left" | "right" | "top";
}) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger
        delay={delay}
        render={<span className="inline-flex" />}
      >
        {children}
      </BaseTooltip.Trigger>
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={8}>
          <BaseTooltip.Popup className="z-[110] flex items-center gap-2 whitespace-nowrap rounded-md bg-black/90 px-2.5 py-1.5 text-[0.6875rem] font-semibold text-text shadow-xl">
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
