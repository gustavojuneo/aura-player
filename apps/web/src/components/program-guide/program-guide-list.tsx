import type { EpgProgram } from "../../features/catalog/catalog";
import { ScrollArea, Skeleton } from "../ui";
import { ProgramGuideItem } from "./program-guide-item";
import { isCurrentProgram } from "./utils/program-guide";

type ProgramGuideListProps = { isLoading: boolean; programs: EpgProgram[] };

export function ProgramGuideList({
  isLoading,
  programs,
}: ProgramGuideListProps) {
  return (
    <ScrollArea
      className="min-h-0 flex-1"
      contentClassName="flex flex-col gap-1.5 pr-5"
    >
      {isLoading
        ? ["one", "two", "three"].map((key) => (
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
          ))
        : programs.map((program) => (
            <ProgramGuideItem
              isCurrent={isCurrentProgram(program)}
              key={program.id}
              program={program}
            />
          ))}
    </ScrollArea>
  );
}
