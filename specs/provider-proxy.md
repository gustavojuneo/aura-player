# Provider Proxy Specification

- Status: Accepted
- Date: 2026-08-27

## Scope

This specification defines the API media proxy's provider-host validation.

### PROXY-001: Public provider hosts

The API must accept HTTP and HTTPS provider URLs for arbitrary public hosts.
Provider hosts must not be restricted by a required environment-variable
allowlist.

### PROXY-002: Private target protection

The API must reject provider URLs whose DNS results include private, loopback,
link-local, or unspecified network addresses.

### PROXY-003: Configuration

`IPTV_PROXY_ALLOWED_HOSTS` must not be required or read by the API. Environment
examples and deployment configuration must not define it.

### PROXY-004: Media streaming

The media proxy must stream provider media through the API instead of returning
the final provider URL to the browser. It must preserve byte-range requests and
the response headers required for native video playback and seeking.

### PROXY-005: Redirect and certificate tolerance

The media proxy must follow a bounded chain of HTTP redirects, validate every
redirect target against the private-target protection, and support providers
whose HTTPS media endpoint has an invalid certificate when the same endpoint is
available over HTTP. The browser must only connect to the API proxy.

## Acceptance criteria

1. A public provider host not present in any project configuration can be
   validated by the media proxy.
2. Private network targets remain rejected.
3. Removing `IPTV_PROXY_ALLOWED_HOSTS` from the API environment does not prevent
   the API from starting.
4. A media response remains playable when its provider redirects from HTTPS to
   HTTP, without exposing the provider URL as the browser's media source.
5. Range requests sent to the media proxy are forwarded and the upstream
   content-range metadata is returned to the player.
