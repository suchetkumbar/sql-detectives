// Case definitions. Each case = a self-contained SQLite world plus a narrative arc.
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Chapter {
  id: string;
  title: string;
  narrative: string;        // prose shown above the editor
  task: string;             // the actual challenge prompt
  hint: string;
  starterSql?: string;
  // Validation: a function that gets the result rows + columns and returns ok.
  validate: (rows: any[][], columns: string[]) => { ok: boolean; message?: string };
  reveal: string;           // story beat unlocked on success
}

export interface RapidFireQuestion {
  prompt: string;
  options: string[];        // 4 options
  correctIndex: number;
  explanation: string;
}

export interface Suspect {
  id: string;
  name: string;
  alias: string;
  description: string;
}

export interface Case {
  id: string;
  difficulty: Difficulty;
  title: string;
  tagline: string;
  location: string;
  year: string;
  synopsis: string;
  victim: string;
  schema: string;                 // SQL to bootstrap the DB
  schemaSummary: string;          // human-readable schema reference (markdown-ish)
  chapters: Chapter[];
  rapidFire: {
    intro: string;
    timePerQuestion: number;      // seconds
    questions: RapidFireQuestion[];
    failureConsequence: string;
    successReward: string;
  };
  suspects: Suspect[];
  murdererId: string;
  epilogue: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validators
// ─────────────────────────────────────────────────────────────────────────────
const rowsToSet = (rows: any[][]) => new Set(rows.map(r => r.map(v => String(v ?? "")).join("|")));
const equalsSet = (rows: any[][], expected: any[][]) => {
  const a = rowsToSet(rows), b = rowsToSet(expected);
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
};
const containsRow = (rows: any[][], values: any[]) => {
  const key = values.map(v => String(v ?? "")).join("|");
  return rowsToSet(rows).has(key);
};

// ═════════════════════════════════════════════════════════════════════════════
// CASE 1 — BEGINNER — The Velvet Lounge
// ═════════════════════════════════════════════════════════════════════════════
const CASE_VELVET: Case = {
  id: "velvet-lounge",
  difficulty: "beginner",
  title: "The Velvet Lounge",
  tagline: "A jazz singer. A spilled martini. A body behind the curtain.",
  location: "Manhattan, NYC",
  year: "1947",
  synopsis: "Eleanor Voss, the toast of 52nd Street, was found dead in her dressing room ten minutes after her final set. The club was packed. Someone in that room knew. Walk the patrons one query at a time.",
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
      narrative: "The maître d' hands you a smudged guest list. Six names, six stories. Start by seeing every suspect the club had eyes on tonight.",
      task: "List every suspect — their name and occupation.",
      hint: "SELECT name, occupation FROM suspects;",
      validate: (rows, cols) => {
        if (cols.length < 2) return { ok: false, message: "Need at least two columns: name and occupation." };
        return { ok: rows.length === 6, message: rows.length === 6 ? undefined : `Expected 6 suspects, got ${rows.length}.` };
      },
      reveal: "Six suspects. The clock ticks. Most are bluffing. One is bleeding through their cuffs.",
    },
    {
      id: "c2",
      title: "Chapter II — Who Stayed Late?",
      narrative: "The coroner places time of death between 11:45 and 11:55 PM. Anyone who left before 11:45 has an alibi.",
      task: "Find the names of suspects who left at or after '23:45'.",
      hint: "Use WHERE left_at >= '23:45'. Strings compare lexicographically here.",
      validate: (rows) => {
        const expected = [["Marlon Reeves"],["Sal Moretti"],["Clara Wynn"]];
        return { ok: equalsSet(rows, expected), message: "Looking for the three who lingered past 11:45." };
      },
      reveal: "Three names. The saxophonist, the owner, the stage manager. The detective and the heiress are off the board.",
    },
    {
      id: "c3",
      title: "Chapter III — Table Three",
      narrative: "Witness #1 said Vincent stormed off from table three. Who else was at table three?",
      task: "List the names of every suspect seated at table 3.",
      hint: "WHERE table_number = 3",
      validate: (rows) => {
        const expected = [["Iris DuPont"],["Vincent Cole"]];
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
      validate: (rows) => containsRow(rows, ["Vincent Cole","Monogrammed cufflink V.C."])
        ? { ok: true } : { ok: false, message: "Your row should pair the suspect name with the item." },
      reveal: "Vincent Cole. He swore he left early — and yet his cufflink lay six feet from the body.",
    },
  ],
  rapidFire: {
    intro: "Vincent is bolting. The fire escape creaks. You have 60 seconds at the precinct radio to keep the patrol from losing him — answer fast.",
    timePerQuestion: 12,
    failureConsequence: "Vincent slips into the alley fog. The case goes cold for 11 years.",
    successReward: "Patrol catches Vincent at the docks. He's in your interrogation room within the hour.",
    questions: [
      { prompt: "Which clause filters rows AFTER a GROUP BY?", options: ["WHERE","HAVING","FILTER","ORDER BY"], correctIndex: 1, explanation: "HAVING runs after aggregation; WHERE runs before." },
      { prompt: "Which keyword returns only unique values?", options: ["UNIQUE","DISTINCT","ONLY","SET"], correctIndex: 1, explanation: "SELECT DISTINCT col removes duplicates." },
      { prompt: "What does COUNT(*) return for a table of 0 rows?", options: ["NULL","0","Error","1"], correctIndex: 1, explanation: "COUNT always returns a number, never NULL." },
      { prompt: "Which JOIN keeps every row from the LEFT table?", options: ["INNER","LEFT","RIGHT","CROSS"], correctIndex: 1, explanation: "LEFT JOIN preserves all left rows; unmatched right side is NULL." },
      { prompt: "How do you sort newest first by a column 'ordered_at'?", options: ["ORDER BY ordered_at","SORT ordered_at DESC","ORDER BY ordered_at DESC","RANK ordered_at"], correctIndex: 2, explanation: "ORDER BY ... DESC for descending." },
    ],
  },
  suspects: [
    { id:"1", name:"Marlon Reeves",  alias:"The Sax",     description:"Played the closing number. Whiskey on his breath." },
    { id:"2", name:"Iris DuPont",    alias:"The Heiress", description:"Left early. Money to burn, motive unclear." },
    { id:"3", name:"Sal Moretti",    alias:"The Owner",   description:"Walked Eleanor to her car most nights. Not tonight." },
    { id:"4", name:"Hank Boyle",     alias:"The Tail",    description:"A detective at table seven. Tailing Moretti." },
    { id:"5", name:"Clara Wynn",     alias:"Stagehand",   description:"Saw someone slip behind the curtain at 11:48." },
    { id:"6", name:"Vincent Cole",   alias:"The Banker",  description:"Left his cufflink in a dead woman's dressing room." },
  ],
  murdererId: "6",
  epilogue: "Vincent Cole — banker, fiancé to Iris, and Eleanor's secret. He'd been bleeding cash to her for two years. Tonight she asked for more. He brought a cord instead. The cufflink gave him up.",
};

