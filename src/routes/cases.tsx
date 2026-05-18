import { createFileRoute, Link } from "@tanstack/react-router";
import { CASES } from "@/lib/cases";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [
      { title: "Cases — Coldcase SQL" },
      {
        name: "description",
        content: "Browse beginner, intermediate, and advanced SQL mystery cases.",
      },
    ],
  }),
  component: CasesPage,
});

const diffStyle: Record<string, string> = {
  beginner: "text-success",
  intermediate: "text-accent",
  advanced: "text-destructive",
};

function CasesPage() {
  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-10">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Home
      </Link>
      <header className="mt-6 mb-10">
        <h1 className="text-5xl">Cases</h1>
        <p className="text-muted-foreground mt-2">Pick a file. Read the brief. Bring your SQL.</p>
      </header>

      <div className="grid gap-4">
        {CASES.map((c) => (
          <Link
            key={c.id}
            to="/case/$caseId"
            params={{ caseId: c.id }}
            className="surface surface-hover rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6 group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className={`chip chip-dot ${diffStyle[c.difficulty]}`}>
                  <span>{c.difficulty}</span>
                </span>
                <span className="chip">
                  {c.location} · {c.year}
                </span>
              </div>
              <h2 className="text-3xl group-hover:text-primary transition">{c.title}</h2>
              <p className="italic text-muted-foreground mt-1">{c.tagline}</p>
              <p className="mt-3 text-sm text-foreground/80 max-w-2xl leading-relaxed">
                {c.synopsis}
              </p>
            </div>
            <div className="md:text-right shrink-0 md:min-w-[180px] md:border-l md:border-border md:pl-6">
              <div className="mono text-xs text-muted-foreground uppercase tracking-wider">
                Victim
              </div>
              <div className="mt-1">{c.victim}</div>
              <div className="mt-4 mono text-xs text-muted-foreground">
                {c.chapters.length} chapters · {c.suspects.length} suspects
              </div>
              <div className="mt-3 text-sm text-primary">Open file →</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
