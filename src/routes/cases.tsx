import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { CASES } from "@/lib/cases";
import { isCaseCompleted, loadProgress } from "@/lib/progress";

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
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All cases");
  const [progressState, setProgressState] = useState<
    Record<string, { completed: boolean; inProgress: boolean }>
  >({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const map = CASES.reduce(
      (acc, c) => {
        const persisted = loadProgress(c.id);
        const completed = persisted ? isCaseCompleted(persisted) : false;
        const inProgress = persisted ? !completed && persisted.phase.kind !== "intro" : false;
        acc[c.id] = { completed, inProgress };
        return acc;
      },
      {} as Record<string, { completed: boolean; inProgress: boolean }>,
    );

    setProgressState(map);
  }, []);

  const availableTags = ["All cases", ...new Set(CASES.flatMap((c) => c.tags))];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCases = CASES.filter((c) => {
    const matchesTag = activeTag === "All cases" || c.tags.includes(activeTag);
    const searchable = [c.title, c.tagline, c.location, c.difficulty, ...c.tags]
      .join(" ")
      .toLowerCase();
    return matchesTag && (!normalizedQuery || searchable.includes(normalizedQuery));
  });

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Home
      </Link>

      <header className="mt-6 mb-8 md:mb-10">
        <div className="mb-2 inline-flex items-center rounded-full border border-border bg-card/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Case files
        </div>
        <h1 className="text-4xl md:text-5xl">Cases</h1>
        <p className="mt-2 text-muted-foreground">Pick a file. Read the brief. Bring your SQL.</p>
      </header>

      <section aria-label="Filter case files" className="mb-8 space-y-3">
        <div className="relative max-w-xl">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cases, techniques, or locations"
            aria-label="Search cases, techniques, or locations"
            className="h-11 w-full rounded-lg border border-border bg-card/60 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Filter by SQL technique"
        >
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              aria-pressed={activeTag === tag}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                activeTag === tag
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-4">
        {filteredCases.map((c) => (
          <Link
            key={c.id}
            to="/case/$caseId"
            params={{ caseId: c.id }}
            className="surface surface-hover group flex flex-col gap-5 rounded-xl p-4 transition md:flex-row md:items-center md:p-6"
          >
            <div className="flex-1 min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`chip chip-dot ${diffStyle[c.difficulty]}`}>
                  <span>{c.difficulty}</span>
                </span>
                <span className="chip">
                  {c.location} · {c.year}
                </span>
                {c.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="chip hidden sm:inline-flex">
                    {tag}
                  </span>
                ))}
                {progressState[c.id]?.completed ? (
                  <span className="chip chip-dot text-success">
                    <span>Completed</span>
                  </span>
                ) : progressState[c.id]?.inProgress ? (
                  <span className="chip chip-dot text-accent">
                    <span>In progress</span>
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 md:gap-3">
                <h2 className="text-2xl transition group-hover:text-primary md:text-3xl">
                  {c.title}
                </h2>
                <p className="italic text-muted-foreground">{c.tagline}</p>
                <p className="max-w-2xl text-sm leading-relaxed text-foreground/80">{c.synopsis}</p>
              </div>
            </div>

            <div className="shrink-0 border-t border-border pt-3 md:min-w-[180px] md:border-t-0 md:border-l md:pt-0 md:pl-6 md:text-right">
              <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Victim
              </div>
              <div className="mt-1 text-base">{c.victim}</div>
              <div className="mt-4 mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {c.chapters.length} chapters · {c.suspects.length} suspects
              </div>
              <div className="mt-3 text-sm font-medium text-primary">Open file →</div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="surface rounded-xl p-8 text-center">
          <h2 className="text-2xl">No case files found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try another search or clear the active filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveTag("All cases");
            }}
            className="mt-5 rounded-md border border-border px-4 py-2 text-sm transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Show all cases
          </button>
        </div>
      )}
    </main>
  );
}
