# Application Specifications

This directory is the normative source for product behavior, supported
capabilities, platform requirements, and acceptance criteria.

## Purpose

Specifications describe what the applications must do. They are distinct from:

- `README.md`, which introduces the project and its commands;
- `AGENTS.md`, which defines contribution and implementation rules;
- `docs/architecture.md`, which describes system structure and boundaries;
- `docs/adr/`, which records architectural decisions and their rationale;
- other files under `docs/`, which provide operational and implementation
  guidance.

Architecture and specifications must agree. When a requirement changes an
accepted architectural decision, update or supersede the corresponding ADR in
the same change.

## Specification rules

- Write specifications in English.
- Use kebab-case file names.
- Keep one cohesive product area or cross-platform contract per file.
- State status, scope, requirements, and verifiable acceptance criteria.
- Give requirements stable identifiers so implementation and tests can refer
  to them.
- Distinguish confirmed requirements from unresolved product decisions.
- Do not describe planned behavior as already implemented.
- Update the relevant specification whenever product behavior changes.
- Add new specifications only when there is a concrete requirement to record.

## Current specifications

- [Frontend platform separation](frontend-platform-separation.md): independent
  `web-app` and `web-tv` products, sharing boundaries, player composition, and
  TV volume behavior.
