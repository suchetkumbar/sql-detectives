const STORAGE_PREFIX = "sql-detectives.progress.";

export type PersistedPhase =
  | { kind: "intro" }
  | { kind: "chapter"; index: number }
  | { kind: "rapidfire" }
  | { kind: "verdict" }
  | { kind: "epilogue"; correct: boolean };

export interface CaseProgress {
  phase: PersistedPhase;
  unlockedReveals: string[];
  sqlText: string;
  rapidResult: { passed: boolean; correct: number; total: number } | null;
  pickedSuspect: string | null;
}

export function progressStorageKey(caseId: string) {
  return `${STORAGE_PREFIX}${caseId}`;
}

function getStorage(): Storage | null {
  if (typeof window !== "undefined") return window.localStorage;
  if (typeof globalThis !== "undefined" && typeof (globalThis as any).localStorage !== "undefined") {
    return (globalThis as any).localStorage as Storage;
  }
  return null;
}

export function loadProgress(caseId: string): CaseProgress | null {
  const storage = getStorage();
  if (!storage) return null;

  const stored = storage.getItem(progressStorageKey(caseId));
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<CaseProgress>;
    if (!parsed || typeof parsed !== "object") return null;

    const phase = parsed.phase as PersistedPhase | undefined;
    if (!phase || typeof phase.kind !== "string") return null;

    return {
      phase,
      unlockedReveals: Array.isArray(parsed.unlockedReveals) ? parsed.unlockedReveals.filter(Boolean) : [],
      sqlText: typeof parsed.sqlText === "string" ? parsed.sqlText : "",
      rapidResult: parsed.rapidResult && typeof parsed.rapidResult === "object"
        ? {
            passed: Boolean(parsed.rapidResult.passed),
            correct: Number(parsed.rapidResult.correct) || 0,
            total: Number(parsed.rapidResult.total) || 0,
          }
        : null,
      pickedSuspect:
        parsed.pickedSuspect === null || typeof parsed.pickedSuspect === "string"
          ? parsed.pickedSuspect
          : null,
    };
  } catch {
    return null;
  }
}

export function saveProgress(caseId: string, progress: CaseProgress) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(progressStorageKey(caseId), JSON.stringify(progress));
}

export function clearProgress(caseId: string) {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(progressStorageKey(caseId));
}

export function isProgressEmpty(progress: CaseProgress) {
  return (
    progress.phase.kind === "intro" &&
    progress.unlockedReveals.length === 0 &&
    progress.sqlText.trim() === "" &&
    progress.rapidResult === null &&
    progress.pickedSuspect === null
  );
}

export function isCaseCompleted(progress: CaseProgress) {
  return progress.phase.kind === "epilogue";
}
