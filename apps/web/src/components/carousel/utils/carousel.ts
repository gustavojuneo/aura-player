export function canScrollForward(viewport: HTMLDivElement) {
  return viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1;
}

export function getCarouselScrollOffset(viewport: HTMLDivElement) {
  return Math.max(viewport.clientWidth * 0.82, 240);
}
