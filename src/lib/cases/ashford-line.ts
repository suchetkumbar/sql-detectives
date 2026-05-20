import type { Case } from "./types";
import { containsRow, equalsSet } from "./validators";

// CASE 2 — INTERMEDIATE — Last Train to Ashford
// ═════════════════════════════════════════════════════════════════════════════
export const CASE_TRAIN: Case = {
  id: "ashford-line",
  difficulty: "intermediate",
  title: "Last Train to Ashford",
  tagline: "Eight cars. Forty-one passengers. One stops breathing.",
  location: "British Midlands",
  year: "1962",
  synopsis:
    "The 22:14 sleeper to Ashford pulled in with a corpse in Car 4. Conductor Whitlow swears the door was locked. The ticket logs and the porter's rounds are all you have.",
  victim: "Dr. Edmund Hartley — pathologist, 58",
  schemaSummary: `
**passengers** ( id, name, age, occupation )
**tickets** ( id, passenger_id, car, seat, boarded_at_station )
**stations** ( id, name, arrives_at )
**porter_log** ( id, station_id, car, note )
**possessions** ( id, passenger_id, item )`,
  schema: `
CREATE TABLE passengers (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, occupation TEXT);
INSERT INTO passengers VALUES
 (1,'Dr. Edmund Hartley',58,'Pathologist'),
 (2,'Margaret Doyle',34,'Nurse'),
 (3,'Colonel Avery Finch',62,'Retired officer'),
 (4,'Lila Brennan',27,'Journalist'),
 (5,'Thomas Pike',41,'Solicitor'),
 (6,'Nadia Kapoor',38,'Pharmacist'),
 (7,'Henry Vail',24,'Student'),
 (8,'Beatrice Lowe',55,'Widow');

CREATE TABLE stations (id INTEGER PRIMARY KEY, name TEXT, arrives_at TEXT);
INSERT INTO stations VALUES
 (1,'King''s Cross','22:14'),
 (2,'Welwyn','22:48'),
 (3,'Cambridge','23:42'),
 (4,'Ely','00:18'),
 (5,'Ashford','02:05');

CREATE TABLE tickets (id INTEGER PRIMARY KEY, passenger_id INTEGER, car INTEGER, seat TEXT, boarded_at_station INTEGER);
INSERT INTO tickets VALUES
 (1,1,4,'4A',1),
 (2,2,4,'4B',1),
 (3,3,2,'2C',1),
 (4,4,4,'4C',2),
 (5,5,4,'4D',1),
 (6,6,4,'4E',3),
 (7,7,1,'1F',1),
 (8,8,2,'2A',1);

CREATE TABLE porter_log (id INTEGER PRIMARY KEY, station_id INTEGER, car INTEGER, note TEXT);
INSERT INTO porter_log VALUES
 (1,1,4,'All seats filled except 4C and 4E. Hartley reading.'),
 (2,2,4,'Brennan boards 4C. Hartley arguing with Doyle.'),
 (3,3,4,'Kapoor boards 4E. Hartley asleep. Pike absent from compartment.'),
 (4,4,4,'Pike returns from dining car. Hartley still asleep.'),
 (5,4,2,'Finch and Lowe asleep.'),
 (6,5,4,'Hartley unresponsive. Doors locked from inside.');

CREATE TABLE possessions (id INTEGER PRIMARY KEY, passenger_id INTEGER, item TEXT);
INSERT INTO possessions VALUES
 (1,2,'Syringe — empty'),
 (2,2,'Vial labelled DIGOXIN'),
 (3,5,'Legal brief: Hartley v. Doyle malpractice'),
 (4,6,'Pharmacy ledger'),
 (5,4,'Notebook: "Hartley owed me a quote"'),
 (6,1,'Pocket watch, stopped at 01:02');
`,
  chapters: [
    {
      id: "c1",
      title: "Chapter I — Who Rode in Car 4?",
      narrative: "Six compartments per car. Car 4 is the locked one. Names, please.",
      task: "Return the names of every passenger whose ticket placed them in car 4.",
      hint: "JOIN passengers ON passengers.id = tickets.passenger_id WHERE car = 4",
      validate: (rows) => {
        const expected = [
          ["Dr. Edmund Hartley"],
          ["Margaret Doyle"],
          ["Lila Brennan"],
          ["Thomas Pike"],
          ["Nadia Kapoor"],
        ];
        return { ok: equalsSet(rows, expected) };
      },
      reveal: "Five passengers in Car 4. One of them dead, four with secrets.",
    },
    {
      id: "c2",
      title: "Chapter II — Boarding Sequence",
      narrative: "The killer needed time alone with Hartley. Who boarded LATER than King's Cross?",
      task: "Names of Car 4 passengers whose boarding station was NOT King's Cross (station id 1).",
      hint: "WHERE car = 4 AND boarded_at_station <> 1",
      validate: (rows) => {
        const expected = [["Lila Brennan"], ["Nadia Kapoor"]];
        return { ok: equalsSet(rows, expected) };
      },
      reveal: "Brennan and Kapoor walked in mid-journey. Both had reason to be near Hartley.",
    },
    {
      id: "c3",
      title: "Chapter III — Motive Search",
      narrative:
        "Every passenger carries something. Cross-reference Car 4 passengers with their possessions.",
      task: "List the name and item for every Car 4 passenger's possessions.",
      hint: "Two joins: passengers → tickets, passengers → possessions. Filter car = 4.",
      validate: (rows) => {
        return {
          ok: rows.length >= 5 && containsRow(rows, ["Margaret Doyle", "Vial labelled DIGOXIN"]),
        };
      },
      reveal:
        "Doyle: digoxin. Pike: a malpractice brief against the victim. Brennan: a grudge for an unpaid quote. Three motives, one corpse.",
    },
    {
      id: "c4",
      title: "Chapter IV — Pike's Alibi",
      narrative:
        "The porter's log says Pike left Car 4 at Cambridge and returned at Ely. Was he in his seat when Hartley likely died (between Cambridge and Ely)?",
      task: "Return every porter_log note for car 4 between stations 3 and 4 inclusive.",
      hint: "WHERE car = 4 AND station_id BETWEEN 3 AND 4",
      validate: (rows) =>
        rows.length === 2
          ? { ok: true }
          : { ok: false, message: "Expected exactly 2 log entries." },
      reveal:
        "Pike was gone exactly during the lethal window. But he came back. And the porter saw him.",
    },
    {
      id: "c5",
      title: "Chapter V — Who Was Alone with Hartley?",
      narrative:
        "Aggregate. Count Car 4 occupants present per station leg (using porter notes' implicit attendance is overkill — instead, use boarding order). Who had boarded by Cambridge but had nobody else awake nearby at the lethal moment?",
      task: "Count Car 4 passengers who had boarded by station 3 (Cambridge). Return one row with that count.",
      hint: "SELECT COUNT(*) FROM tickets WHERE car = 4 AND boarded_at_station <= 3",
      validate: (rows) =>
        rows.length === 1 && Number(rows[0][0]) === 5
          ? { ok: true }
          : { ok: false, message: "One row, one count." },
      reveal: "All five were aboard by Cambridge. But only one was awake and unaccounted for.",
    },
  ],
  rapidFire: {
    intro:
      "Ashford station, 02:04. The killer is one minute from disappearing into the crowd. Five SQL fundamentals — five seconds each — or they vanish into the platform fog.",
    timePerQuestion: 10,
    failureConsequence: "The killer melts into Ashford. The Met files it under 'Unsolved'.",
    successReward: "You radio the platform constables in time. Every Car 4 passenger is detained.",
    questions: [
      {
        prompt: "GROUP BY car, then COUNT — which clause names that?",
        options: ["WHERE COUNT > 1", "HAVING COUNT(*) > 1", "FILTER count", "GROUP HAVING"],
        correctIndex: 1,
        explanation: "HAVING filters aggregated groups.",
      },
      {
        prompt: "INNER JOIN on a non-matching row yields…",
        options: ["a NULL row", "is excluded", "throws error", "auto-fills 0"],
        correctIndex: 1,
        explanation: "INNER drops unmatched rows.",
      },
      {
        prompt: "Which returns the second-highest salary cleanly?",
        options: ["MAX(MAX(s))", "LIMIT 2", "ORDER BY s DESC LIMIT 1 OFFSET 1", "TOP 2 s"],
        correctIndex: 2,
        explanation: "Skip one with OFFSET 1.",
      },
      {
        prompt: "Subquery in SELECT clause is called…",
        options: ["a CTE", "a correlated/scalar subquery", "a view", "a window"],
        correctIndex: 1,
        explanation: "Scalar (or correlated) subquery returns one value per row.",
      },
      {
        prompt: "NULL = NULL evaluates to…",
        options: ["TRUE", "FALSE", "NULL/unknown", "Error"],
        correctIndex: 2,
        explanation: "Three-valued logic. Use IS NULL.",
      },
    ],
  },
  suspects: [
    {
      id: "2",
      name: "Margaret Doyle",
      alias: "The Nurse",
      description: "Carried digoxin. Argued with the victim at Welwyn.",
    },
    {
      id: "3",
      name: "Colonel Avery Finch",
      alias: "The Colonel",
      description: "In Car 2. Asleep, per the porter.",
    },
    {
      id: "4",
      name: "Lila Brennan",
      alias: "The Journalist",
      description: "Boarded mid-trip. Held a grudge over an unpaid quote.",
    },
    {
      id: "5",
      name: "Thomas Pike",
      alias: "The Solicitor",
      description: "Left Car 4 during the lethal window. Returned in time.",
    },
    {
      id: "6",
      name: "Nadia Kapoor",
      alias: "The Pharmacist",
      description: "Boarded at Cambridge with a pharmacy ledger.",
    },
  ],
  murdererId: "2",
  epilogue:
    "Margaret Doyle. Hartley had buried her malpractice complaint two years ago — Pike was about to reopen it. The digoxin matched. The empty syringe was found in the lavatory bin three cars down.",
};
