import {
  createHashHistory,
  createRootRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { createAppRouteTree } from "./app";

const rootRoute = createRootRoute({ component: Outlet });

export const router = createRouter({
  history: createHashHistory(),
  routeTree: rootRoute.addChildren([createAppRouteTree(rootRoute)]),
});
