export const SOURCE_OPTIONS = [
  {
    description: "Uma URL simples para canais e catálogo.",
    label: "Adicionar M3U",
    type: "m3u",
  },
  {
    description: "Servidor, usuário e senha com teste prévio.",
    label: "Adicionar Xtream Codes",
    type: "xtream",
  },
] as const;

export type SourceType = (typeof SOURCE_OPTIONS)[number]["type"];

export const ASPECT_RATIO_OPTIONS = [
  { label: "Original", value: "original" },
  { label: "16:9", value: "16:9" },
  { label: "4:3", value: "4:3" },
  { label: "Preencher", value: "fill" },
  { label: "Cortar", value: "crop" },
] as const;

export type PlayerAspectRatio = (typeof ASPECT_RATIO_OPTIONS)[number]["value"];
