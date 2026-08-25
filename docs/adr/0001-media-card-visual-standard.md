# ADR 0001: Media Card Visual Standard

- Status: Accepted
- Date: 2026-08-25

## Context

Movie and series covers use the portrait format established by the film
industry. Catalog cards also place titles and metadata over the lower part of
the artwork, so that content needs a consistent contrast treatment.

## Decision

All movie and series cards in the web application must:

1. Use a 2:3 width-to-height aspect ratio for the complete card, including
   loading skeletons.
2. Include an inner shadow along the bottom edge to improve the legibility of
   overlaid title and metadata.

The standard is implemented with Tailwind utilities in the movie and series
catalog card components. The loading skeleton follows the same aspect ratio and
shadow treatment to prevent layout shift and preserve the visual contract while
catalog data is loading.

## Consequences

- Cover artwork is displayed consistently across movie and series catalogs.
- Card height scales with the responsive grid column width instead of relying
  on a fixed pixel height.
- Text over artwork remains more readable without adding a separate panel that
  would obscure the cover.
- Future movie or series card variants should preserve these two properties
  unless a new ADR supersedes this decision.
