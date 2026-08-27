import { type ReactNode, useEffect, useRef, useState } from "react";

import { cn } from "../../utils/cn";

type ViewportState = {
  height: number;
  top: number;
  width: number;
};

type VirtualizedGridProps<T> = {
  className?: string;
  columnCount: (width: number) => number;
  getItemKey: (item: T, index: number) => string;
  gap?: number;
  items: T[];
  overscanRows?: number;
  renderItem: (item: T, index: number) => ReactNode;
};

function findScrollParent(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") return parent;
    parent = parent.parentElement;
  }
  return null;
}

export function VirtualizedGrid<T>({
  className,
  columnCount,
  getItemKey,
  gap = 12,
  items,
  overscanRows = 2,
  renderItem,
}: VirtualizedGridProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({
    height: 0,
    top: 0,
    width: 0,
  });

  const updateViewport = () => {
    const container = containerRef.current;
    if (!container) return;
    const scrollParent = findScrollParent(container);
    const containerRect = container.getBoundingClientRect();
    const next = scrollParent
      ? (() => {
          const parentRect = scrollParent.getBoundingClientRect();
          const contentTop =
            containerRect.top - parentRect.top + scrollParent.scrollTop;
          return {
            height: scrollParent.clientHeight,
            top: scrollParent.scrollTop - contentTop,
            width: container.clientWidth,
          };
        })()
      : {
          height: window.innerHeight,
          top: window.scrollY - (containerRect.top + window.scrollY),
          width: container.clientWidth,
        };

    const columns = Math.max(1, columnCount(next.width));
    const columnWidth =
      next.width > 0 ? (next.width - gap * (columns - 1)) / columns : 0;
    const rowPitch = columnWidth * 1.5 + gap;
    const row = rowPitch > 0 ? Math.max(0, Math.floor(next.top / rowPitch)) : 0;
    const snappedTop = row * rowPitch;

    setViewport((current) =>
      current.height === next.height &&
      current.top === snappedTop &&
      current.width === next.width
        ? current
        : { ...next, top: snappedTop },
    );
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scrollParent = findScrollParent(container);
    const target: HTMLElement | Window = scrollParent ?? window;
    const scheduleUpdate = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        updateViewport();
      });
    };

    updateViewport();
    target.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(container);

    return () => {
      target.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver.disconnect();
      if (frameRef.current !== null)
        window.cancelAnimationFrame(frameRef.current);
    };
  }, [updateViewport]);

  const layout = (() => {
    const columns = Math.max(1, columnCount(viewport.width));
    const columnWidth =
      viewport.width > 0 ? (viewport.width - gap * (columns - 1)) / columns : 0;
    const cardHeight = columnWidth * 1.5;
    const rowPitch = cardHeight + gap;
    const rowCount = Math.ceil(items.length / columns);
    const totalHeight =
      rowCount > 0 ? rowCount * cardHeight + (rowCount - 1) * gap : 0;
    const firstRow = Math.max(
      0,
      Math.floor(viewport.top / rowPitch) - overscanRows,
    );
    const lastRow = Math.min(
      rowCount - 1,
      Math.ceil((viewport.top + viewport.height) / rowPitch) + overscanRows,
    );

    return {
      cardHeight,
      columns,
      firstRow,
      lastRow,
      rowPitch,
      totalHeight,
    };
  })();

  const visibleItems = (() => {
    if (viewport.width === 0 || layout.lastRow < layout.firstRow) return [];
    const firstIndex = layout.firstRow * layout.columns;
    const lastIndex = Math.min(
      items.length,
      (layout.lastRow + 1) * layout.columns,
    );
    return items.slice(firstIndex, lastIndex).map((item, offset) => ({
      index: firstIndex + offset,
      item,
    }));
  })();

  return (
    <div
      className={cn("relative w-full", className)}
      ref={containerRef}
      style={{ height: layout.totalHeight }}
    >
      {visibleItems.length > 0 && (
        <div
          className="absolute inset-x-0 grid"
          style={{
            columnGap: gap,
            gridAutoRows: layout.cardHeight,
            gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
            rowGap: gap,
            top: 0,
            transform: `translate3d(0, ${layout.firstRow * layout.rowPitch}px, 0)`,
            willChange: "transform",
          }}
        >
          {visibleItems.map(({ index, item }) => (
            <div key={getItemKey(item, index)}>{renderItem(item, index)}</div>
          ))}
        </div>
      )}
    </div>
  );
}
