import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CASES } from "@/lib/cases";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coldcase SQL — Learn SQL by Solving Mysteries" },
      {
        name: "description",
        content:
          "Interactive SQL learning through detective stories. Three difficulty tiers, narrative chapters, and timed challenges — all powered by real in-browser SQLite.",
      },
      { property: "og:title", content: "Coldcase SQL" },
      { property: "og:description", content: "Learn SQL by solving murder mysteries." },
    ],
  }),
  component: Landing,
});

const diffStyle: Record<string, string> = {
  beginner: "text-success",
  intermediate: "text-accent",
  advanced: "text-destructive",
};

function Landing() {
  const totalChapters = CASES.reduce((sum, c) => sum + c.chapters.length, 0);
  const totalRapidFire = CASES.reduce((sum, c) => sum + c.rapidFire.questions.length, 0);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-bg absolute inset-0 -z-10" />

      <header className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md border border-primary/30 bg-primary/15">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
          <span className="font-medium">Coldcase</span>
          <span className="chip">SQL</span>
        </div>

        <nav className="flex items-center gap-3 text-sm sm:gap-6">
          <Link to="/cases" className="text-muted-foreground transition hover:text-foreground">
            Cases
          </Link>
          <Link
            to="/cases"
            className="rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Start playing
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 md:pt-24 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="chip chip-dot text-primary mb-6">
            <span>
              Now with {CASES.length} cases · {totalChapters} chapters
            </span>
          </span>
          <h1 className="mx-auto max-w-4xl text-balance text-5xl leading-[1.05] md:text-7xl">
            Learn SQL by <em className="font-display text-primary not-italic italic">solving</em>{" "}
            mysteries.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            Story-driven investigations, real SQLite in your browser, and a steady climb from first
            query to full case closure.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/case/$caseId"
              params={{ caseId: "velvet-lounge" }}
              className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Start your first case →
            </Link>
            <Link
              to="/cases"
              className="rounded-md border border-border px-5 py-2.5 transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Browse all cases
            </Link>
          </div>
        </motion.div>

        {/* preview card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="surface rounded-xl overflow-hidden ring-glow">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/60">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
              </div>
              <span className="mono text-xs text-muted-foreground">
                case · velvet-lounge · chapter II
              </span>
              <span className="mono text-xs text-primary">↵ run</span>
            </div>
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-3 p-5 mono text-sm text-left bg-[#0f1418]">
                <div>
                  <span className="text-primary">SELECT</span> name, occupation
                </div>
                <div>
                  <span className="text-primary">FROM</span> suspects
                </div>
                <div>
                  <span className="text-primary">WHERE</span> left_at {">="}{" "}
                  <span className="text-accent">'23:45'</span>;
                </div>
              </div>
              <div className="md:col-span-2 p-5 text-left border-t md:border-t-0 md:border-l border-border">
                <div className="mono text-xs text-muted-foreground mb-2">3 rows · 4ms</div>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex justify-between">
                    <span>Marlon Reeves</span>
                    <span className="text-muted-foreground">Saxophonist</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sal Moretti</span>
                    <span className="text-muted-foreground">Club Owner</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Clara Wynn</span>
                    <span className="text-muted-foreground">Stage Manager</span>
                  </li>
                </ul>
                <div className="mt-4 text-xs text-primary">Three names. One of them lies.</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* stats */}
        <div className="mx-auto mt-14 grid max-w-2xl gap-4 sm:grid-cols-3">
          {[
            { k: String(CASES.length), v: "Cases" },
            { k: String(totalChapters), v: "Chapters" },
            { k: String(totalRapidFire), v: "Rapid-fire questions" },
          ].map((s) => (
            <div key={s.v} className="surface rounded-lg p-4">
              <div className="text-3xl font-display text-primary">{s.k}</div>
              <div className="mono mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Real SQLite",
              d: "Queries run against a genuine in-browser database. Use joins, CTEs, window functions — anything SQLite supports.",
            },
            {
              t: "Story-driven",
              d: "Each chapter unlocks the next plot beat only when your query returns the right evidence.",
            },
            {
              t: "Timed rounds",
              d: "A rapid-fire interlude mid-story tests fundamentals. Beat the clock or the trail goes cold.",
            },
          ].map((f) => (
            <div key={f.t} className="surface surface-hover rounded-xl p-5">
              <div className="mb-4 h-8 w-8 rounded-md border border-primary/30 bg-primary/15" />
              <h3 className="text-xl">{f.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CASES */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-4xl">The cases</h2>
            <p className="mt-2 text-muted-foreground">Start light, then climb.</p>
          </div>
          <Link to="/cases" className="text-sm text-primary hover:underline underline-offset-4">
            All cases →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {CASES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to="/case/$caseId"
                params={{ caseId: c.id }}
                className="block h-full rounded-xl border border-border bg-card/40 p-5 transition hover:border-primary/50"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`chip chip-dot ${diffStyle[c.difficulty]}`}>
                    <span>{c.difficulty}</span>
                  </span>
                  <span className="mono text-xs text-muted-foreground">{c.year}</span>
                </div>

                <h3 className="text-2xl">{c.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{c.tagline}</p>

                <div className="mt-5 flex items-center justify-between text-xs mono text-muted-foreground">
                  <span>
                    {c.chapters.length} chapters · {c.suspects.length} suspects
                  </span>
                  <span className="text-primary">Open →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Coldcase SQL · a learning game</span>
          <span className="mono">Every query runs real SQLite (WASM)</span>
        </div>
      </footer>
    </main>
  );
}
