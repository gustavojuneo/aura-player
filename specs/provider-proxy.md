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

## Acceptance criteria

1. A public provider host not present in any project configuration can be
   validated by the media proxy.
2. Private network targets remain rejected.
3. Removing `IPTV_PROXY_ALLOWED_HOSTS` from the API environment does not prevent
   the API from starting.
