import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RapidFireQuestion } from "@/lib/cases";

interface Props {
  intro: string;
  questions: RapidFireQuestion[];
  timePerQuestion: number;
  onComplete: (result: { passed: boolean; correct: number; total: number }) => void;
}

export function RapidFire({ intro, questions, timePerQuestion, onComplete }: Props) {
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [time, setTime] = useState(timePerQuestion);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  const handlePick = useCallback(
    (i: number) => {
      if (picked !== null) return;
      setPicked(i);
      const ok = i === questions[idx].correctIndex;
      if (ok) setCorrect((c) => c + 1);
      setTimeout(() => {
        if (idx + 1 >= questions.length) {
          const finalCorrect = correct + (ok ? 1 : 0);
          onComplete({
            passed: finalCorrect >= Math.ceil(questions.length * 0.6),
            correct: finalCorrect,
            total: questions.length,
          });
        } else {
          setIdx(idx + 1);
          setPicked(null);
          setTime(timePerQuestion);
        }
      }, 1100);
    },
    [correct, idx, onComplete, picked, questions, timePerQuestion],
  );

  useEffect(() => {
    if (!started || picked !== null) return;
    if (time <= 0) {
      handlePick(-1);
      return;
    }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time, started, picked, handlePick]);

  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="surface mx-auto max-w-2xl rounded-xl p-6 text-center md:p-8"
      >
        <span className="chip chip-dot text-destructive mb-4">
          <span>Rapid fire</span>
        </span>
        <h2 className="text-3xl md:text-4xl mt-2 text-balance">{intro}</h2>
        <p className="mt-4 text-sm text-muted-foreground mono">
          {questions.length} questions · {timePerQuestion}s each · 60% to pass
        </p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="mt-6 rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Begin →
        </button>
      </motion.div>
    );
  }

  const q = questions[idx];
  const pct = (time / timePerQuestion) * 100;

  return (
    <div className="surface mx-auto max-w-3xl rounded-xl p-5 md:p-8">
      <div className="flex items-center justify-between gap-4 mono text-xs text-muted-foreground">
        <span>
          Question {idx + 1} of {questions.length}
        </span>
        <span className={time <= 3 ? "text-destructive" : "text-primary"}>{time}s</span>
      </div>
      <div
        className="mt-2 h-1 overflow-hidden rounded bg-secondary"
        role="progressbar"
        aria-label="Time remaining"
        aria-valuemin={0}
        aria-valuemax={timePerQuestion}
        aria-valuenow={time}
      >
        <div
          className={`h-full transition-[width] duration-1000 linear ${time <= 3 ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <h3 className="mt-6 text-balance text-2xl md:text-3xl">{q.prompt}</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex;
              const isPicked = picked === i;
              const show = picked !== null;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => handlePick(i)}
                  aria-label={`Answer ${String.fromCharCode(65 + i)}: ${opt}`}
                  className={[
                    "rounded-lg border p-4 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    show && isCorrect
                      ? "border-success bg-success/10"
                      : show && isPicked
                        ? "border-destructive bg-destructive/10"
                        : "border-border bg-secondary/30 hover:border-primary/60",
                  ].join(" ")}
                >
                  <span className="mono text-xs text-muted-foreground mr-2">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-muted-foreground"
            >
              <span className="font-medium text-foreground">
                {picked === q.correctIndex ? "Correct. " : "Not quite. "}
              </span>
              {q.explanation}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
