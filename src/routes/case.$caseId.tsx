import { createFileRoute, Link, useParams, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCase } from "@/lib/cases";
import { createDatabase, runQuery, type QueryResult } from "@/lib/sql-engine";
import { SqlEditor } from "@/components/SqlEditor";
import { ResultsTable } from "@/components/ResultsTable";
import { RapidFire } from "@/components/RapidFire";
import type { Database } from "sql.js";

export const Route = createFileRoute("/case/$caseId")({
  head: ({ params }) => {
    const c = getCase(params.caseId);
    return {
      meta: [
        { title: c ? `${c.title} — Coldcase SQL` : "Case — Coldcase SQL" },
        { name: "description", content: c?.synopsis ?? "A SQL mystery case." },
      ],
    };
  },
  component: PlayPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="surface rounded-xl p-8 text-center">
        <p className="mono text-xs text-destructive uppercase tracking-wider">Case not found</p>
        <Link to="/cases" className="block mt-3 text-primary hover:underline">Back to cases</Link>
      </div>
    </div>
  ),
  loader: ({ params }) => {
    const c = getCase(params.caseId);
    if (!c) throw notFound();
    return { caseId: params.caseId };
  },
});

type Phase =
  | { kind: "intro" }
  | { kind: "chapter"; index: number }
  | { kind: "rapidfire" }
  | { kind: "verdict" }
  | { kind: "epilogue"; correct: boolean };

const diffStyle: Record<string, string> = {
  beginner: "text-success",
  intermediate: "text-accent",
  advanced: "text-destructive",
};

