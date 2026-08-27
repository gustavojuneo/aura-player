import type { ReactNode, RefObject } from "react";

export function CarouselTrack({
  children,
  viewportRef,
}: {
  children: ReactNode;
  viewportRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className="overflow-x-auto overflow-y-visible scroll-smooth px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 lg:px-8"
      ref={viewportRef}
    >
      <div className="flex min-w-max flex-nowrap gap-3">{children}</div>
    </div>
  );
}
