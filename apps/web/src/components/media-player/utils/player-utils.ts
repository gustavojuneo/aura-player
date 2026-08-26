export const AUTOMATIC_QUALITY_OPTION = {
  label: "Automática",
  value: "auto",
} as const;

export function qualityOptionsForHeights(heights: number[]) {
  return [
    AUTOMATIC_QUALITY_OPTION,
    ...[...new Set(heights)]
      .sort((first, second) => second - first)
      .map((height) => ({ label: `${height}p`, value: String(height) })),
  ];
}
