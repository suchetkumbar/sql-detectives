import { CASE_TRAIN } from "./cases/ashford-line";
import { CASE_BLACKWOOD } from "./cases/blackwood-manor";
import { CASE_VELVET } from "./cases/velvet-lounge";
import type { Case } from "./cases/types";

export type {
  Case,
  Chapter,
  Difficulty,
  RapidFireQuestion,
  SqlCell,
  SqlRow,
  Suspect,
} from "./cases/types";

export const CASES: Case[] = [CASE_VELVET, CASE_TRAIN, CASE_BLACKWOOD];
export const getCase = (id: string) => CASES.find((c) => c.id === id);
