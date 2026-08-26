import {
  Clapperboard,
  Heart,
  House,
  List,
  type LucideIcon,
  Play,
  Radio,
  Search,
  Settings,
  Tv,
} from "lucide-react";

export type IconName =
  | "clapperboard"
  | "heart"
  | "home"
  | "list"
  | "play"
  | "radio"
  | "search"
  | "settings"
  | "tv";

const icons: Record<IconName, LucideIcon> = {
  clapperboard: Clapperboard,
  heart: Heart,
  home: House,
  list: List,
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
