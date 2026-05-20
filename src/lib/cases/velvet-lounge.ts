import type { Case } from "./types";
import { containsRow, equalsSet } from "./validators";

// ═════════════════════════════════════════════════════════════════════════════
// CASE 1 — BEGINNER — The Velvet Lounge
// ═════════════════════════════════════════════════════════════════════════════
export const CASE_VELVET: Case = {
  id: "velvet-lounge",
  difficulty: "beginner",
  title: "The Velvet Lounge",
  tagline: "A jazz singer. A spilled martini. A body behind the curtain.",
  location: "Manhattan, NYC",
  year: "1947",
  synopsis:
    "Eleanor Voss, the toast of 52nd Street, was found dead in her dressing room ten minutes after her final set. The club was packed. Someone in that room knew. Walk the patrons one query at a time.",
  victim: "Eleanor Voss — jazz vocalist, 29",
  schemaSummary: `
**suspects** ( id, name, occupation, table_number, left_at )
**witnesses** ( id, suspect_id, statement )
**drinks** ( id, suspect_id, drink, ordered_at )
**evidence** ( id, item, found_near, suspect_id )`,
  schema: `
CREATE TABLE suspects (
  id INTEGER PRIMARY KEY, name TEXT, occupation TEXT,
  table_number INTEGER, left_at TEXT
);
INSERT INTO suspects VALUES
 (1,'Marlon Reeves','Saxophonist',  NULL, '23:45'),
 (2,'Iris DuPont',   'Heiress',     3,    '23:10'),
 (3,'Sal Moretti',   'Club Owner',  NULL, '23:55'),
 (4,'Hank Boyle',    'Detective',   7,    '23:20'),
 (5,'Clara Wynn',    'Stage Manager', NULL, '23:50'),
 (6,'Vincent Cole',  'Banker',      3,    '23:05');

CREATE TABLE witnesses (id INTEGER PRIMARY KEY, suspect_id INTEGER, statement TEXT);
INSERT INTO witnesses VALUES
 (1, 2, 'Vincent left our table furious after Eleanor waved at someone in the wings.'),
 (2, 1, 'I was on stage during her last number, then I went straight to the bar.'),
 (3, 5, 'I saw a tall figure slip behind the velvet curtain at 11:48 PM.'),
 (4, 4, 'I had been tailing Sal Moretti all night for a bookkeeping case.'),
 (5, 6, 'I left early. I have nothing to say about Eleanor.');

CREATE TABLE drinks (id INTEGER PRIMARY KEY, suspect_id INTEGER, drink TEXT, ordered_at TEXT);
INSERT INTO drinks VALUES
 (1,1,'Whiskey','22:30'),(2,1,'Whiskey','23:30'),
 (3,2,'Martini','22:45'),(4,2,'Martini','23:00'),
 (5,3,'Coffee','22:15'),
 (6,4,'Whiskey','22:50'),
 (7,5,'Water','23:00'),
 (8,6,'Martini','22:40'),(9,6,'Martini','22:55');

CREATE TABLE evidence (id INTEGER PRIMARY KEY, item TEXT, found_near TEXT, suspect_id INTEGER);
INSERT INTO evidence VALUES
 (1,'Monogrammed cufflink V.C.','dressing room', 6),
 (2,'Cigar stub','stage door', 3),
 (3,'Torn sheet music','backstage', 1),
 (4,'Lipstick — Crimson No. 4','dressing room', NULL);
`,
  chapters: [
    {
      id: "c1",
      title: "Chapter I — The Guest List",
      narrative:
        "The maître d' hands you a smudged guest list. Six names, six stories. Start by seeing every suspect the club had eyes on tonight.",
      task: "List every suspect — their name and occupation.",
      hint: "SELECT name, occupation FROM suspects;",
      validate: (rows, cols) => {
        if (cols.length < 2)
          return { ok: false, message: "Need at least two columns: name and occupation." };
        return {
          ok: rows.length === 6,
          message: rows.length === 6 ? undefined : `Expected 6 suspects, got ${rows.length}.`,
        };
      },
      reveal:
        "Six suspects. The clock ticks. Most are bluffing. One is bleeding through their cuffs.",
    },
    {
      id: "c2",
      title: "Chapter II — Who Stayed Late?",
      narrative:
        "The coroner places time of death between 11:45 and 11:55 PM. Anyone who left before 11:45 has an alibi.",
      task: "Find the names of suspects who left at or after '23:45'.",
      hint: "Use WHERE left_at >= '23:45'. Strings compare lexicographically here.",
      validate: (rows) => {
        const expected = [["Marlon Reeves"], ["Sal Moretti"], ["Clara Wynn"]];
        return {
          ok: equalsSet(rows, expected),
          message: "Looking for the three who lingered past 11:45.",
        };
      },
      reveal:
        "Three names. The saxophonist, the owner, the stage manager. The detective and the heiress are off the board.",
    },
    {
      id: "c3",
      title: "Chapter III — Table Three",
      narrative:
        "Witness #1 said Vincent stormed off from table three. Who else was at table three?",
      task: "List the names of every suspect seated at table 3.",
      hint: "WHERE table_number = 3",
      validate: (rows) => {
        const expected = [["Iris DuPont"], ["Vincent Cole"]];
        return { ok: equalsSet(rows, expected) };
      },
      reveal: "Iris and Vincent. Lovers' table — or something colder.",
    },
    {
      id: "c4",
      title: "Chapter IV — The Cufflink",
      narrative: "A monogrammed cufflink was found in the dressing room. Whose?",
      task: "Join the evidence and suspects tables. Return the suspect name AND the item, for evidence found in the 'dressing room' that is tied to a suspect.",
      hint: "JOIN suspects ON suspects.id = evidence.suspect_id WHERE found_near = 'dressing room'",
      validate: (rows) =>
        containsRow(rows, ["Vincent Cole", "Monogrammed cufflink V.C."])
          ? { ok: true }
          : { ok: false, message: "Your row should pair the suspect name with the item." },
      reveal:
        "Vincent Cole. He swore he left early — and yet his cufflink lay six feet from the body.",
    },
  ],
  rapidFire: {
    intro:
      "Vincent is bolting. The fire escape creaks. You have 60 seconds at the precinct radio to keep the patrol from losing him — answer fast.",
    timePerQuestion: 12,
    failureConsequence: "Vincent slips into the alley fog. The case goes cold for 11 years.",
    successReward:
      "Patrol catches Vincent at the docks. He's in your interrogation room within the hour.",
    questions: [
      {
        prompt: "Which clause filters rows AFTER a GROUP BY?",
        options: ["WHERE", "HAVING", "FILTER", "ORDER BY"],
        correctIndex: 1,
        explanation: "HAVING runs after aggregation; WHERE runs before.",
      },
      {
        prompt: "Which keyword returns only unique values?",
        options: ["UNIQUE", "DISTINCT", "ONLY", "SET"],
        correctIndex: 1,
        explanation: "SELECT DISTINCT col removes duplicates.",
      },
      {
        prompt: "What does COUNT(*) return for a table of 0 rows?",
        options: ["NULL", "0", "Error", "1"],
        correctIndex: 1,
        explanation: "COUNT always returns a number, never NULL.",
      },
      {
        prompt: "Which JOIN keeps every row from the LEFT table?",
        options: ["INNER", "LEFT", "RIGHT", "CROSS"],
        correctIndex: 1,
        explanation: "LEFT JOIN preserves all left rows; unmatched right side is NULL.",
      },
      {
        prompt: "How do you sort newest first by a column 'ordered_at'?",
        options: [
          "ORDER BY ordered_at",
          "SORT ordered_at DESC",
          "ORDER BY ordered_at DESC",
          "RANK ordered_at",
        ],
        correctIndex: 2,
        explanation: "ORDER BY ... DESC for descending.",
      },
    ],
  },
  suspects: [
    {
      id: "1",
      name: "Marlon Reeves",
      alias: "The Sax",
      description: "Played the closing number. Whiskey on his breath.",
    },
    {
      id: "2",
      name: "Iris DuPont",
      alias: "The Heiress",
      description: "Left early. Money to burn, motive unclear.",
    },
    {
      id: "3",
      name: "Sal Moretti",
      alias: "The Owner",
      description: "Walked Eleanor to her car most nights. Not tonight.",
    },
    {
      id: "4",
      name: "Hank Boyle",
      alias: "The Tail",
      description: "A detective at table seven. Tailing Moretti.",
    },
    {
      id: "5",
      name: "Clara Wynn",
      alias: "Stagehand",
      description: "Saw someone slip behind the curtain at 11:48.",
    },
    {
      id: "6",
      name: "Vincent Cole",
      alias: "The Banker",
      description: "Left his cufflink in a dead woman's dressing room.",
    },
  ],
  murdererId: "6",
  epilogue:
    "Vincent Cole — banker, fiancé to Iris, and Eleanor's secret. He'd been bleeding cash to her for two years. Tonight she asked for more. He brought a cord instead. The cufflink gave him up.",
};
