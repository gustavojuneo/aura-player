import { type AnyRoute, createRoute } from "@tanstack/react-router";
import { AppLayout } from "../../pages/app/layout";
import { createCatalogRoutes } from "./catalog";
import { createFavoriteRoutes } from "./favorites";
import { HomePage, SettingsPage, SourcesPage } from "./pages";

export function createAppRouteTree(parentRoute: AnyRoute) {
  const appRoute = createRoute({
    component: AppLayout,
    getParentRoute: () => parentRoute,
    id: "app",
  });
  const homeRoute = createRoute({
    component: HomePage,
    getParentRoute: () => appRoute,
    path: "/",
  });
  const sourcesRoute = createRoute({
    component: SourcesPage,
    getParentRoute: () => appRoute,
    path: "sources",
  });
  const settingsRoute = createRoute({
    component: SettingsPage,
    getParentRoute: () => appRoute,
    path: "settings",
  });
  return appRoute.addChildren([
    homeRoute,
    ...createCatalogRoutes(appRoute),
    ...createFavoriteRoutes(appRoute),
    sourcesRoute,
    settingsRoute,
  ]);
}
