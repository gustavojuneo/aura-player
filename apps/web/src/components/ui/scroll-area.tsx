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
    <BaseScrollArea.Root className={cn("relative min-h-0", className)}>
      <BaseScrollArea.Viewport className="size-full overscroll-contain">
        <BaseScrollArea.Content
          className={cn("min-w-full pr-3", contentClassName)}
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
