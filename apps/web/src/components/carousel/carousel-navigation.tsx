import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselNavigationProps = {
  ariaLabel: string;
  canNext: boolean;
  canPrevious: boolean;
  onMove: (direction: 1 | -1) => void;
};

export function CarouselNavigation({
  ariaLabel,
  canNext,
  canPrevious,
  onMove,
}: CarouselNavigationProps) {
  return (
    <>
      {canPrevious && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-bg via-bg/70 to-transparent"
          />
          <button
            aria-label={`${ariaLabel} anteriores`}
            className="absolute inset-y-0 left-0 z-20 flex w-14 items-center justify-center bg-gradient-to-r from-bg via-bg/75 to-transparent text-text opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-focus"
            onClick={() => onMove(-1)}
            type="button"
          >
            <span className="grid size-9 place-items-center rounded-full border border-line bg-panel/95 shadow-lg">
              <ChevronLeft aria-hidden="true" className="size-5" />
            </span>
          </button>
        </>
      )}
      {canNext && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-bg via-bg/70 to-transparent"
          />
          <button
            aria-label={`Próximos ${ariaLabel.toLocaleLowerCase()}`}
            className="absolute inset-y-0 right-0 z-20 flex w-14 items-center justify-center bg-gradient-to-l from-bg via-bg/75 to-transparent text-text opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-focus"
            onClick={() => onMove(1)}
            type="button"
          >
            <span className="grid size-9 place-items-center rounded-full border border-line bg-panel/95 shadow-lg">
              <ChevronRight aria-hidden="true" className="size-5" />
            </span>
          </button>
        </>
      )}
    </>
  );
}
