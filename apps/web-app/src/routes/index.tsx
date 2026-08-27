import {
  createBrowserHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { createAppRouteTree } from "./app";

const LandingPage = lazy(() =>
  import("../pages").then(({ LandingPage: page }) => ({ default: page })),
);

const rootRoute = createRootRoute({ component: Outlet });
const landingRoute = createRoute({
  component: () => (
    <Suspense>
      <LandingPage />
    </Suspense>
  ),
  getParentRoute: () => rootRoute,
  path: "/",
});

export const router = createRouter({
  history: createBrowserHistory(),
  routeTree: rootRoute.addChildren([
    landingRoute,
    createAppRouteTree(rootRoute),
  ]),
});
