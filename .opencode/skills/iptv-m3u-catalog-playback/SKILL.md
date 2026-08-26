---
name: iptv-m3u-catalog-playback
description: Use when changing M3U parsing, metadata normalization, source classification, live channels, or direct M3U playback.
---

# M3U Catalog And Playback

Read `docs/architecture.md` and `AGENTS.md` before catalog changes. Keep M3U
parsing and provider integration in the API/provider boundary, pure
normalization rules in the domain package when shared, and UI rendering inside
the web page/component boundaries.

The parser and normalizer live in `apps/api/src/catalog/m3u.ts` and
`packages/domain`. M3U metadata is optional and provider input is untrusted.

- Accept CRLF and LF input without assuming a perfect playlist.
- Pair `#EXTINF` with a following usable stream URL.
- Preserve titles containing commas and treat missing metadata as null.
- Parse attributes case-insensitively and avoid throwing on malformed lines.
- Infer live/movie/series conservatively; do not manufacture identity from guesses.
- Preserve source IDs and direct stream URLs on normalized items.
- Handle missing descriptions, posters, categories, seasons, and episodes in UI.
- Do not add a media proxy without explicit bandwidth, abuse, caching, and observability design.
- Keep endpoint adaptation in `apps/api/src/infra/http/`, provider integration
  in API infrastructure, and module operations in the relevant API module.
- Keep shared Zod transport schemas in `packages/contracts`; do not duplicate
  equivalent request/response types across web and API.
- Keep page-only catalog cards, filters, and playback controls in
  `apps/web/src/pages/<page>/components/`; keep reusable primitives in
  `apps/web/src/components/ui/`.

Add regression tests for malformed input, optional attributes, classification, and
URL preservation. Run domain/API tests and web validation when shapes change.
