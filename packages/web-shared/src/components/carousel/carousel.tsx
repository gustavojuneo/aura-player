import type { ReactNode } from "react";
import { CarouselNavigation } from "./carousel-navigation";
import { CarouselTrack } from "./carousel-track";
import { useCarouselScroll } from "./hooks/use-carousel-scroll";

export type CarouselProps = {
  ariaLabel?: string;
  children: ReactNode;
  edgeToEdge?: boolean;
};

export function Carousel({
  ariaLabel = "Favoritos",
  children,
  edgeToEdge = false,
}: CarouselProps) {
  const { canNext, canPrevious, move, viewportRef } = useCarouselScroll();
  return (
    <div
      className={`relative min-w-0 ${edgeToEdge ? "-mx-5 sm:-mx-10 lg:-mx-[70px]" : "-mx-4 sm:-mx-6 lg:-mx-8"}`}
    >
      <CarouselTrack viewportRef={viewportRef}>{children}</CarouselTrack>
      <CarouselNavigation
        ariaLabel={ariaLabel}
        canNext={canNext}
        canPrevious={canPrevious}
        onMove={move}
      />
    </div>
  );
}

export const CarouselViewport = Carousel;
