import { beforeEach, describe, expect, it } from "vitest";
import { clearProgress, isCaseCompleted, loadProgress, saveProgress } from "./progress";

describe("progress persistence", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    } else if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
      (globalThis as any).localStorage.clear();
    } else {
      (globalThis as any).localStorage = {
        _data: {} as Record<string, string>,
        getItem(key: string) {
          return this._data[key] ?? null;
        },
        setItem(key: string, value: string) {
          this._data[key] = value;
        },
        removeItem(key: string) {
          delete this._data[key];
        },
        clear() {
          this._data = {} as Record<string, string>;
        },
      };
    }
  });

  it("saves and loads a case progress record", () => {
    const progress = {
      phase: { kind: "chapter", index: 1 } as const,
      unlockedReveals: ["c1"],
      sqlText: "SELECT 1;",
      rapidResult: null,
      pickedSuspect: null,
    };

    saveProgress("velvet-lounge", progress);
    const loaded = loadProgress("velvet-lounge");

    expect(loaded).toEqual(progress);
  });

  it("identifies completed progress", () => {
    const progress = {
      phase: { kind: "epilogue", correct: true } as const,
      unlockedReveals: ["c1", "c2"],
      sqlText: "",
      rapidResult: { passed: true, correct: 4, total: 4 },
      pickedSuspect: "suspect-1",
    };

    saveProgress("blackwood-manor", progress);
    const loaded = loadProgress("blackwood-manor");
    expect(loaded).not.toBeNull();
    expect(isCaseCompleted(loaded!)).toBe(true);
  });

  it("clears saved progress", () => {
    const progress = {
      phase: { kind: "intro" } as const,
      unlockedReveals: [],
      sqlText: "",
      rapidResult: null,
      pickedSuspect: null,
    };

    saveProgress("ashford-line", progress);
    clearProgress("ashford-line");
    expect(loadProgress("ashford-line")).toBeNull();
  });
});
