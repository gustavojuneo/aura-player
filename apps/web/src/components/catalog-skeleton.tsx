import { ScrollArea, Skeleton } from "./ui";

export function CatalogGridSkeleton() {
  return (
    <div
      aria-label="Carregando catálogo"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-3.5"
      role="status"
    >
      {Array.from({ length: 8 }, (_, index) => `catalog-skeleton-${index}`).map(
        (skeletonId) => (
          <div
            className="flex aspect-[2/3] flex-col justify-end rounded-xl border border-line bg-panel p-3.5 shadow-[inset_0_-90px_70px_-28px_rgba(0,0,0,0.9)]"
            key={skeletonId}
          >
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ),
      )}
    </div>
  );
}

export function HomePageSkeleton({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      aria-label="Carregando página inicial"
      className="flex flex-col gap-4"
      role="status"
    >
      <section className="relative min-h-[500px] overflow-hidden rounded-b-xl bg-panel sm:min-h-[650px]">
        <Skeleton className="absolute inset-0 size-full rounded-none" />
        <div className="absolute inset-x-5 bottom-8 flex max-w-[720px] flex-col gap-3.5 sm:inset-x-10 sm:bottom-10 lg:inset-x-[70px]">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-4/5 max-w-[520px]" />
          <Skeleton className="h-4 w-3/5 max-w-[470px]" />
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      </section>
      {[
        "home-skeleton-continue",
        "home-skeleton-channels",
        "home-skeleton-movies",
        "home-skeleton-series",
      ].map((sectionId) => (
        <section className="flex flex-col gap-3" key={sectionId}>
          <Skeleton className="h-6 w-44" />
          <div className="flex gap-3 overflow-hidden">
            {["one", "two", "three", "four", "five"].map((cardId) => (
              <div
                className="flex w-[220px] min-w-[220px] flex-col gap-3 rounded-xl border border-line bg-panel p-3"
                key={`${sectionId}-${cardId}`}
              >
                <Skeleton className="aspect-[2/3] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </section>
      ))}
      <button
        className="self-start text-xs font-bold text-gold-bright hover:text-gold focus-visible:outline-2 focus-visible:outline-focus"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </div>
  );
}

export function LivePageSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch">
      <aside className="hidden h-[calc(100vh-8rem)] w-[250px] shrink-0 rounded-xl bg-search p-3 lg:block">
        <Skeleton className="h-4 w-28" />
        <div className="mt-4 space-y-2">
          {Array.from(
            { length: 7 },
            (_, index) => `category-skeleton-${index}`,
          ).map((skeletonId) => (
            <Skeleton className="h-10 w-full" key={skeletonId} />
          ))}
        </div>
      </aside>
      <ScrollArea
        className="h-[calc(100vh-8rem)] min-h-0 min-w-0 flex-1 lg:w-[500px] lg:flex-none"
        contentClassName="space-y-2"
      >
        {Array.from(
          { length: 8 },
          (_, index) => `channel-skeleton-${index}`,
        ).map((skeletonId) => (
          <div
            className="flex h-[70px] items-center gap-3 rounded-[11px] border border-line bg-panel p-3"
            key={skeletonId}
          >
            <Skeleton className="size-[46px] shrink-0 rounded-[9px]" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
            <Skeleton className="size-5 rounded-md" />
          </div>
        ))}
      </ScrollArea>
      <section className="hidden min-w-0 flex-1 flex-col gap-3 rounded-xl bg-panel p-4 sm:p-[18px] lg:flex">
        <Skeleton className="h-[230px] w-full rounded-xl" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-32" />
      </section>
    </div>
  );
}
