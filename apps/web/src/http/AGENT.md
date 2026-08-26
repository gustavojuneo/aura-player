# HTTP Guide

This directory contains low-level typed Axios endpoint functions.

- Use the configured client from `client.ts`.
- Keep one endpoint concern per module and validate external responses at the
  boundary when required.
- Do not import HTTP modules into UI primitives. Pages and presentational
  components must consume services or hooks instead.
