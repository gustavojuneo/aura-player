import { CalendarDays } from "lucide-react";
import { useState } from "react";

import { ScrollArea, Skeleton } from "../../../components/ui";
import type { EpgProgram } from "../../../features/catalog/catalog";

type AllChannelsGuideProps = {
  guides: Array<{ channel: string; programs: EpgProgram[] }>;
  isLoading: boolean;
};
type ProgramGuideProps = {
  error: Error | null;
  isLoading: boolean;
  programs: EpgProgram[];
};
type GuideDay = "today" | "tomorrow";

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "--:--"
    : new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}

function isCurrent(program: EpgProgram) {
  const now = Date.now();
  const start = Date.parse(program.start);
  const stop = Date.parse(program.stop);
  return (
    Number.isFinite(start) &&
    Number.isFinite(stop) &&
    start <= now &&
    now <= stop
  );
}

function visibleSelectedChannelPrograms(programs: EpgProgram[]) {
  const sortedPrograms = [...programs].sort(
    (first, second) => Date.parse(first.start) - Date.parse(second.start),
  );
  const currentIndex = sortedPrograms.findIndex(isCurrent);

  if (currentIndex >= 0) {
    return sortedPrograms.filter(
      (_, index) => index === currentIndex - 1 || index >= currentIndex,
    );
  }

  const now = Date.now();
  const previousIndex = sortedPrograms.reduce(
    (lastIndex, program, index) =>
      Date.parse(program.stop) <= now ? index : lastIndex,
    -1,
  );

  return sortedPrograms.filter(
    (_, index) =>
      index === previousIndex || Date.parse(sortedPrograms[index].start) > now,
  );
}

function progress(program: EpgProgram) {
  const start = Date.parse(program.start);
  const stop = Date.parse(program.stop);
  if (!Number.isFinite(start) || !Number.isFinite(stop) || stop <= start)
    return 0;
  return Math.min(
    100,
    Math.max(0, ((Date.now() - start) / (stop - start)) * 100),
  );
}

function isOnDay(value: string, day: GuideDay) {
  const date = new Date(value);
  const target = new Date();
  if (day === "tomorrow") target.setDate(target.getDate() + 1);
  return date.toDateString() === target.toDateString();
}

function guideDate(day: GuideDay) {
  const date = new Date();
  if (day === "tomorrow") date.setDate(date.getDate() + 1);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  })
    .format(date)
    .replace(".", "");
}

export function AllChannelsGuide({ guides, isLoading }: AllChannelsGuideProps) {
  const [selectedDay, setSelectedDay] = useState<GuideDay>("today");
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
          {guideDate(selectedDay)}
        </span>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          aria-pressed={selectedDay === "today"}
          className={`rounded-lg border px-4 py-2 text-xs font-bold ${selectedDay === "today" ? "border-gold bg-[#3b2e18] text-gold-bright" : "border-line bg-search text-muted"}`}
          onClick={() => setSelectedDay("today")}
          type="button"
        >
          Hoje
        </button>
        <button
          aria-pressed={selectedDay === "tomorrow"}
          className={`rounded-lg border px-4 py-2 text-xs font-bold ${selectedDay === "tomorrow" ? "border-gold bg-[#3b2e18] text-gold-bright" : "border-line bg-search text-muted"}`}
          onClick={() => setSelectedDay("tomorrow")}
          type="button"
        >
          Amanhã
        </button>
      </div>
      <ScrollArea
        className="min-h-0 flex-1"
        contentClassName="flex flex-col gap-1.5 pr-5"
      >
        {guides.map(({ channel, programs }) => {
          const dayPrograms = programs.filter((program) =>
            isOnDay(program.start, selectedDay),
          );
          const current = dayPrograms.find(isCurrent) ?? dayPrograms[0];
          const next = current
            ? dayPrograms.find(
                (program) =>
                  Date.parse(program.start) > Date.parse(current.stop),
              )
            : undefined;
          return (
            <div
              className="shrink-0 rounded-lg border border-line bg-search px-2.5 py-2.5"
              key={channel}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="block min-w-0 truncate text-sm font-bold text-text">
                  {channel}
                </span>
                {current && (
                  <time className="shrink-0 text-xs font-semibold text-muted">
                    {formatTime(current.start)} — {formatTime(current.stop)}
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
                <span className="mt-1 block truncate text-[11px] text-muted/75">
                  Próximo: {next.title} · {formatTime(next.start)}
                </span>
              )}
            </div>
          );
        })}
      </ScrollArea>
    </section>
  );
}

export function ProgramGuide({
  error,
  isLoading,
  programs,
}: ProgramGuideProps) {
  const todayPrograms = programs.filter((program) =>
    isOnDay(program.start, "today"),
  );
  const visiblePrograms = visibleSelectedChannelPrograms(todayPrograms);
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
      {!isLoading && !error && visiblePrograms.length === 0 && (
        <p className="m-0 text-sm text-muted">
          Este canal não possui EPG disponível.
        </p>
      )}
      {isLoading && (
        <ScrollArea
          className="min-h-0 flex-1"
          contentClassName="flex flex-col gap-1.5 pr-5"
        >
          {["one", "two", "three"].map((key) => (
            <div
              className="shrink-0 rounded-lg border border-line bg-search px-2.5 py-2.5"
              key={key}
            >
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="mt-2 h-3 w-4/5" />
              <Skeleton className="mt-2 h-3 w-2/5" />
            </div>
          ))}
        </ScrollArea>
      )}
      {!isLoading && !error && visiblePrograms.length > 0 && (
        <ScrollArea
          className="min-h-0 flex-1"
          contentClassName="flex flex-col gap-1.5 pr-5"
        >
          {visiblePrograms.map((program) => {
            const current = isCurrent(program);
            return (
              <article
                className={`shrink-0 rounded-lg border px-2.5 py-2 ${current ? "border-gold bg-[#3b2e18]" : "border-line bg-search"}`}
                key={program.id}
              >
                <div className="min-w-0">
                  <div className="flex items-start gap-2.5">
                    <h4 className="m-0 min-w-0 flex-1 truncate text-sm font-bold text-text">
                      {program.title}
                    </h4>
                    <time className="shrink-0 pt-0.5 text-xs font-bold text-muted">
                      {formatTime(program.start)} — {formatTime(program.stop)}
                    </time>
                  </div>
                  {program.description && (
                    <p className="m-0 mt-1 line-clamp-2 text-xs leading-snug text-muted">
                      {program.description}
                    </p>
                  )}
                  {current && (
                    <span className="shrink-0 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.06em] text-ink">
                      AGORA
                    </span>
                  )}
                </div>
                {current && (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#5c4523]">
                    <span
                      className="block h-full rounded-full bg-gold-bright"
                      style={{ width: `${progress(program)}%` }}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </ScrollArea>
      )}
    </section>
  );
}
