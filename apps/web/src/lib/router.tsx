import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import { LandingPage } from "../pages";
import { HomePage } from "../pages/app";
import { MoviesPage } from "../pages/app/movies";
import { SeriesPage } from "../pages/app/series";
import { TvPage } from "../pages/app/tv";
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
const homeRoute = createRoute({
  component: HomePage,
  getParentRoute: () => appRoute,
  path: "/",
});
const onboardingRoute = createRoute({
  component: OnboardingPage,
  getParentRoute: () => appRoute,
  path: "onboarding",
});
const tvRoute = createRoute({
  component: TvPage,
  getParentRoute: () => appRoute,
  path: "tv",
});
const moviesRoute = createRoute({
  component: MoviesPage,
  getParentRoute: () => appRoute,
  path: "movies",
});
const seriesRoute = createRoute({
  component: SeriesPage,
  getParentRoute: () => appRoute,
  path: "series",
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  appRoute.addChildren([
    homeRoute,
    onboardingRoute,
    tvRoute,
    moviesRoute,
    seriesRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
});
