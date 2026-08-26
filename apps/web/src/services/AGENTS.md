# Services Guide

Services coordinate frontend use cases, TanStack Query queries/mutations, and
cache updates. They may call modules in `http/`, but pages and components should
not call Axios directly.

- Keep query keys stable and colocated with the query behavior.
- Keep business/use-case coordination here, not inside visual components.
- Use optimistic updates only with cancellation, snapshot, rollback, and
  reconciliation when the operation is safely predictable.
