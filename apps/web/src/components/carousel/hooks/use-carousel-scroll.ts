import { useCallback, useEffect, useRef, useState } from "react";
import { canScrollForward, getCarouselScrollOffset } from "../utils/carousel";

export function useCarouselScroll() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setCanPrevious(viewport.scrollLeft > 1);
    setCanNext(canScrollForward(viewport));
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    updateScrollState();
    viewport.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(viewport);
    return () => {
      viewport.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  const move = useCallback((direction: 1 | -1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({
      behavior: "smooth",
      left: direction * getCarouselScrollOffset(viewport),
    });
  }, []);

  return { canNext, canPrevious, move, viewportRef };
}
