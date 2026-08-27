import type { IconName } from "../../../components/icon";

export type NavigationItem = {
  icon: IconName;
  label: string;
  path?:
    | "/"
    | "/tv"
    | "/movies"
    | "/series"
    | "/favorites"
    | "/sources"
    | "/settings";
};

export const APP_NAVIGATION: NavigationItem[] = [
  { icon: "home", label: "Início", path: "/" },
  { icon: "radio", label: "TV ao vivo", path: "/tv" },
  { icon: "clapperboard", label: "Filmes", path: "/movies" },
  { icon: "tv", label: "Séries", path: "/series" },
  { icon: "heart", label: "Favoritos", path: "/favorites" },
  { icon: "list", label: "Fontes de conteúdo", path: "/sources" },
];
