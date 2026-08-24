export type SourceType = "m3u" | "xtream";
export type SourceStatus = "active" | "available" | "error";

export type Source = {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  detail: string;
  contentCount?: number;
  server?: string;
  username?: string;
  password?: string;
  url?: string;
};

export type SourceFormValues = {
  name: string;
  type: SourceType;
  server: string;
  username: string;
  password: string;
  url: string;
};
