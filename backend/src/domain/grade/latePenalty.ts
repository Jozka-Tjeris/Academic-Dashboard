import { DEFAULT_MAX_SCORE } from "@shared/constants/constants";

export function applyLatePenalty(score: number, maxScore: number, latePenalty: number | null){
  if(score < 0 || maxScore < 0 || (latePenalty && latePenalty < 0)){
    return NaN;
  }
  // Calculates deduction amount based on the maximum score, not the current score
  const amountDeducted = maxScore * (latePenalty ?? 0);
  return Math.min(Math.max(score - amountDeducted, 0), DEFAULT_MAX_SCORE);
}