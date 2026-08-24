import { createRootRoute, createRouter } from "@tanstack/react-router";

import { LandingPage } from "../pages";

const rootRoute = createRootRoute({ component: LandingPage });

export const router = createRouter({
  routeTree: rootRoute,
});
