import {
  Clapperboard,
  Database,
  Heart,
  House,
  type LucideIcon,
  Play,
  Radio,
  Search,
  Settings,
  Tv,
} from "lucide-react";

export type IconName =
  | "clapperboard"
  | "database"
  | "heart"
  | "home"
  | "play"
  | "radio"
  | "search"
  | "settings"
  | "tv";

const icons: Record<IconName, LucideIcon> = {
  clapperboard: Clapperboard,
  database: Database,
  heart: Heart,
  home: House,
  play: Play,
  radio: Radio,
  search: Search,
  settings: Settings,
  tv: Tv,
};

export function Icon({
  name,
  className = "size-5",
}: {
  name: IconName;
  className?: string;
}) {
  const Component = icons[name];
  return (
    <Component aria-hidden="true" className={className} strokeWidth={1.8} />
  );
}
