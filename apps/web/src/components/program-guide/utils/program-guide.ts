import type { EpgProgram } from "../../../features/catalog/catalog";
import type { GuideDay } from "../types";

export function formatProgramTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "--:--"
    : new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}

export function isCurrentProgram(program: EpgProgram, now = Date.now()) {
  const start = Date.parse(program.start);
  const stop = Date.parse(program.stop);
  return (
    Number.isFinite(start) &&
    Number.isFinite(stop) &&
    start <= now &&
    now <= stop
  );
}

export function programProgress(program: EpgProgram, now = Date.now()) {
  const start = Date.parse(program.start);
  const stop = Date.parse(program.stop);
  if (!Number.isFinite(start) || !Number.isFinite(stop) || stop <= start)
    return 0;
  return Math.min(100, Math.max(0, ((now - start) / (stop - start)) * 100));
}

export function isProgramOnDay(value: string, day: GuideDay) {
  const date = new Date(value);
  const target = new Date();
  if (day === "tomorrow") target.setDate(target.getDate() + 1);
  return date.toDateString() === target.toDateString();
}

export function formatGuideDate(day: GuideDay) {
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

export function visibleChannelPrograms(
  programs: EpgProgram[],
  now = Date.now(),
) {
  const sorted = [...programs].sort(
    (first, second) => Date.parse(first.start) - Date.parse(second.start),
  );
  const currentIndex = sorted.findIndex((program) =>
    isCurrentProgram(program, now),
  );
  if (currentIndex >= 0)
    return sorted.filter(
      (_, index) => index === currentIndex - 1 || index >= currentIndex,
    );
  const previousIndex = sorted.reduce(
    (lastIndex, program, index) =>
      Date.parse(program.stop) <= now ? index : lastIndex,
    -1,
  );
  return sorted.filter(
    (program, index) =>
      index === previousIndex || Date.parse(program.start) > now,
  );
}
