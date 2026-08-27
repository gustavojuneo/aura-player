import { MoviesPage as SharedMoviesPage } from "@aura/web-shared/pages/app/movies";
import { SeriesPage as SharedSeriesPage } from "@aura/web-shared/pages/app/series";
import { TvPage as SharedTvPage } from "@aura/web-shared/pages/app/tv";
import { useRef } from "react";
import { useSearchShortcut } from "../hooks/use-search-shortcut";

export function MoviesPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  useSearchShortcut(searchInputRef);
  return <SharedMoviesPage searchInputRef={searchInputRef} />;
}

export function SeriesPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  useSearchShortcut(searchInputRef);
  return <SharedSeriesPage searchInputRef={searchInputRef} />;
}

export function TvPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  useSearchShortcut(searchInputRef);
  return <SharedTvPage searchInputRef={searchInputRef} />;
}
