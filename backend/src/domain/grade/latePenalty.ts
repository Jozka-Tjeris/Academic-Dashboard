import { DEFAULT_MAX_SCORE } from "../../../../shared/constants/constants";

export function applyLatePenalty(score: number, latePenalty: number){
  return Math.min(Math.max(score * (1 - latePenalty), 0), DEFAULT_MAX_SCORE);
}