import { Link } from "@tanstack/react-router";
import { Icon } from "../../../components/icon";
import type { NavigationItem as NavigationItemData } from "./navigation";

const itemClassName =
  "flex items-center gap-3 rounded-[10px] text-left text-[0.8125rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function NavigationItem({
  collapsed = false,
  item,
  mobile = false,
}: {
  collapsed?: boolean;
  item: NavigationItemData;
  mobile?: boolean;
}) {
  const mobileClassName = mobile
    ? "h-auto w-16 flex-col gap-1 px-0 text-[0.625rem]"
    : collapsed
      ? "h-10 w-10 shrink-0 justify-center px-0 group-hover/sidebar:h-10 group-hover/sidebar:w-full group-hover/sidebar:justify-start group-hover/sidebar:px-2.5 group-focus-within/sidebar:h-10 group-focus-within/sidebar:w-full group-focus-within/sidebar:justify-start group-focus-within/sidebar:px-2.5"
      : "h-10 w-full px-2.5";

  if (item.to) {
    return (
      <Link
        activeOptions={{ exact: item.to === "/app" }}
        activeProps={{
          className: `${itemClassName} border border-gold/80 bg-[#3b2e18] text-text ${mobileClassName}`,
        }}
        className={`${itemClassName} border border-transparent text-muted hover:bg-panel hover:text-text ${mobileClassName}`}
        to={item.to}
      >
        <Icon
          className={`size-5 shrink-0 ${mobile ? "text-current" : "text-muted"}`}
          name={item.icon}
        />
        <span
          className={`truncate ${collapsed ? "hidden group-hover/sidebar:inline group-focus-within/sidebar:inline" : ""}`}
        >
          {mobile && item.label === "TV ao vivo" ? "Ao vivo" : item.label}
        </span>
      </Link>
    );
  }

  return (
    <button
      className={`${itemClassName} border border-transparent text-muted hover:bg-panel hover:text-text ${mobileClassName}`}
      disabled
      type="button"
    >
      <Icon className="size-5 shrink-0" name={item.icon} />
      <span
        className={`truncate ${collapsed ? "hidden group-hover/sidebar:inline group-focus-within/sidebar:inline" : ""}`}
      >
        {item.label}
      </span>
    </button>
  );
}
