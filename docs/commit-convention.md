# Commit Convention

All project commits must follow the Conventional Commits specification.

## Format

```text
<type>(<scope>): <description>
```

The description is mandatory, concise, written in the imperative mood, and
must explain the change. Use an optional scope to identify the affected area.

Allowed types are:

- `feat`: a new user-facing capability;
- `fix`: a bug correction;
- `refactor`: a code change without behavior or feature change;
- `docs`: documentation-only changes;
- `test`: adding or changing tests;
- `build`: build system or dependency changes;
- `ci`: continuous-integration changes;
- `perf`: a performance improvement;
- `style`: formatting or non-functional style changes;
- `chore`: maintenance that does not fit another type.

Examples:

```text
feat(player): add episode auto-advance
fix(catalog): preserve stable card keys
refactor(media-player): extract playback lifecycle hook
docs(architecture): define component-family boundaries
```

Commits must include a body separated from the subject by one blank line. The
body must describe the alterations made and, when useful, their rationale. The
only exception is a small, self-explanatory change whose subject already makes
the alteration completely clear. Breaking changes must use a `!` after the
type or scope and include a `BREAKING CHANGE:` footer.

```text
refactor(carousel): move private behavior into family hooks

Keep visual modules at the family root and isolate scroll behavior under
hooks/ so the public barrel remains stable.
```

Agents must inspect the complete diff before committing and must not create
vague subjects such as `update`, `changes`, or `fix stuff`. Related changes
should be grouped in one coherent commit; unrelated changes require separate
commits when practical. If omitting the body for a small change, the subject
must explicitly identify the complete alteration.
