import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SourceSelector } from "../../../components/source-selector";
import { useCatalogSources } from "../../../hooks/use-catalog-data";
import {
  getActiveSourceId,
  setActiveSourceId,
} from "../../../services/catalog-db";
import { useAppLayoutStore } from "../../../stores/app-layout-store";
import { Brand } from "./brand";
import { APP_NAVIGATION } from "./navigation";
import { NavigationItem } from "./navigation-item";

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppLayoutStore();
  const { sources } = useCatalogSources();
  const activeSourceId = getActiveSourceId() ?? sources[0]?.id;

  return (
    <aside
      className={`relative z-[100] sticky top-0 hidden h-dvh shrink-0 lg:flex ${sidebarCollapsed ? "w-[72px]" : "w-56"}`}
    >
      <div
        className={`group/sidebar absolute inset-y-0 left-0 z-[60] flex flex-col gap-2 overflow-hidden border-r border-line p-[20px_16px] transition-[width,background-color,backdrop-filter] duration-200 ${sidebarCollapsed ? "w-[72px] bg-[#11100dcc] backdrop-blur-md hover:w-56" : "w-56 bg-[#11100d]"}`}
      >
        <div className="flex min-h-7 items-center justify-between gap-2">
          <div
            className={`flex ${sidebarCollapsed ? "w-10 justify-center group-hover/sidebar:w-auto group-hover/sidebar:justify-start" : ""}`}
          >
            <Brand collapsed={sidebarCollapsed} />
          </div>
          <button
            aria-label={
              sidebarCollapsed
                ? "Expandir barra lateral"
                : "Recolher barra lateral"
            }
            className={`ml-auto grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-muted transition-colors hover:bg-panel hover:text-text focus-visible:outline-2 focus-visible:outline-focus ${sidebarCollapsed ? "hidden group-hover/sidebar:grid" : ""}`}
            onClick={toggleSidebar}
            title={
              sidebarCollapsed
                ? "Expandir barra lateral"
                : "Recolher barra lateral"
            }
            type="button"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
        </div>
        <nav
          aria-label="Navegação principal"
          className="mt-2 flex flex-col gap-1"
        >
          {APP_NAVIGATION.map((item) => (
            <NavigationItem
              collapsed={sidebarCollapsed}
              item={item}
              key={item.label}
            />
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <SourceSelector
            activeSourceId={activeSourceId}
            className={`mb-2 w-full ${sidebarCollapsed ? "invisible opacity-0 transition-opacity group-hover/sidebar:visible group-hover/sidebar:opacity-100" : ""}`}
            onChange={(sourceId) => setActiveSourceId(sourceId)}
            sources={sources}
          />
          <NavigationItem
            collapsed={sidebarCollapsed}
            item={{
              icon: "settings",
              label: "Configurações",
              to: "/app/settings",
            }}
          />
          <button
            className={`mt-3 flex items-center gap-2 border-t border-line px-3 pt-4 text-xs font-semibold text-muted hover:text-text ${sidebarCollapsed ? "justify-center px-0 group-hover/sidebar:justify-start group-hover/sidebar:px-3" : ""}`}
            type="button"
          >
            <span className="grid size-8 shrink-0 aspect-square place-items-center rounded-full bg-gold text-xs font-extrabold text-ink">
              M
            </span>
            <span
              className={`truncate ${sidebarCollapsed ? "hidden group-hover/sidebar:inline" : ""}`}
            >
              Marina
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
