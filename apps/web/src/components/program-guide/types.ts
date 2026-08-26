import type { EpgProgram } from "../../features/catalog/catalog";

export type GuideDay = "today" | "tomorrow";

export type ProgramGuideProps = {
  error: Error | null;
  isLoading: boolean;
  programs: EpgProgram[];
};

export type AllChannelsGuideProps = {
  guides: Array<{ channel: string; programs: EpgProgram[] }>;
  isLoading: boolean;
};
