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

`media-resolve` must follow the provider redirect chain and return the final
media URL to the frontend. The API must also provide a proxy URL for cases in
which a secure frontend cannot directly load an HTTP final URL.

### PROXY-005: Redirect and certificate tolerance

The resolver must follow a bounded chain of HTTP redirects, validate every
redirect target against the private-target protection, and support providers
whose HTTPS media endpoint has an invalid certificate when the same endpoint is
available over HTTP. The frontend must load the returned final URL whenever
the browser platform permits it, and use the proxy only when required by
browser mixed-content rules.

## Acceptance criteria

1. A public provider host not present in any project configuration can be
   validated by the media proxy.
2. Private network targets remain rejected.
3. Removing `IPTV_PROXY_ALLOWED_HOSTS` from the API environment does not prevent
   the API from starting.
4. HTTP and HTTPS initial URLs resolve to final HTTP or HTTPS media URLs.
5. A secure frontend uses the media proxy only when the resolved final URL is
   HTTP; otherwise it loads the resolved final URL directly.
6. Range requests sent to the media proxy are forwarded and the upstream
   content-range metadata is returned to the player.
