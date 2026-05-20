export type Difficulty = "beginner" | "intermediate" | "advanced";
export type SqlCell = string | number | Uint8Array | null;
export type SqlRow = SqlCell[];

export interface Chapter {
  id: string;
  title: string;
  narrative: string;
  task: string;
  hint: string;
  starterSql?: string;
  validate: (rows: SqlRow[], columns: string[]) => { ok: boolean; message?: string };
  reveal: string;
}

export interface RapidFireQuestion {
  prompt: string;
  options: string[];
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
  schema: string;
  schemaSummary: string;
  chapters: Chapter[];
  rapidFire: {
    intro: string;
    timePerQuestion: number;
    questions: RapidFireQuestion[];
    failureConsequence: string;
    successReward: string;
  };
  suspects: Suspect[];
  murdererId: string;
  epilogue: string;
}