function PlayPage() {
  const { caseId } = useParams({ from: "/case/$caseId" });
  const theCase = getCase(caseId)!;

  const [db, setDb] = useState<Database | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const [unlockedReveals, setUnlockedReveals] = useState<string[]>([]);
  const [sqlText, setSqlText] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [validation, setValidation] = useState<{ ok: boolean; message?: string } | null>(null);
  const [showSchema, setShowSchema] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [rapidResult, setRapidResult] = useState<{ passed: boolean; correct: number; total: number } | null>(null);
  const [pickedSuspect, setPickedSuspect] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoadingDb(true);
    createDatabase(theCase.schema).then((d) => {
      if (!active) return;
      setDb(d); setLoadingDb(false);
    }).catch((e) => { console.error(e); setLoadingDb(false); });
    return () => { active = false; };
  }, [theCase.schema]);

  const currentChapter = phase.kind === "chapter" ? theCase.chapters[phase.index] : null;

  useEffect(() => {
    if (currentChapter) { setSqlText(currentChapter.starterSql ?? ""); setResult(null); setValidation(null); setShowHint(false); }
  }, [currentChapter?.id]);

  const runSql = () => {
    if (!db || !sqlText.trim()) return;
    const r = runQuery(db, sqlText);
    setResult(r);
    if (currentChapter && !r.error) {
      const v = currentChapter.validate(r.rows, r.columns);
      setValidation(v);
    } else {
      setValidation(null);
    }
  };

  const advanceChapter = () => {
    if (phase.kind !== "chapter") return;
    if (!unlockedReveals.includes(currentChapter!.id)) {
      setUnlockedReveals((u) => [...u, currentChapter!.id]);
    }
    const total = theCase.chapters.length;
    const rapidAt = Math.max(0, total - 2);
    if (phase.index === rapidAt - 1 && rapidResult === null) {
      setPhase({ kind: "rapidfire" });
      return;
    }
    if (phase.index + 1 >= total) {
      setPhase({ kind: "verdict" });
    } else {
      setPhase({ kind: "chapter", index: phase.index + 1 });
    }
  };

  if (loadingDb) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mono text-sm text-primary animate-pulse">Loading SQLite…</div>
          <div className="mono text-xs text-muted-foreground mt-2">{theCase.title}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <Link to="/cases" className="text-sm text-muted-foreground hover:text-foreground transition shrink-0">← Cases</Link>
        <div className="text-center min-w-0 flex-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className={`chip chip-dot ${diffStyle[theCase.difficulty]}`}><span>{theCase.difficulty}</span></span>
            <span className="mono text-xs text-muted-foreground">{theCase.year}</span>
          </div>
          <h1 className="text-2xl md:text-3xl truncate">{theCase.title}</h1>
        </div>
        <button
          onClick={() => setShowSchema(true)}
          className="text-sm text-primary hover:underline underline-offset-4 shrink-0"
        >Schema</button>
      </div>

      <ChapterRail
        chapters={theCase.chapters}
        unlocked={unlockedReveals}
        current={phase.kind === "chapter" ? phase.index : -1}
        rapidDone={rapidResult !== null}
      />

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {phase.kind === "intro" && (
            <motion.section key="intro" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="surface rounded-xl p-8 md:p-12 max-w-3xl mx-auto text-center">
                <span className="chip chip-dot text-primary mb-4"><span>Case open</span></span>
                <h2 className="text-4xl md:text-5xl mt-2">{theCase.title}</h2>
                <p className="italic text-muted-foreground mt-2">{theCase.tagline}</p>
                <div className="my-6 h-px bg-border" />
                <p className="text-lg text-balance leading-relaxed">{theCase.synopsis}</p>
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span className="mono text-xs uppercase tracking-wider">Victim</span>
                  <span>·</span>
                  <span>{theCase.victim}</span>
                </div>
                <button
                  onClick={() => setPhase({ kind: "chapter", index: 0 })}
                  className="mt-8 px-6 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
                >Begin chapter 1 →</button>
              </div>
            </motion.section>
          )}

          {phase.kind === "chapter" && currentChapter && (
            <motion.section key={currentChapter.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-5 gap-6">
                {/* Story column */}
                <div className="lg:col-span-2 surface rounded-xl p-6">
                  <div className="mono text-xs text-muted-foreground uppercase tracking-wider">Chapter {phase.index + 1} / {theCase.chapters.length}</div>
                  <h2 className="text-2xl mt-1.5">{currentChapter.title}</h2>
                  <p className="mt-4 text-foreground/90 leading-relaxed">{currentChapter.narrative}</p>
                  <div className="mt-5 border-l-2 border-primary pl-4 py-1">
                    <div className="mono text-xs text-primary uppercase tracking-wider mb-1">Your task</div>
                    <p className="text-foreground">{currentChapter.task}</p>
                  </div>
                  <button
                    onClick={() => setShowHint((s) => !s)}
                    className="mt-4 text-xs text-muted-foreground hover:text-primary transition"
                  >{showHint ? "− Hide hint" : "+ Show hint"}</button>
                  {showHint && (
                    <pre className="mt-2 bg-[#0f1418] border border-border rounded-md p-3 text-xs mono text-foreground/80 whitespace-pre-wrap">{currentChapter.hint}</pre>
                  )}

                  {unlockedReveals.includes(currentChapter.id) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 border border-success/40 bg-success/10 rounded-lg">
                      <div className="mono text-xs text-success uppercase tracking-wider mb-1">Evidence logged</div>
                      <p className="italic text-foreground/90">{currentChapter.reveal}</p>
                    </motion.div>
                  )}
                </div>

                {/* Editor column */}
                <div className="lg:col-span-3 space-y-4">
                  <SqlEditor value={sqlText} onChange={setSqlText} onRun={runSql} />
                  <ResultsTable result={result} />

                  {validation && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                      className={`rounded-lg p-4 ${validation.ok ? "border border-success/40 bg-success/10" : "border border-destructive/30 bg-destructive/10"}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className={`mono text-xs uppercase tracking-wider ${validation.ok ? "text-success" : "text-destructive"}`}>
                            {validation.ok ? "Correct" : "Not quite"}
                          </div>
                          {validation.message && <p className="mt-1 text-sm text-foreground/90">{validation.message}</p>}
                        </div>
                        {validation.ok && (
                          <button
                            onClick={advanceChapter}
                            className="shrink-0 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
                          >Next →</button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {phase.kind === "rapidfire" && (
            <motion.section key="rf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!rapidResult ? (
                <RapidFire
                  intro={theCase.rapidFire.intro}
                  questions={theCase.rapidFire.questions}
                  timePerQuestion={theCase.rapidFire.timePerQuestion}
                  onComplete={(r) => setRapidResult(r)}
                />
              ) : (
                <div className="surface rounded-xl p-8 text-center max-w-2xl mx-auto">
                  <span className={`chip chip-dot ${rapidResult.passed ? "text-success" : "text-destructive"} mb-3`}>
                    <span>{rapidResult.passed ? "Passed" : "Failed"}</span>
                  </span>
                  <h2 className="text-3xl mt-2">{rapidResult.correct} / {rapidResult.total}</h2>
                  <p className="mt-4 text-foreground/90 italic">
                    {rapidResult.passed ? theCase.rapidFire.successReward : theCase.rapidFire.failureConsequence}
                  </p>
                  <button
                    onClick={() => {
                      const rapidAt = Math.max(0, theCase.chapters.length - 2);
                      setPhase({ kind: "chapter", index: rapidAt });
                    }}
                    className="mt-6 px-6 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
                  >Resume investigation →</button>
                </div>
              )}
            </motion.section>
          )}

          {phase.kind === "verdict" && (
            <motion.section key="verdict" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="surface rounded-xl p-8">
                <div className="text-center">
                  <span className="chip chip-dot text-primary mb-3"><span>The verdict</span></span>
                  <h2 className="text-4xl mt-2">Name your suspect.</h2>
                  <p className="text-muted-foreground mt-2">Every chapter narrowed the field. One name remains.</p>
                </div>
                <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {theCase.suspects.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setPickedSuspect(s.id);
                        const correct = s.id === theCase.murdererId;
                        setTimeout(() => setPhase({ kind: "epilogue", correct }), 1000);
                      }}
                      disabled={!!pickedSuspect}
                      className={[
                        "text-left p-4 rounded-lg border transition",
                        pickedSuspect === s.id && s.id === theCase.murdererId ? "border-success bg-success/10" :
                        pickedSuspect === s.id ? "border-destructive bg-destructive/10" :
                        "border-border bg-secondary/30 hover:border-primary/60",
                      ].join(" ")}
                    >
                      <div className="mono text-xs text-muted-foreground uppercase tracking-wider">{s.alias}</div>
                      <div className="text-lg mt-1">{s.name}</div>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {phase.kind === "epilogue" && (
            <motion.section key="epi" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="surface rounded-xl p-10 max-w-3xl mx-auto text-center">
                <span className={`chip chip-dot ${phase.correct ? "text-success" : "text-destructive"} mb-3`}>
                  <span>{phase.correct ? "Case closed" : "Wrong arrest"}</span>
                </span>
                <h2 className="text-4xl mt-2">{phase.correct ? "You got them." : "The real killer walks."}</h2>
                <p className="mt-6 text-lg leading-relaxed italic text-balance text-foreground/90">{theCase.epilogue}</p>
                <div className="mt-8 flex flex-wrap gap-3 justify-center">
                  <Link to="/cases" className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition">
                    Next case →
                  </Link>
                  <button
                    onClick={() => { setPhase({ kind: "intro" }); setUnlockedReveals([]); setRapidResult(null); setPickedSuspect(null); setValidation(null); setResult(null); }}
                    className="px-5 py-2.5 rounded-md border border-border hover:border-primary/50 transition"
                  >Replay</button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* SCHEMA DRAWER */}
      {showSchema && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={() => setShowSchema(false)}>
          <div onClick={(e) => e.stopPropagation()} className="surface rounded-xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl">Schema</h3>
              <button onClick={() => setShowSchema(false)} className="text-sm text-muted-foreground hover:text-foreground">Close ✕</button>
            </div>
            <pre className="bg-[#0f1418] border border-border rounded-md p-4 text-sm mono text-foreground/90 whitespace-pre-wrap">{theCase.schemaSummary.trim()}</pre>
            <p className="mt-4 text-xs text-muted-foreground">SQLite dialect. Tables, columns, and relationships for this case.</p>
          </div>
        </div>
      )}
    </main>
  );
}

function ChapterRail({ chapters, unlocked, current, rapidDone }: { chapters: { id: string; title: string }[]; unlocked: string[]; current: number; rapidDone: boolean }) {
  const total = chapters.length;
  const rapidAt = Math.max(0, total - 2);
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {chapters.map((ch, i) => {
        const isUnlocked = unlocked.includes(ch.id);
        const isCurrent = i === current;
        return (
          <div key={ch.id} className="flex items-center gap-2 shrink-0">
            <div
              title={ch.title}
              className={[
                "h-1.5 w-14 rounded-full transition",
                isUnlocked ? "bg-primary" : isCurrent ? "bg-primary/40 animate-pulse" : "bg-secondary",
              ].join(" ")}
            />
            {i === rapidAt - 1 && (
              <div className={`h-1.5 w-1.5 rounded-full ${rapidDone ? "bg-destructive" : "bg-destructive/30"}`} title="Rapid fire" />
            )}
          </div>
        );
      })}
    </div>
  );
}
