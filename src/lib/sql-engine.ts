import initSqlJs, { type Database, type SqlJsStatic, type SqlValue } from "sql.js";

let dbPromise: Promise<SqlJsStatic> | null = null;

function locateSqlWasm(file: string) {
  if (typeof window !== "undefined") {
    return `/${file}`;
  }

  const pathname = decodeURIComponent(new URL(`../../public/${file}`, import.meta.url).pathname);
  return pathname.replace(/^\/([A-Za-z]:)/, "$1");
}

async function getSql() {
  if (!dbPromise) {
    dbPromise = initSqlJs({ locateFile: locateSqlWasm });
  }
  return dbPromise;
}

export async function createDatabase(schemaSql: string): Promise<Database> {
  const SQL = await getSql();
  const db = new SQL.Database();
  db.exec(schemaSql);
  return db;
}

export async function createDatabaseFromBytes(databaseBytes: Uint8Array): Promise<Database> {
  const SQL = await getSql();
  return new SQL.Database(databaseBytes);
}

export interface QueryResult {
  columns: string[];
  rows: SqlValue[][];
  error?: string;
  rowCount: number;
}

export function runQuery(db: Database, sql: string): QueryResult {
  try {
    const stmts = db.exec(sql);
    if (!stmts.length) return { columns: [], rows: [], rowCount: 0 };
    const last = stmts[stmts.length - 1];
    return { columns: last.columns, rows: last.values, rowCount: last.values.length };
  } catch (e: unknown) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
