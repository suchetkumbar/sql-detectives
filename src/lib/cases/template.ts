import type { Case } from "./types";

export const CASE_TEMPLATE: Case = {
  id: "new-case-id",
  difficulty: "beginner",
  title: "New Case Title",
  tagline: "A short hook for the case.",
  location: "Case location",
  year: "Year",
  synopsis: "One paragraph that frames the mystery and why SQL matters.",
  victim: "Victim name and short descriptor",
  schemaSummary: `
**table_name** ( id, important_column, related_id )`,
  schema: `
CREATE TABLE table_name (
  id INTEGER PRIMARY KEY,
  important_column TEXT,
  related_id INTEGER
);

INSERT INTO table_name VALUES
 (1, 'Example', NULL);
`,
  chapters: [
    {
      id: "c1",
      title: "Chapter I - First Lead",
      narrative: "Story context for the first task.",
      task: "Return the key row needed to advance the investigation.",
      hint: "SELECT important_column FROM table_name;",
      validate: (rows, columns) => ({
        ok: columns.includes("important_column") && rows.length > 0,
        message: "Return at least one row with important_column.",
      }),
      reveal: "The story beat unlocked by the correct query.",
    },
  ],
  rapidFire: {
    intro: "Timed SQL fundamentals interlude.",
    timePerQuestion: 10,
    questions: [
      {
        prompt: "Which clause filters rows before grouping?",
        options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"],
        correctIndex: 0,
        explanation: "WHERE filters rows before GROUP BY.",
      },
    ],
    failureConsequence: "What happens if the player fails the rapid-fire section.",
    successReward: "What happens if the player passes the rapid-fire section.",
  },
  suspects: [
    {
      id: "1",
      name: "Suspect Name",
      alias: "The Alias",
      description: "One short suspect description.",
    },
  ],
  murdererId: "1",
  epilogue: "The final resolution.",
};
