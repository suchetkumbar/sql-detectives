# Case Authoring Guide

Each case is a self-contained SQLite mystery. A case owns its story metadata, schema, seeded data, chapter prompts, validators, rapid-fire questions, suspects, murderer id, and epilogue.

## Files

- `types.ts`: shared case and chapter contracts.
- `validators.ts`: reusable result helpers for chapter validation.
- `velvet-lounge.ts`, `ashford-line.ts`, `blackwood-manor.ts`: authored cases.
- `template.ts`: starter shape for future cases.
- `../cases.ts`: public registry that exports `CASES`, `getCase`, and shared types.

## Adding a Case

1. Copy `template.ts` to a new file named after the case id.
2. Fill in the case metadata and schema.
3. Add chapters with focused SQL tasks and validators.
4. Add rapid-fire questions and final suspect data.
5. Export the case constant.
6. Register it in `src/lib/cases.ts`.
7. Add intended-solution fixtures to `src/lib/cases.test.ts`.
8. Run `npm run test`, `npm run lint`, and `npm run typecheck`.

## Validation Guidance

- Prefer validating result rows and key columns, not exact SQL text.
- Use `equalsSet` when order does not matter.
- Use `containsRow` when the task only needs one important row among broader output.
- Check row counts and required columns when a chapter depends on shape.
- Add at least one negative test for likely wrong answers when the validator logic is subtle.
