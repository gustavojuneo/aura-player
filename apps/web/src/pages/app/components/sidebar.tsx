import { useNavigate } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { type FocusEvent, useState } from "react";
import { SourceSelector } from "../../../components/source-selector";
import { env } from "../../../env";
import { useCatalogSources } from "../../../hooks/use-catalog-data";
import {
  getActiveSourceId,
  setActiveSourceId,
} from "../../../services/catalog-db";
import { refreshCatalogSource } from "../../../services/catalog-service";
import { useAppLayoutStore } from "../../../stores/app-layout-store";
import { Brand } from "./brand";
import { APP_NAVIGATION } from "./navigation";
import { NavigationItem } from "./navigation-item";

export function Sidebar() {
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useAppLayoutStore();
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const [isSourceSelectorOpen, setIsSourceSelectorOpen] = useState(false);
  const isTv = env.VITE_DEVICE_TYPE === "tv";
  const isCollapsed = isTv || sidebarCollapsed;
  const { sources } = useCatalogSources();
  const activeSourceId = getActiveSourceId() ?? sources[0]?.id;
  const isExpanded =
    !isCollapsed || isHovered || hasFocusWithin || isSourceSelectorOpen;

  const handleBlurCapture = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHasFocusWithin(false);
    }
  };

  const handleSourceChange = (sourceId: string) => {
    const nextSource = sources.find((source) => source.id === sourceId);
    if (!nextSource || sourceId === getActiveSourceId()) return;
    setActiveSourceId(sourceId);
    void navigate({ to: "/app" });
    void refreshCatalogSource(nextSource).catch(() => undefined);
  };

  return (
    <div
      className={`relative z-[100] sticky top-0 hidden h-dvh shrink-0 lg:flex ${isCollapsed ? "w-[72px]" : "w-56"}`}
      data-tv-navigation-region="sidebar"
    >
      <aside
        aria-label="Barra lateral"
        className={`absolute inset-y-0 left-0 z-[60] overflow-hidden border-r border-line py-5 transition-[width,background-color,backdrop-filter] duration-200 ${isExpanded ? "w-56 bg-[#11100d]" : "w-[72px] bg-[#11100dcc] backdrop-blur-md"}`}
        onBlurCapture={handleBlurCapture}
        onFocusCapture={() => setHasFocusWithin(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`flex h-full min-w-0 flex-col gap-2 ${isExpanded ? "px-4" : "items-center"}`}
        >
          <div
            className={`flex min-h-10 w-full items-center ${isExpanded ? "justify-between" : "justify-center"}`}
          >
            <div
              className={
                isExpanded ? "min-w-0" : "grid size-10 place-items-center"
              }
            >
              <Brand collapsed={!isExpanded} />
            </div>
            <button
              aria-label={
                isCollapsed
                  ? "Expandir barra lateral"
                  : "Recolher barra lateral"
              }
              className={`size-7 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-panel hover:text-text focus-visible:outline-2 focus-visible:outline-focus ${isTv || !isExpanded ? "hidden" : "grid"}`}
              onClick={toggleSidebar}
              title={
                isCollapsed
                  ? "Expandir barra lateral"
                  : "Recolher barra lateral"
              }
              type="button"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </button>
          </div>
          <nav
            aria-label="Navegação principal"
            className={`mt-2 flex w-full flex-col gap-1 ${isExpanded ? "" : "items-center"}`}
          >
            {APP_NAVIGATION.map((item) => (
              <NavigationItem
                collapsed={!isExpanded}
                item={item}
                key={item.label}
              />
            ))}
          </nav>
          <div
            className={`mt-auto flex w-full flex-col gap-1 ${isExpanded ? "" : "items-center"}`}
          >
            <div className={isExpanded ? "mb-2 w-full" : "hidden"}>
              <SourceSelector
                activeSourceId={activeSourceId}
                className="w-full"
                onChange={handleSourceChange}
                onOpenChange={setIsSourceSelectorOpen}
                sources={sources}
              />
            </div>
            <NavigationItem
              collapsed={!isExpanded}
              item={{
                icon: "settings",
                label: "Configurações",
                to: "/app/settings",
              }}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
