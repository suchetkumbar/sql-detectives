# SQL Detectives

SQL Detectives, currently branded in the UI as Coldcase SQL, is an interactive SQL learning game. Players solve mystery cases by writing real SQL queries against an in-browser SQLite database.

## Tech Stack

- React 19
- Vite
- TanStack Router / TanStack Start
- Tailwind CSS v4
- CodeMirror
- `sql.js`
- Cloudflare-oriented deployment config

## Getting Started

Use npm for this project.

```bash
npm install
npm run dev
```

The development server is started by Vite. Open the local URL printed in the terminal.

## Scripts

```bash
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm run typecheck
npm run test
npm run format
```

## Project Structure

- `src/routes/index.tsx`: landing page.
- `src/routes/cases.tsx`: case browser.
- `src/routes/case.$caseId.tsx`: main gameplay flow.
- `src/lib/cases.ts`: public case registry and type exports.
- `src/lib/cases/`: case modules, shared case types, validator helpers, and authoring template.
- `src/lib/sql-engine.ts`: in-browser SQLite setup and query execution.
- `src/components/SqlEditor.tsx`: SQL editor.
- `src/components/ResultsTable.tsx`: query result display.
- `src/components/RapidFire.tsx`: timed quiz flow.
- `memory/`: project notes and improvement planning.

## Adding Cases

Cases are authored as `Case` objects in `src/lib/cases/`. Each case contains its SQLite schema, chapter prompts, validation functions, rapid-fire questions, suspect list, and epilogue.

Use `src/lib/cases/template.ts` as the starter shape and `src/lib/cases/README.md` for the authoring checklist. Register new cases in `src/lib/cases.ts`, then add intended-solution fixtures in `src/lib/cases.test.ts`.
