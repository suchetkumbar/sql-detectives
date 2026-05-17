import type { QueryResult } from "@/lib/sql-engine";

export function ResultsTable({ result }: { result: QueryResult | null }) {
  if (!result) {
    return (
      <div className="surface rounded-lg p-6 text-center text-sm text-muted-foreground">
        Run a query to see results.
      </div>
    );
  }
  if (result.error) {
    return (
      <div className="rounded-lg p-4 border border-destructive/40 bg-destructive/10 mono text-sm">
        <div className="text-xs text-destructive mb-1 uppercase tracking-wider">SQL Error</div>
        <div className="text-foreground/90">{result.error}</div>
      </div>
    );
  }
  if (!result.columns.length) {
    return (
      <div className="surface rounded-lg p-4 text-sm text-muted-foreground">
        Statement executed. No rows returned.
      </div>
    );
  }
  return (
    <div className="surface rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/60">
        <span className="mono text-xs text-muted-foreground">Results</span>
        <span className="mono text-xs text-primary">{result.rowCount} row{result.rowCount === 1 ? "" : "s"}</span>
      </div>
      <div className="overflow-auto max-h-72">
        <table className="w-full text-sm mono">
          <thead>
            <tr className="bg-secondary/40">
              {result.columns.map((c, i) => (
                <th key={i} className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider border-b border-border font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-secondary/30 border-b border-border/40 last:border-0">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5 text-foreground/90 whitespace-nowrap">
                    {cell === null ? <span className="text-muted-foreground italic">NULL</span> : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
