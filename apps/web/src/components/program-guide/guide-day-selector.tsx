import type { GuideDay } from "./types";

export function GuideDaySelector({
  selectedDay,
  onSelect,
}: {
  selectedDay: GuideDay;
  onSelect: (day: GuideDay) => void;
}) {
  return (
    <div className="flex shrink-0 gap-2">
      {(["today", "tomorrow"] as const).map((day) => (
        <button
          aria-pressed={selectedDay === day}
          className={`rounded-lg border px-4 py-2 text-xs font-bold ${selectedDay === day ? "border-gold bg-[#3b2e18] text-gold-bright" : "border-line bg-search text-muted"}`}
          data-tv-navigation-group="guide-days"
          key={day}
          onClick={() => onSelect(day)}
          type="button"
        >
          {day === "today" ? "Hoje" : "Amanhã"}
        </button>
      ))}
    </div>
  );
}
