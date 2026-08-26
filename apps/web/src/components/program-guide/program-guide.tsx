import { CalendarDays } from "lucide-react";
import { ProgramGuideList } from "./program-guide-list";
import type { ProgramGuideProps } from "./types";
import { isProgramOnDay, visibleChannelPrograms } from "./utils/program-guide";

export function ProgramGuide({
  error,
  isLoading,
  programs,
}: ProgramGuideProps) {
  const visiblePrograms = visibleChannelPrograms(
    programs.filter((program) => isProgramOnDay(program.start, "today")),
  );
  const isEmpty = !isLoading && !error && visiblePrograms.length === 0;
  return (
    <section
      aria-labelledby="program-guide-title"
      className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden"
    >
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays
            aria-hidden="true"
            className="size-4 text-gold-bright"
          />
          <h3
            className="m-0 truncate text-base font-extrabold text-text"
            id="program-guide-title"
          >
            Programação de hoje
          </h3>
        </div>
        <span className="shrink-0 text-xs font-semibold text-muted">Hoje</span>
      </div>
      {error && !isLoading && (
        <p className="m-0 text-sm text-muted">
          Não foi possível carregar a programação deste canal.
        </p>
      )}
      {isEmpty && (
        <p className="m-0 text-sm text-muted">
          Este canal não possui EPG disponível.
        </p>
      )}
      {(isLoading || visiblePrograms.length > 0) && !error && (
        <ProgramGuideList isLoading={isLoading} programs={visiblePrograms} />
      )}
    </section>
  );
}
