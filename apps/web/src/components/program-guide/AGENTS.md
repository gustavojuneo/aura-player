# Program Guide Component Guide

`ProgramGuide` is a shared compound component family. Import all consumer-facing
parts from `components/program-guide`, never from an internal file.

- Keep visual parts at the family root.
- Keep private stateful behavior in `hooks/`.
- Keep EPG formatting, filtering, and time calculations in `utils/`.
- Keep fixed application-wide values in `src/utils/constants.ts`, not here.
