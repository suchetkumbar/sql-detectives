import { describe, expect, it } from "vitest";
import { CASES } from "./cases";
import { createDatabase, runQuery } from "./sql-engine";

const solutions: Record<string, Record<string, string>> = {
  "velvet-lounge": {
    c1: "SELECT name, occupation FROM suspects;",
    c2: "SELECT name FROM suspects WHERE left_at >= '23:45';",
    c3: "SELECT name FROM suspects WHERE table_number = 3;",
    c4: `
      SELECT suspects.name, evidence.item
      FROM evidence
      JOIN suspects ON suspects.id = evidence.suspect_id
      WHERE evidence.found_near = 'dressing room';
    `,
  },
  "ashford-line": {
    c1: `
      SELECT passengers.name
      FROM passengers
      JOIN tickets ON passengers.id = tickets.passenger_id
      WHERE tickets.car = 4;
    `,
    c2: `
      SELECT passengers.name
      FROM passengers
      JOIN tickets ON passengers.id = tickets.passenger_id
      WHERE tickets.car = 4 AND tickets.boarded_at_station <> 1;
    `,
    c3: `
      SELECT passengers.name, possessions.item
      FROM passengers
      JOIN tickets ON passengers.id = tickets.passenger_id
      JOIN possessions ON passengers.id = possessions.passenger_id
      WHERE tickets.car = 4;
    `,
    c4: "SELECT note FROM porter_log WHERE car = 4 AND station_id BETWEEN 3 AND 4;",
    c5: "SELECT COUNT(*) FROM tickets WHERE car = 4 AND boarded_at_station <= 3;",
  },
  "blackwood-manor": {
    c1: `
      SELECT staff.name
      FROM keys
      JOIN staff ON staff.id = keys.holder_staff_id
      JOIN rooms ON rooms.id = keys.room_id
      WHERE rooms.name = 'Study';
    `,
    c2: `
      SELECT cam_log.ts, COALESCE(staff.name, guests.name) AS visitor_name
      FROM cam_log
      LEFT JOIN staff ON cam_log.person_type = 'staff' AND cam_log.person_id = staff.id
      LEFT JOIN guests ON cam_log.person_type = 'guest' AND cam_log.person_id = guests.id
      WHERE cam_log.room_id = 1
      ORDER BY cam_log.ts;
    `,
    c3: `
      SELECT staff.name, SUM(ledger.amount)
      FROM ledger
      JOIN staff ON staff.id = ledger.beneficiary_staff_id
      WHERE ledger.memo LIKE 'Discretionary%'
      GROUP BY staff.id
      HAVING SUM(ledger.amount) > 10000;
    `,
    c4: `
      WITH visits AS (
        SELECT cam_log.ts, COALESCE(staff.name, guests.name) AS visitor_name
        FROM cam_log
        LEFT JOIN staff ON cam_log.person_type = 'staff' AND cam_log.person_id = staff.id
        LEFT JOIN guests ON cam_log.person_type = 'guest' AND cam_log.person_id = guests.id
        WHERE cam_log.room_id = 1
      )
      SELECT ts, visitor_name, LAG(visitor_name) OVER (ORDER BY ts) AS prev_visitor_name
      FROM visits
      ORDER BY ts;
    `,
    c5: `
      SELECT name
      FROM staff
      WHERE id IN (SELECT holder_staff_id FROM keys WHERE room_id = 1)
        AND id IN (
          SELECT person_id FROM cam_log
          WHERE person_type = 'staff' AND room_id = 1 AND ts = '22:30'
        )
        AND id IN (
          SELECT beneficiary_staff_id
          FROM ledger
          WHERE memo LIKE 'Discretionary%'
          GROUP BY beneficiary_staff_id
          HAVING SUM(amount) > 10000
        );
    `,
  },
};

describe("case chapter validators", () => {
  it.each(CASES.map((theCase) => [theCase.id, theCase] as const))(
    "%s accepts its intended chapter solutions",
    async (_caseId, theCase) => {
      const db = await createDatabase(theCase.schema);

      try {
        for (const chapter of theCase.chapters) {
          const sql = solutions[theCase.id]?.[chapter.id];
          expect(sql, `${theCase.id} ${chapter.id} is missing a fixture query`).toBeDefined();

          const result = runQuery(db, sql);
          expect(result.error, `${theCase.id} ${chapter.id} query failed`).toBeUndefined();

          const validation = chapter.validate(result.rows, result.columns);
          expect(
            validation.ok,
            `${theCase.id} ${chapter.id}: ${validation.message ?? "failed"}`,
          ).toBe(true);
        }
      } finally {
        db.close();
      }
    },
  );

  it("rejects a common wrong answer for a chapter validator", async () => {
    const theCase = CASES.find((c) => c.id === "velvet-lounge");
    expect(theCase).toBeDefined();

    const chapter = theCase!.chapters.find((c) => c.id === "c2");
    expect(chapter).toBeDefined();

    const db = await createDatabase(theCase!.schema);

    try {
      const result = runQuery(db, "SELECT name FROM suspects WHERE left_at < '23:45';");
      const validation = chapter!.validate(result.rows, result.columns);

      expect(validation.ok).toBe(false);
    } finally {
      db.close();
    }
  });
});
