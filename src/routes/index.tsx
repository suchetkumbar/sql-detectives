import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CASES } from "@/lib/cases";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coldcase SQL — Learn SQL by Solving Mysteries" },
      { name: "description", content: "Interactive SQL learning through detective stories. Three difficulty tiers, narrative chapters, and timed challenges — all powered by real in-browser SQLite." },
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
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-bg absolute inset-0 -z-10" />

      <header className="max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/15 border border-primary/30 grid place-items-center">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
          <span className="font-medium">Coldcase</span>
          <span className="chip">SQL</span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/cases" className="text-muted-foreground hover:text-foreground transition">Cases</Link>
          <Link to="/cases" className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition text-sm font-medium">
            Start playing
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="chip chip-dot text-primary mb-6">
            <span>Now with 3 cases · 14 chapters</span>
          </span>
          <h1 className="text-5xl md:text-7xl leading-[1.05] text-balance max-w-4xl mx-auto">
            Learn SQL by <em className="text-primary not-italic font-display italic">solving</em> mysteries.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto text-balance">
            Three story-driven cases. Real SQLite in your browser. Every query you write is the next move in the investigation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/case/$caseId" params={{ caseId: "velvet-lounge" }}
              className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition">
              Start your first case →
            </Link>
            <Link to="/cases"
              className="px-5 py-2.5 rounded-md border border-border hover:border-primary/50 transition">
              Browse all cases
            </Link>
          </div>
        </motion.div>

        {/* preview card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="surface rounded-xl overflow-hidden ring-glow">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/60">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
              </div>
              <span className="mono text-xs text-muted-foreground">case · velvet-lounge · chapter II</span>
              <span className="mono text-xs text-primary">↵ run</span>
            </div>
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-3 p-5 mono text-sm text-left bg-[#0f1418]">
                <div><span className="text-primary">SELECT</span> name, occupation</div>
                <div><span className="text-primary">FROM</span>   suspects</div>
                <div><span className="text-primary">WHERE</span>  left_at {'>='} <span className="text-accent">'23:45'</span>;</div>
              </div>
              <div className="md:col-span-2 p-5 text-left border-t md:border-t-0 md:border-l border-border">
                <div className="mono text-xs text-muted-foreground mb-2">3 rows · 4ms</div>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex justify-between"><span>Marlon Reeves</span><span className="text-muted-foreground">Saxophonist</span></li>
                  <li className="flex justify-between"><span>Sal Moretti</span><span className="text-muted-foreground">Club Owner</span></li>
                  <li className="flex justify-between"><span>Clara Wynn</span><span className="text-muted-foreground">Stage Manager</span></li>
                </ul>
                <div className="mt-4 text-xs text-primary">Three names. One of them lies.</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* stats */}
        <div className="mt-14 grid grid-cols-3 max-w-2xl mx-auto gap-4">
          {[
            { k: "3", v: "Cases" },
            { k: "14", v: "Chapters" },
            { k: "15", v: "Rapid-fire questions" },
          ].map((s) => (
            <div key={s.v} className="surface rounded-lg p-4">
              <div className="text-3xl font-display text-primary">{s.k}</div>
              <div className="mono text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { t: "Real SQLite", d: "Queries run against a genuine in-browser database. Use joins, CTEs, window functions — anything SQLite supports." },
            { t: "Story-driven", d: "Each chapter unlocks the next plot beat only when your query returns the right evidence." },
            { t: "Timed rounds", d: "A rapid-fire interlude mid-story tests fundamentals. Beat the clock or the trail goes cold." },
          ].map((f) => (
            <div key={f.t} className="surface surface-hover rounded-xl p-5">
              <div className="h-8 w-8 rounded-md bg-primary/15 border border-primary/30 mb-4" />
              <h3 className="text-xl">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CASES */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-4xl">The cases</h2>
            <p className="text-muted-foreground mt-2">Start light, then climb.</p>
          </div>
          <Link to="/cases" className="text-sm text-primary hover:underline underline-offset-4">All cases →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {CASES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            >
              <Link to="/case/$caseId" params={{ caseId: c.id }}
                className="block surface surface-hover rounded-xl p-5 h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className={`chip chip-dot ${diffStyle[c.difficulty]}`}>
                    <span>{c.difficulty}</span>
                  </span>
                  <span className="mono text-xs text-muted-foreground">{c.year}</span>
                </div>
                <h3 className="text-2xl">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">{c.tagline}</p>
                <div className="mt-5 flex items-center justify-between text-xs mono text-muted-foreground">
                  <span>{c.chapters.length} chapters · {c.suspects.length} suspects</span>
                  <span className="text-primary">Open →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Coldcase SQL · a learning game</span>
          <span className="mono">Every query runs real SQLite (WASM)</span>
        </div>
      </footer>
    </main>
  );
}
