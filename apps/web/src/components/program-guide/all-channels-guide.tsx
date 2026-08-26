import { ScrollArea, Skeleton } from "../ui";
import { GuideDaySelector } from "./guide-day-selector";
import { useGuideDay } from "./hooks/use-guide-day";
import type { AllChannelsGuideProps } from "./types";
import {
  formatGuideDate,
  formatProgramTime,
  isCurrentProgram,
  isProgramOnDay,
} from "./utils/program-guide";

export function AllChannelsGuide({ guides, isLoading }: AllChannelsGuideProps) {
  const { selectedDay, setSelectedDay } = useGuideDay();
  return (
    <section
      aria-labelledby="all-channels-guide-title"
      className="flex min-h-0 flex-1 flex-col gap-3"
    >
      <div className="flex shrink-0 items-start justify-between gap-3">
        <h2
          className="m-0 max-w-[220px] font-display text-xl font-bold tracking-[-0.04em] text-text"
          id="all-channels-guide-title"
        >
          Programação de todos os canais
        </h2>
        <span className="shrink-0 pt-1 text-xs font-semibold text-muted">
          {selectedDay === "today" ? "Hoje" : "Amanhã"} ·{" "}
          {formatGuideDate(selectedDay)}
        </span>
      </div>
      <GuideDaySelector onSelect={setSelectedDay} selectedDay={selectedDay} />
      <ScrollArea
        className="min-h-0 flex-1"
        contentClassName="flex flex-col gap-1.5 pr-5"
      >
        {guides.map(({ channel, programs }) => {
          const dayPrograms = programs.filter((program) =>
            isProgramOnDay(program.start, selectedDay),
          );
          const current = dayPrograms.find(isCurrentProgram) ?? dayPrograms[0];
          const next = current
            ? dayPrograms.find(
                (program) =>
                  Date.parse(program.start) > Date.parse(current.stop),
              )
            : undefined;
          return (
            <button
              className="w-full shrink-0 rounded-lg border border-line bg-search px-2.5 py-2.5 text-left"
              data-tv-epg-item="true"
              data-tv-navigation-zone="catalog-preview"
              key={channel}
              type="button"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="block min-w-0 truncate text-sm font-bold text-text">
                  {channel}
                </span>
                {current && (
                  <time className="shrink-0 text-xs font-semibold text-muted">
                    {formatProgramTime(current.start)} —{" "}
                    {formatProgramTime(current.stop)}
                  </time>
                )}
              </div>
              {isLoading && !current ? (
                <>
                  <Skeleton className="mt-2 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </>
              ) : (
                <span className="mt-1 block truncate text-xs text-muted">
                  {current?.title ?? "EPG indisponível"}
                </span>
              )}
              {next && !isLoading && (
                <span className="mt-1 block truncate text-[0.6875rem] text-muted/75">
                  Próximo: {next.title} · {formatProgramTime(next.start)}
                </span>
              )}
            </button>
          );
        })}
      </ScrollArea>
    </section>
  );
}
