import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export function CarouselViewport({
  ariaLabel = "Favoritos",
  children,
  edgeToEdge = false,
}: {
  ariaLabel?: string;
  children: ReactNode;
  edgeToEdge?: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setCanPrevious(viewport.scrollLeft > 1);
    setCanNext(
      viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1,
    );
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

  const move = (direction: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({
      behavior: "smooth",
      left: direction * Math.max(viewport.clientWidth * 0.82, 240),
    });
  };

  return (
    <div
      className={`relative min-w-0 ${edgeToEdge ? "-mx-5 sm:-mx-10 lg:-mx-[70px]" : "-mx-4 sm:-mx-6 lg:-mx-8"}`}
    >
      <div
        className="overflow-x-auto overflow-y-visible scroll-smooth px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 lg:px-8"
        ref={viewportRef}
      >
        {children}
      </div>
      {canPrevious && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-bg via-bg/70 to-transparent"
        />
      )}
      {canNext && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-bg via-bg/70 to-transparent"
        />
      )}
      {canPrevious && (
        <button
          aria-label={`${ariaLabel} anteriores`}
          className="absolute inset-y-0 left-0 z-20 flex w-14 items-center justify-center bg-gradient-to-r from-bg via-bg/75 to-transparent text-text opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-focus"
          onClick={() => move(-1)}
          type="button"
        >
          <span className="grid size-9 place-items-center rounded-full border border-line bg-panel/95 shadow-lg">
            <ChevronLeft aria-hidden="true" className="size-5" />
          </span>
        </button>
      )}
      {canNext && (
        <button
          aria-label={`Próximos ${ariaLabel.toLocaleLowerCase()}`}
          className="absolute inset-y-0 right-0 z-20 flex w-14 items-center justify-center bg-gradient-to-l from-bg via-bg/75 to-transparent text-text opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-focus"
          onClick={() => move(1)}
          type="button"
        >
          <span className="grid size-9 place-items-center rounded-full border border-line bg-panel/95 shadow-lg">
            <ChevronRight aria-hidden="true" className="size-5" />
          </span>
        </button>
      )}
    </div>
  );
}
