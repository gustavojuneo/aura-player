import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

export function ScrollArea({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <BaseScrollArea.Root
      className={cn("relative min-h-0", className)}
      data-tv-scroll-area="true"
    >
      <BaseScrollArea.Viewport
        className="size-full overscroll-contain"
        data-tv-scroll-viewport="true"
      >
        <BaseScrollArea.Content
          className={cn("min-w-full pr-3", contentClassName)}
          data-tv-scroll-content="true"
        >
          {children}
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar
        className="flex w-2 justify-center bg-transparent p-0.5"
        orientation="vertical"
      >
        <BaseScrollArea.Thumb className="w-full rounded-full bg-muted/70 transition-colors hover:bg-gold" />
      </BaseScrollArea.Scrollbar>
    </BaseScrollArea.Root>
  );
}
