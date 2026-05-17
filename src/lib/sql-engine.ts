import initSqlJs, { type Database } from "sql.js";

let dbPromise: Promise<typeof initSqlJs> | null = null;

async function getSql() {
  if (!dbPromise) {
    dbPromise = initSqlJs({ locateFile: () => "/sql-wasm.wasm" }) as any;
  }
  return dbPromise;
}

export async function createDatabase(schemaSql: string): Promise<Database> {
  const SQL = await getSql();
  const db = new (SQL as any).Database();
  db.exec(schemaSql);
  return db;
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
  error?: string;
  rowCount: number;
}

export function runQuery(db: Database, sql: string): QueryResult {
  try {
    const stmts = db.exec(sql);
    if (!stmts.length) return { columns: [], rows: [], rowCount: 0 };
    const last = stmts[stmts.length - 1];
    return { columns: last.columns, rows: last.values as any[][], rowCount: last.values.length };
  } catch (e: any) {
    return { columns: [], rows: [], rowCount: 0, error: e.message ?? String(e) };
  }
}
