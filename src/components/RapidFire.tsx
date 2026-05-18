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
        className="surface rounded-xl p-8 text-center max-w-2xl mx-auto"
      >
        <span className="chip chip-dot text-destructive mb-4">
          <span>Rapid fire</span>
        </span>
        <h2 className="text-3xl md:text-4xl mt-2 text-balance">{intro}</h2>
        <p className="mt-4 text-sm text-muted-foreground mono">
          {questions.length} questions · {timePerQuestion}s each · 60% to pass
        </p>
        <button
          onClick={() => setStarted(true)}
          className="mt-6 px-6 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
        >
          Begin →
        </button>
      </motion.div>
    );
  }

  const q = questions[idx];
  const pct = (time / timePerQuestion) * 100;

  return (
    <div className="surface rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mono text-xs text-muted-foreground">
        <span>
          Question {idx + 1} of {questions.length}
        </span>
        <span className={time <= 3 ? "text-destructive" : "text-primary"}>{time}s</span>
      </div>
      <div className="h-1 bg-secondary mt-2 rounded overflow-hidden">
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
          <h3 className="text-2xl md:text-3xl mt-6 text-balance">{q.prompt}</h3>
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex;
              const isPicked = picked === i;
              const show = picked !== null;
              return (
                <button
                  key={i}
                  disabled={picked !== null}
                  onClick={() => handlePick(i)}
                  className={[
                    "text-left p-4 rounded-lg border transition text-sm",
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
              {q.explanation}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
