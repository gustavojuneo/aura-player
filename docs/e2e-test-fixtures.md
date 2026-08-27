# E2E Test Fixtures

The repository contains deterministic source fixtures for future end-to-end
tests. They use fictional credentials and public sample videos; they are not
production IPTV sources and must never be replaced with real provider data.

## M3U fixture

Use [`tests/fixtures/sources/aura-e2e.m3u`](../tests/fixtures/sources/aura-e2e.m3u)
when a test needs to exercise M3U import. It contains one live item, one movie,
and two episodes from one series. The public video URLs are suitable for media
playback assertions and do not require an IPTV account.

## Xtream fixture

Use [`tests/fixtures/xtream/aura-e2e-account.json`](../tests/fixtures/xtream/aura-e2e-account.json)
as the fictional account submitted by the test. The server uses the reserved
`.invalid` domain and must be intercepted by the future test mock layer.

The matching [`aura-e2e-player-api.json`](../tests/fixtures/xtream/aura-e2e-player-api.json)
contains the expected `player_api.php` responses for live, movie, series,
category, and episode data. A mock Xtream server can dispatch its
`responses.<action>` values based on the `action` query parameter.

## Usage contract

- Tests must load fixture files rather than duplicating source data inline.
- Tests must intercept the `.invalid` Xtream server and the frontend API calls
  that depend on it.
- Fixture credentials are intentionally fake and must not be used as a
  fallback in application runtime configuration.
- Public sample video URLs may be replaced only with another stable public
  test asset and only together with the affected E2E assertions.
