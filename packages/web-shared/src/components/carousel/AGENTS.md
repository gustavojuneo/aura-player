# Carousel Component Guide

`Carousel` is a shared compound component family. Consumers import `Carousel`
and its public parts only from `components/carousel`.

- The family root contains the root, track, and navigation visuals.
- `hooks/` contains carousel-private scroll and resize behavior.
- `utils/` contains pure measurements and scroll predicates.
- Keep cards and catalog data outside this family; it only owns horizontal
  viewport behavior and navigation controls.
