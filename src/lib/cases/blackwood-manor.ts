import type { Case } from "./types";
import { containsRow, equalsSet } from "./validators";

// CASE 3 — ADVANCED — The Cipher of Blackwood Manor
// ═════════════════════════════════════════════════════════════════════════════
export const CASE_BLACKWOOD: Case = {
  id: "blackwood-manor",
  difficulty: "advanced",
  title: "The Cipher of Blackwood Manor",
  tagline: "A locked study. A coded ledger. A killer with patience for spreadsheets.",
  location: "Cornish coast, England",
  year: "1989",
  synopsis:
    "Lord Ambrose Blackwood died at his desk with a fountain pen in his neck. The estate's surveillance system, financial ledgers, and staff schedules survived him. Use them.",
  victim: "Lord Ambrose Blackwood — financier, 71",
  schemaSummary: `
**staff** ( id, name, role, hired_year, salary )
**guests** ( id, name, relation, arrived_at, left_at )
**rooms** ( id, name )
**cam_log** ( id, ts, room_id, person_type, person_id )   -- person_type IN ('staff','guest')
**ledger** ( id, ts, amount, beneficiary_staff_id, memo )
**keys** ( id, holder_staff_id, room_id )`,
  schema: `
CREATE TABLE staff (id INTEGER PRIMARY KEY, name TEXT, role TEXT, hired_year INTEGER, salary INTEGER);
INSERT INTO staff VALUES
 (1,'Mrs. Hadley','Housekeeper',1971,18000),
 (2,'Giles Thorpe','Butler',1965,24000),
 (3,'Owen Marsh','Groundskeeper',1985,14000),
 (4,'Rosa Vargas','Cook',1980,16000),
 (5,'Daniel Reeve','Personal Secretary',1987,28000),
 (6,'Imogen Carr','Nurse',1986,22000);

CREATE TABLE guests (id INTEGER PRIMARY KEY, name TEXT, relation TEXT, arrived_at TEXT, left_at TEXT);
INSERT INTO guests VALUES
 (1,'Cassandra Blackwood','Daughter','18:00',NULL),
 (2,'Julian Blackwood','Nephew','19:15',NULL),
 (3,'Vera Holst','Business partner','20:00','22:40'),
 (4,'Father Owen','Vicar','17:30','21:00');

CREATE TABLE rooms (id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO rooms VALUES
 (1,'Study'),(2,'Library'),(3,'Drawing Room'),(4,'Kitchen'),(5,'East Wing Hall'),(6,'Servants'' Quarters');

CREATE TABLE cam_log (id INTEGER PRIMARY KEY, ts TEXT, room_id INTEGER, person_type TEXT, person_id INTEGER);
INSERT INTO cam_log VALUES
 (1,'21:30',5,'staff',2),
 (2,'21:45',1,'guest',1),
 (3,'21:50',1,'staff',5),
 (4,'22:00',1,'guest',2),
 (5,'22:05',5,'staff',5),
 (6,'22:10',1,'staff',5),
 (7,'22:20',1,'staff',5),
 (8,'22:25',2,'guest',1),
 (9,'22:30',1,'staff',5),
 (10,'22:35',5,'staff',2),
 (11,'22:40',1,'staff',5),
 (12,'22:45',1,'guest',2),
 (13,'22:50',4,'staff',4),
 (14,'23:00',1,'staff',1),
 (15,'23:05',1,'staff',5);

CREATE TABLE ledger (id INTEGER PRIMARY KEY, ts TEXT, amount INTEGER, beneficiary_staff_id INTEGER, memo TEXT);
INSERT INTO ledger VALUES
 (1,'1989-04-01',  500, 1, 'Standard bonus'),
 (2,'1989-04-01',  500, 2, 'Standard bonus'),
 (3,'1989-04-01',  500, 4, 'Standard bonus'),
 (4,'1989-04-01',  500, 5, 'Standard bonus'),
 (5,'1989-06-12',15000, 5, 'Discretionary — D.R.'),
 (6,'1989-07-04',12000, 5, 'Discretionary — D.R.'),
 (7,'1989-08-20',18000, 5, 'Discretionary — D.R.'),
 (8,'1989-09-30', 9000, 5, 'Discretionary — D.R.'),
 (9,'1989-10-11',  500, 6, 'Standard bonus');

CREATE TABLE keys (id INTEGER PRIMARY KEY, holder_staff_id INTEGER, room_id INTEGER);
INSERT INTO keys VALUES
 (1,2,1),(2,5,1),(3,1,1),(4,2,2),(5,2,3),(6,4,4),(7,1,6),(8,3,5);
`,
  chapters: [
    {
      id: "c1",
      title: "Chapter I — Keys to the Study",
      narrative: "The study was locked from the inside. Who holds a key to room 1?",
      task: "Return staff names who hold a key to the Study.",
      hint: "JOIN keys → staff, JOIN keys → rooms WHERE rooms.name = 'Study'",
      validate: (rows) => {
        const expected = [["Mrs. Hadley"], ["Giles Thorpe"], ["Daniel Reeve"]];
        return { ok: equalsSet(rows, expected) };
      },
      reveal:
        "Three keys. Housekeeper, butler, secretary. Anyone else got in by invitation — or violence.",
    },
    {
      id: "c2",
      title: "Chapter II — Camera Traffic, 21:30–23:05",
      narrative: "Pull every Study entry sorted by time, naming the visitor.",
      task: "From cam_log filtered to the Study (room_id=1), return ts and the visitor's NAME (joining staff or guests via person_type). Order by ts.",
      hint: "Use two LEFT JOINs (one to staff, one to guests) and COALESCE the names. Order by ts.",
      validate: (rows) => {
        if (rows.length !== 10)
          return { ok: false, message: `Expected 10 Study visits, got ${rows.length}.` };
        // first row should be 21:45 Cassandra
        const first = rows[0];
        return { ok: String(first[0]) === "21:45" && String(first[1]).includes("Cassandra") };
      },
      reveal:
        "Daniel Reeve, secretary, returned to the Study six times in ninety minutes. Nobody else came close.",
    },
    {
      id: "c3",
      title: "Chapter III — The Ledger's Whisper",
      narrative:
        "Aggregate the ledger. Who pulled more than £10,000 in discretionary payments this year?",
      task: "Return staff name + SUM(amount) for ledger rows where memo LIKE 'Discretionary%', grouped by staff, having SUM > 10000.",
      hint: "GROUP BY beneficiary_staff_id; HAVING SUM(amount) > 10000",
      validate: (rows) =>
        rows.length === 1 && String(rows[0][0]).includes("Daniel") && Number(rows[0][1]) === 54000
          ? { ok: true }
          : { ok: false, message: "One row. One name. £54,000." },
      reveal:
        "Reeve drew £54,000 in 'discretionary' payments over four months. The pen wasn't the only thing in his hand.",
    },
    {
      id: "c4",
      title: "Chapter IV — Window into the Crime",
      narrative:
        "Use a window function. For every cam_log entry in the Study, get the time AND the previous visitor's name on the same row.",
      task: "Return ts, visitor_name, AND prev_visitor_name (using LAG over Study visits ordered by ts).",
      hint: "WITH visits AS ( ... visitor name via COALESCE join ... ) SELECT ts, name, LAG(name) OVER (ORDER BY ts) FROM visits;",
      validate: (rows, cols) => {
        if (cols.length < 3)
          return { ok: false, message: "Three columns required: ts, name, previous_name." };
        if (rows.length !== 10)
          return { ok: false, message: `Expected 10 rows, got ${rows.length}.` };
        // Find the 22:30 row — previous visitor should be Julian Blackwood (22:00)? Actually 22:20 Daniel, so prev for 22:30 = Daniel Reeve
        const row2230 = rows.find((r) => String(r[0]) === "22:30");
        if (!row2230) return { ok: false, message: "Missing 22:30." };
        return { ok: String(row2230[2]).includes("Daniel") };
      },
      reveal: "Reeve was alone with Blackwood from 22:30 to 22:45 — the window of death.",
    },
    {
      id: "c5",
      title: "Chapter V — The Final Cross-Check",
      narrative:
        "Confirm: the killer had a Study key, was in the Study at 22:30, and pulled discretionary funds > £10,000.",
      task: "Write ONE query that returns the single staff name satisfying ALL three conditions.",
      hint: "Use INTERSECT, or three EXISTS subqueries, or chained joins with DISTINCT.",
      validate: (rows) =>
        rows.length === 1 && String(rows[0][0]).includes("Daniel")
          ? { ok: true }
          : { ok: false, message: "One name. Three conditions." },
      reveal:
        "Daniel Reeve. Trusted with the keys, the calendar, and the chequebook. He used all three.",
    },
  ],
  rapidFire: {
    intro:
      "Reeve is in the East Wing burning ledgers. The fire is spreading toward the rest of the evidence. Beat the flames — five questions, eight seconds each.",
    timePerQuestion: 8,
    failureConsequence:
      "The ledger burns. Without it, the Crown declines to prosecute. Reeve walks.",
    successReward: "You seize the ledger before the binding chars. The case is airtight.",
    questions: [
      {
        prompt: "ROW_NUMBER() OVER (PARTITION BY x ORDER BY y) — what does PARTITION do?",
        options: [
          "filters rows",
          "resets the numbering per group",
          "sorts globally",
          "limits to one row",
        ],
        correctIndex: 1,
        explanation: "PARTITION = group reset for the window.",
      },
      {
        prompt: "CTE keyword?",
        options: ["WITH", "USING", "DEFINE", "TEMP"],
        correctIndex: 0,
        explanation: "WITH name AS ( ... ) SELECT ...",
      },
      {
        prompt: "Difference: UNION vs UNION ALL?",
        options: [
          "UNION sorts; ALL doesn't",
          "UNION dedupes; ALL keeps duplicates",
          "UNION ALL is slower",
          "No difference",
        ],
        correctIndex: 1,
        explanation: "UNION removes duplicates; UNION ALL keeps them and is faster.",
      },
      {
        prompt: "EXPLAIN tells you…",
        options: ["the result", "the query plan", "syntax errors", "data lineage"],
        correctIndex: 1,
        explanation: "EXPLAIN reveals the optimizer's plan.",
      },
      {
        prompt: "Recursive CTE requires…",
        options: [
          "RECURSIVE keyword + base + UNION ALL recursive",
          "SELF JOIN only",
          "a temp table",
          "RANK()",
        ],
        correctIndex: 0,
        explanation: "WITH RECURSIVE name AS (anchor UNION ALL recursive).",
      },
    ],
  },
  suspects: [
    {
      id: "1",
      name: "Mrs. Hadley",
      alias: "The Housekeeper",
      description: "Twenty years of service. Key to the Study.",
    },
    {
      id: "2",
      name: "Giles Thorpe",
      alias: "The Butler",
      description: "Keys to half the manor. Loyal to a fault.",
    },
    {
      id: "5",
      name: "Daniel Reeve",
      alias: "The Secretary",
      description: "Two years employed. Holds the chequebook.",
    },
    { id: "6", name: "Imogen Carr", alias: "The Nurse", description: "New hire. Quiet. Watchful." },
    {
      id: "g1",
      name: "Cassandra Blackwood",
      alias: "The Daughter",
      description: "Sole heir. Was in the Library at 22:25.",
    },
    {
      id: "g2",
      name: "Julian Blackwood",
      alias: "The Nephew",
      description: "Gambling debts. Was in the Study at 22:00 and 22:45.",
    },
  ],
  murdererId: "5",
  epilogue:
    "Daniel Reeve. The 'discretionary' payments were extorted — Reeve had Blackwood's tax fraud on tape. When Blackwood threatened to come clean, Reeve drove the pen home and tried to burn the ledger. The window function caught what the cameras nearly missed.",
};
