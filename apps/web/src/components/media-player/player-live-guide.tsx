import { CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";

import type { EpgProgram } from "../../features/catalog/catalog";

function formatProgramTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PlayerLiveGuide({
  channelName,
  error,
  isLoading,
  programs,
}: {
  channelName: string;
  error: boolean;
  isLoading: boolean;
  programs: readonly EpgProgram[];
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const nextTransition = programs
      .map((program) => Date.parse(program.stop))
      .filter((timestamp) => timestamp > now)
      .sort((first, second) => first - second)[0];
    const nextProgressRefresh = now + 5 * 60_000;
    const nextUpdate = nextTransition
      ? Math.min(nextTransition, nextProgressRefresh)
      : nextProgressRefresh;
    const timer = window.setTimeout(
      () => setNow(Date.now()),
      Math.max(0, nextUpdate - Date.now() + 50),
    );
    return () => window.clearTimeout(timer);
  }, [now, programs]);

  const previousProgram = programs
    .filter((program) => Date.parse(program.stop) <= now)
    .at(-1);
  const timelinePrograms = [
    ...(previousProgram ? [previousProgram] : []),
    ...programs.filter((program) => Date.parse(program.stop) > now).slice(0, 6),
  ];
  const nextProgram = timelinePrograms.find(
    (program) => Date.parse(program.start) > now,
  );

  return (
    <aside className="w-full border-y border-white/15 bg-black/45 px-4 py-4 text-white shadow-2xl backdrop-blur-md sm:px-[42px] sm:py-5">
      <div className="flex min-w-0 items-center gap-2">
        <CalendarClock
          aria-hidden="true"
          className="size-5 shrink-0 text-gold-bright"
        />
        <p className="m-0 truncate text-xs font-extrabold uppercase tracking-[0.12em] text-gold-bright">
          {channelName} · programação
        </p>
        {timelinePrograms.length > 0 && (
          <span className="ml-auto shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-white/55">
            Linha do tempo
          </span>
        )}
      </div>
      {isLoading ? (
        <p className="mt-4 mb-0 text-sm text-white/60">
          Carregando programação...
        </p>
      ) : error ? (
        <p className="mt-4 mb-0 text-sm text-white/60">
          Programação indisponível para este canal.
        </p>
      ) : timelinePrograms.length > 0 ? (
        <div className="mt-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-full gap-2">
            {timelinePrograms.map((program) => (
              <TimelineProgram
                key={program.id}
                next={program.id === nextProgram?.id}
                now={now}
                program={program}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 mb-0 text-sm text-white/60">
          Nenhuma programação disponível.
        </p>
      )}
    </aside>
  );
}

function TimelineProgram({
  next = false,
  now,
  program,
}: {
  next?: boolean;
  now: number;
  program: EpgProgram;
}) {
  const start = Date.parse(program.start);
  const stop = Date.parse(program.stop);
  const duration = Math.max(stop - start, 5 * 60_000);
  const progress =
    start <= now && now < stop
      ? Math.min(100, Math.max(0, ((now - start) / (stop - start)) * 100))
      : 0;
  const current = progress > 0;
  const previous = stop <= now;

  return (
    <div
      className={`relative min-h-[128px] min-w-[200px] flex-1 overflow-hidden rounded-lg border px-4 py-3 ${current ? "border-gold/80 bg-gold/15" : previous ? "border-white/15 bg-black/20 opacity-80" : next ? "border-sky-300/70 bg-sky-300/15" : "border-white/10 bg-black/20"}`}
      style={{ flex: `${duration} 0 0` }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="shrink-0 text-xs font-bold text-white/65">
          {formatProgramTime(program.start)}
        </span>
        <span className="shrink-0 text-xs text-white/45">
          {formatProgramTime(program.stop)}
        </span>
      </div>
      <p className="mt-2 mb-0 truncate text-sm font-semibold">
        {program.title}
      </p>
      <p className="mt-1 mb-0 line-clamp-2 text-[11px] leading-snug text-white/65">
        {program.description}
      </p>
      {previous && (
        <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-white/45">
          Anterior
        </span>
      )}
      {next && (
        <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-sky-200">
          Próximo
        </span>
      )}
      {current && (
        <>
          <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-gold-bright">
            No ar agora
          </span>
          <span className="absolute inset-x-0 bottom-0 h-1.5 bg-white/10">
            <span
              className="block h-full bg-gold-bright"
              style={{ width: `${progress}%` }}
            />
          </span>
        </>
      )}
    </div>
  );
}
