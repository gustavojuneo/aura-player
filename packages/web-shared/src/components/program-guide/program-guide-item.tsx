import type { EpgProgram } from "../../features/catalog/catalog";
import { formatProgramTime, programProgress } from "./utils/program-guide";

type ProgramGuideItemProps = { isCurrent: boolean; program: EpgProgram };

export function ProgramGuideItem({
  isCurrent,
  program,
}: ProgramGuideItemProps) {
  return (
    <button
      aria-label={`${program.title}, ${formatProgramTime(program.start)} — ${formatProgramTime(program.stop)}`}
      className={`w-full shrink-0 rounded-lg border px-2.5 py-2 text-left ${isCurrent ? "border-gold bg-[#3b2e18]" : "border-line bg-search"}`}
      data-tv-navigation-zone="catalog-preview"
      data-tv-epg-item="true"
      type="button"
    >
      <div className="min-w-0">
        <div className="flex items-start gap-2.5">
          <h4 className="m-0 min-w-0 flex-1 truncate text-sm font-bold text-text">
            {program.title}
          </h4>
          <time className="shrink-0 pt-0.5 text-xs font-bold text-muted">
            {formatProgramTime(program.start)} —{" "}
            {formatProgramTime(program.stop)}
          </time>
        </div>
        {program.description && (
          <p className="m-0 mt-1 line-clamp-2 text-xs leading-snug text-muted">
            {program.description}
          </p>
        )}
        {isCurrent && (
          <span className="shrink-0 rounded-full bg-gold px-1.5 py-0.5 text-[0.5625rem] font-extrabold tracking-[0.06em] text-ink">
            AGORA
          </span>
        )}
      </div>
      {isCurrent && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#5c4523]">
          <span
            className="block h-full rounded-full bg-gold-bright"
            style={{ width: `${programProgress(program)}%` }}
          />
        </div>
      )}
    </button>
  );
}
