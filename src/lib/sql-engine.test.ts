import { describe, expect, it } from "vitest";
import { createDatabase, runQuery } from "./sql-engine";

describe("sql-engine", () => {
  it("creates an in-memory database and returns query rows", async () => {
    const db = await createDatabase(`
      CREATE TABLE suspects (id INTEGER PRIMARY KEY, name TEXT);
      INSERT INTO suspects VALUES (1, 'Ada'), (2, 'Grace');
    `);

    try {
      const result = runQuery(db, "SELECT name FROM suspects ORDER BY id;");

      expect(result.error).toBeUndefined();
      expect(result.columns).toEqual(["name"]);
      expect(result.rows).toEqual([["Ada"], ["Grace"]]);
      expect(result.rowCount).toBe(2);
    } finally {
      db.close();
    }
  });

  it("returns a structured error for invalid SQL", async () => {
    const db = await createDatabase("CREATE TABLE evidence (id INTEGER PRIMARY KEY);");

    try {
      const result = runQuery(db, "SELECT missing FROM evidence;");

      expect(result.error).toContain("no such column");
      expect(result.columns).toEqual([]);
      expect(result.rows).toEqual([]);
      expect(result.rowCount).toBe(0);
    } finally {
      db.close();
    }
  });
});
