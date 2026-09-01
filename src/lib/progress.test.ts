import { beforeEach, describe, expect, it } from "vitest";
import { clearProgress, isCaseCompleted, loadProgress, saveProgress } from "./progress";

describe("progress persistence", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
      return;
    }

    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
      globalThis.localStorage.clear();
      return;
    }

    const memoryStorage = {
      _data: {} as Record<string, string>,
      clear() {
        this._data = {};
      },
      getItem(key: string) {
        return this._data[key] ?? null;
      },
      key(_index: number) {
        return null;
      },
      removeItem(key: string) {
        delete this._data[key];
      },
      setItem(key: string, value: string) {
        this._data[key] = value;
      },
    } as Storage & { _data: Record<string, string> };

    Object.defineProperty(globalThis, "localStorage", {
      value: memoryStorage,
      configurable: true,
      writable: true,
    });
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
