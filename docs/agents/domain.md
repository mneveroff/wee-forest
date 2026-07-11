# Domain docs

How engineering skills should consume this repository's domain documentation.

## Before exploring, read these

- `CONTEXT.md` at the repository root, when it exists.
- Relevant ADRs under `docs/adr/`, when they exist.

If these files do not exist, proceed silently. The producer skill (`/grill-with-docs`) creates them lazily when terminology or architectural decisions are resolved.

## Layout

This is a single-context repository:

```text
/
├── CONTEXT.md
└── docs/adr/
```

## Use the glossary's vocabulary

Use terms as defined in `CONTEXT.md` in issue titles, proposals, hypotheses, and tests. Avoid synonyms that the glossary explicitly rejects.

If a needed concept is absent, reconsider whether it belongs to the domain or note the gap for `/grill-with-docs`.

## Flag ADR conflicts

Explicitly surface any proposal that contradicts an existing ADR rather than silently overriding the decision.
