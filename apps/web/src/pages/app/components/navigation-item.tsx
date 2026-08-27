import { Link } from "@tanstack/react-router";
import { Icon } from "../../../components/icon";
import type { NavigationItem as NavigationItemData } from "./navigation";

const itemClassName =
  "group flex items-center gap-3 rounded-[10px] border text-left text-[0.8125rem] font-semibold transition-colors focus:!outline-none focus-visible:!outline-none";

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
      ? "grid size-10 shrink-0 place-items-center p-0"
      : "h-10 w-full px-0";

  if (item.to) {
    return (
      <Link
        data-sidebar-item="true"
        activeOptions={{ exact: item.to === "/app" }}
        activeProps={{
          "data-status": "active",
          className: `${itemClassName} border-transparent bg-transparent text-text ${mobileClassName}`,
        }}
        className={`${itemClassName} border-transparent text-muted hover:bg-panel hover:text-text ${mobileClassName}`}
        to={item.to}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-transparent text-current transition-colors group-data-[status=active]:bg-panel-2 group-focus-visible:bg-gold group-focus-visible:text-ink">
          <Icon
            className={`size-5 ${mobile ? "text-current" : "text-muted"} group-data-[status=active]:text-text group-focus-visible:text-ink`}
            name={item.icon}
          />
        </span>
        <span className={`truncate ${collapsed ? "hidden" : ""}`}>
          {mobile && item.label === "TV ao vivo" ? "Ao vivo" : item.label}
        </span>
      </Link>
    );
  }

  return (
    <button
      data-sidebar-item="true"
      className={`${itemClassName} border-transparent text-muted hover:bg-panel hover:text-text ${mobileClassName}`}
      disabled
      type="button"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg transition-colors group-focus-visible:bg-gold group-focus-visible:text-ink">
        <Icon
          className="size-5 group-focus-visible:text-ink"
          name={item.icon}
        />
      </span>
      <span className={`truncate ${collapsed ? "hidden" : ""}`}>
        {item.label}
      </span>
    </button>
  );
}