// ═════════════════════════════════════════════════════════════════════════════
// CASE 2 — INTERMEDIATE — Last Train to Ashford
// ═════════════════════════════════════════════════════════════════════════════
const CASE_TRAIN: Case = {
  id: "ashford-line",
  difficulty: "intermediate",
  title: "Last Train to Ashford",
  tagline: "Eight cars. Forty-one passengers. One stops breathing.",
  location: "British Midlands",
  year: "1962",
  synopsis: "The 22:14 sleeper to Ashford pulled in with a corpse in Car 4. Conductor Whitlow swears the door was locked. The ticket logs and the porter's rounds are all you have.",
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
        const expected = [["Dr. Edmund Hartley"],["Margaret Doyle"],["Lila Brennan"],["Thomas Pike"],["Nadia Kapoor"]];
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
        const expected = [["Lila Brennan"],["Nadia Kapoor"]];
        return { ok: equalsSet(rows, expected) };
      },
      reveal: "Brennan and Kapoor walked in mid-journey. Both had reason to be near Hartley.",
    },
    {
      id: "c3",
      title: "Chapter III — Motive Search",
      narrative: "Every passenger carries something. Cross-reference Car 4 passengers with their possessions.",
      task: "List the name and item for every Car 4 passenger's possessions.",
      hint: "Two joins: passengers → tickets, passengers → possessions. Filter car = 4.",
      validate: (rows) => {
        return { ok: rows.length >= 5 && containsRow(rows, ["Margaret Doyle","Vial labelled DIGOXIN"]) };
      },
      reveal: "Doyle: digoxin. Pike: a malpractice brief against the victim. Brennan: a grudge for an unpaid quote. Three motives, one corpse.",
    },
    {
      id: "c4",
      title: "Chapter IV — Pike's Alibi",
      narrative: "The porter's log says Pike left Car 4 at Cambridge and returned at Ely. Was he in his seat when Hartley likely died (between Cambridge and Ely)?",
      task: "Return every porter_log note for car 4 between stations 3 and 4 inclusive.",
      hint: "WHERE car = 4 AND station_id BETWEEN 3 AND 4",
      validate: (rows) => rows.length === 2 ? { ok: true } : { ok: false, message: "Expected exactly 2 log entries." },
      reveal: "Pike was gone exactly during the lethal window. But he came back. And the porter saw him.",
    },
    {
      id: "c5",
      title: "Chapter V — Who Was Alone with Hartley?",
      narrative: "Aggregate. Count Car 4 occupants present per station leg (using porter notes' implicit attendance is overkill — instead, use boarding order). Who had boarded by Cambridge but had nobody else awake nearby at the lethal moment?",
      task: "Count Car 4 passengers who had boarded by station 3 (Cambridge). Return one row with that count.",
      hint: "SELECT COUNT(*) FROM tickets WHERE car = 4 AND boarded_at_station <= 3",
      validate: (rows) => rows.length === 1 && Number(rows[0][0]) === 5 ? { ok: true } : { ok: false, message: "One row, one count." },
      reveal: "All five were aboard by Cambridge. But only one was awake and unaccounted for.",
    },
  ],
  rapidFire: {
    intro: "Ashford station, 02:04. The killer is one minute from disappearing into the crowd. Five SQL fundamentals — five seconds each — or they vanish into the platform fog.",
    timePerQuestion: 10,
    failureConsequence: "The killer melts into Ashford. The Met files it under 'Unsolved'.",
    successReward: "You radio the platform constables in time. Every Car 4 passenger is detained.",
    questions: [
      { prompt: "GROUP BY car, then COUNT — which clause names that?", options: ["WHERE COUNT > 1","HAVING COUNT(*) > 1","FILTER count","GROUP HAVING"], correctIndex: 1, explanation: "HAVING filters aggregated groups." },
      { prompt: "INNER JOIN on a non-matching row yields…", options: ["a NULL row","is excluded","throws error","auto-fills 0"], correctIndex: 1, explanation: "INNER drops unmatched rows." },
      { prompt: "Which returns the second-highest salary cleanly?", options: ["MAX(MAX(s))","LIMIT 2","ORDER BY s DESC LIMIT 1 OFFSET 1","TOP 2 s"], correctIndex: 2, explanation: "Skip one with OFFSET 1." },
      { prompt: "Subquery in SELECT clause is called…", options: ["a CTE","a correlated/scalar subquery","a view","a window"], correctIndex: 1, explanation: "Scalar (or correlated) subquery returns one value per row." },
      { prompt: "NULL = NULL evaluates to…", options: ["TRUE","FALSE","NULL/unknown","Error"], correctIndex: 2, explanation: "Three-valued logic. Use IS NULL." },
    ],
  },
  suspects: [
    { id:"2", name:"Margaret Doyle",   alias:"The Nurse",     description:"Carried digoxin. Argued with the victim at Welwyn." },
    { id:"3", name:"Colonel Avery Finch", alias:"The Colonel", description:"In Car 2. Asleep, per the porter." },
    { id:"4", name:"Lila Brennan",     alias:"The Journalist", description:"Boarded mid-trip. Held a grudge over an unpaid quote." },
    { id:"5", name:"Thomas Pike",      alias:"The Solicitor", description:"Left Car 4 during the lethal window. Returned in time." },
    { id:"6", name:"Nadia Kapoor",     alias:"The Pharmacist", description:"Boarded at Cambridge with a pharmacy ledger." },
  ],
  murdererId: "2",
  epilogue: "Margaret Doyle. Hartley had buried her malpractice complaint two years ago — Pike was about to reopen it. The digoxin matched. The empty syringe was found in the lavatory bin three cars down.",
};

