import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import { LandingPage } from "../pages";
import { OnboardingPage } from "../pages/onboarding";

const rootRoute = createRootRoute({ component: Outlet });
const landingRoute = createRoute({
  component: LandingPage,
  getParentRoute: () => rootRoute,
  path: "/",
});
const appRoute = createRoute({
  component: Outlet,
  getParentRoute: () => rootRoute,
  path: "app",
});
const onboardingRoute = createRoute({
  component: OnboardingPage,
  getParentRoute: () => appRoute,
  path: "onboarding",
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  appRoute.addChildren([onboardingRoute]),
]);

export const router = createRouter({
  routeTree,
});
