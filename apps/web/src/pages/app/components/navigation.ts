import type { IconName } from "../../../components/icon";

export type NavigationItem = {
  icon: IconName;
  label: string;
  to?:
    | "/app"
    | "/app/tv"
    | "/app/movies"
    | "/app/series"
    | "/app/favorites"
    | "/app/sources"
    | "/app/settings";
};

export const APP_NAVIGATION: NavigationItem[] = [
  { icon: "home", label: "Início", to: "/app" },
  { icon: "radio", label: "TV ao vivo", to: "/app/tv" },
  { icon: "clapperboard", label: "Filmes", to: "/app/movies" },
  { icon: "tv", label: "Séries", to: "/app/series" },
  { icon: "heart", label: "Favoritos", to: "/app/favorites" },
  { icon: "list", label: "Listas IPTV", to: "/app/sources" },
];
