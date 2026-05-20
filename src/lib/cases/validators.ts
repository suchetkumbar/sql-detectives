import type { SqlRow } from "./types";

const rowsToSet = (rows: SqlRow[]) =>
  new Set(rows.map((r) => r.map((v) => String(v ?? "")).join("|")));

export const equalsSet = (rows: SqlRow[], expected: SqlRow[]) => {
  const a = rowsToSet(rows);
  const b = rowsToSet(expected);
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
};

export const containsRow = (rows: SqlRow[], values: SqlRow) => {
  const key = values.map((v) => String(v ?? "")).join("|");
  return rowsToSet(rows).has(key);
};