// ═════════════════════════════════════════════════════════════════════════════
// CASE 3 — ADVANCED — The Cipher of Blackwood Manor
// ═════════════════════════════════════════════════════════════════════════════
const CASE_BLACKWOOD: Case = {
  id: "blackwood-manor",
  difficulty: "advanced",
  title: "The Cipher of Blackwood Manor",
  tagline: "A locked study. A coded ledger. A killer with patience for spreadsheets.",
  location: "Cornish coast, England",
  year: "1989",
  synopsis: "Lord Ambrose Blackwood died at his desk with a fountain pen in his neck. The estate's surveillance system, financial ledgers, and staff schedules survived him. Use them.",
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
        const expected = [["Mrs. Hadley"],["Giles Thorpe"],["Daniel Reeve"]];
        return { ok: equalsSet(rows, expected) };
      },
      reveal: "Three keys. Housekeeper, butler, secretary. Anyone else got in by invitation — or violence.",
    },
    {
      id: "c2",
      title: "Chapter II — Camera Traffic, 21:30–23:05",
      narrative: "Pull every Study entry sorted by time, naming the visitor.",
      task: "From cam_log filtered to the Study (room_id=1), return ts and the visitor's NAME (joining staff or guests via person_type). Order by ts.",
      hint: "Use two LEFT JOINs (one to staff, one to guests) and COALESCE the names. Order by ts.",
      validate: (rows) => {
        if (rows.length !== 9) return { ok: false, message: `Expected 9 Study visits, got ${rows.length}.` };
        // first row should be 21:45 Cassandra
        const first = rows[0];
        return { ok: String(first[0]) === "21:45" && String(first[1]).includes("Cassandra") };
      },
      reveal: "Daniel Reeve, secretary, returned to the Study five times in ninety minutes. Nobody else came close.",
    },
    {
      id: "c3",
      title: "Chapter III — The Ledger's Whisper",
      narrative: "Aggregate the ledger. Who pulled more than £10,000 in discretionary payments this year?",
      task: "Return staff name + SUM(amount) for ledger rows where memo LIKE 'Discretionary%', grouped by staff, having SUM > 10000.",
      hint: "GROUP BY beneficiary_staff_id; HAVING SUM(amount) > 10000",
      validate: (rows) => rows.length === 1 && String(rows[0][0]).includes("Daniel") && Number(rows[0][1]) === 54000
        ? { ok: true } : { ok: false, message: "One row. One name. £54,000." },
      reveal: "Reeve drew £54,000 in 'discretionary' payments over four months. The pen wasn't the only thing in his hand.",
    },
    {
      id: "c4",
      title: "Chapter IV — Window into the Crime",
      narrative: "Use a window function. For every cam_log entry in the Study, get the time AND the previous visitor's name on the same row.",
      task: "Return ts, visitor_name, AND prev_visitor_name (using LAG over Study visits ordered by ts).",
      hint: "WITH visits AS ( ... visitor name via COALESCE join ... ) SELECT ts, name, LAG(name) OVER (ORDER BY ts) FROM visits;",
      validate: (rows, cols) => {
        if (cols.length < 3) return { ok: false, message: "Three columns required: ts, name, previous_name." };
        if (rows.length !== 9) return { ok: false, message: `Expected 9 rows, got ${rows.length}.` };
        // Find the 22:30 row — previous visitor should be Julian Blackwood (22:00)? Actually 22:20 Daniel, so prev for 22:30 = Daniel Reeve
        const row2230 = rows.find(r => String(r[0]) === "22:30");
        if (!row2230) return { ok: false, message: "Missing 22:30." };
        return { ok: String(row2230[2]).includes("Daniel") };
      },
      reveal: "Reeve was alone with Blackwood from 22:30 to 22:45 — the window of death.",
    },
    {
      id: "c5",
      title: "Chapter V — The Final Cross-Check",
      narrative: "Confirm: the killer had a Study key, was in the Study at 22:30, and pulled discretionary funds > £10,000.",
      task: "Write ONE query that returns the single staff name satisfying ALL three conditions.",
      hint: "Use INTERSECT, or three EXISTS subqueries, or chained joins with DISTINCT.",
      validate: (rows) => rows.length === 1 && String(rows[0][0]).includes("Daniel")
        ? { ok: true } : { ok: false, message: "One name. Three conditions." },
      reveal: "Daniel Reeve. Trusted with the keys, the calendar, and the chequebook. He used all three.",
    },
  ],
  rapidFire: {
    intro: "Reeve is in the East Wing burning ledgers. The fire is spreading toward the rest of the evidence. Beat the flames — five questions, eight seconds each.",
    timePerQuestion: 8,
    failureConsequence: "The ledger burns. Without it, the Crown declines to prosecute. Reeve walks.",
    successReward: "You seize the ledger before the binding chars. The case is airtight.",
    questions: [
      { prompt: "ROW_NUMBER() OVER (PARTITION BY x ORDER BY y) — what does PARTITION do?", options: ["filters rows","resets the numbering per group","sorts globally","limits to one row"], correctIndex: 1, explanation: "PARTITION = group reset for the window." },
      { prompt: "CTE keyword?", options: ["WITH","USING","DEFINE","TEMP"], correctIndex: 0, explanation: "WITH name AS ( ... ) SELECT ..." },
      { prompt: "Difference: UNION vs UNION ALL?", options: ["UNION sorts; ALL doesn't","UNION dedupes; ALL keeps duplicates","UNION ALL is slower","No difference"], correctIndex: 1, explanation: "UNION removes duplicates; UNION ALL keeps them and is faster." },
      { prompt: "EXPLAIN tells you…", options: ["the result","the query plan","syntax errors","data lineage"], correctIndex: 1, explanation: "EXPLAIN reveals the optimizer's plan." },
      { prompt: "Recursive CTE requires…", options: ["RECURSIVE keyword + base + UNION ALL recursive","SELF JOIN only","a temp table","RANK()"], correctIndex: 0, explanation: "WITH RECURSIVE name AS (anchor UNION ALL recursive)." },
    ],
  },
  suspects: [
    { id:"1", name:"Mrs. Hadley",   alias:"The Housekeeper",    description:"Twenty years of service. Key to the Study." },
    { id:"2", name:"Giles Thorpe",  alias:"The Butler",         description:"Keys to half the manor. Loyal to a fault." },
    { id:"5", name:"Daniel Reeve",  alias:"The Secretary",      description:"Two years employed. Holds the chequebook." },
    { id:"6", name:"Imogen Carr",   alias:"The Nurse",          description:"New hire. Quiet. Watchful." },
    { id:"g1", name:"Cassandra Blackwood", alias:"The Daughter", description:"Sole heir. Was in the Library at 22:25." },
    { id:"g2", name:"Julian Blackwood", alias:"The Nephew",      description:"Gambling debts. Was in the Study at 22:00 and 22:45." },
  ],
  murdererId: "5",
  epilogue: "Daniel Reeve. The 'discretionary' payments were extorted — Reeve had Blackwood's tax fraud on tape. When Blackwood threatened to come clean, Reeve drove the pen home and tried to burn the ledger. The window function caught what the cameras nearly missed.",
};

// ─────────────────────────────────────────────────────────────────────────────
export const CASES: Case[] = [CASE_VELVET, CASE_TRAIN, CASE_BLACKWOOD];
export const getCase = (id: string) => CASES.find(c => c.id === id);
