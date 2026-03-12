import { DEFAULT_MAX_SCORE, PENALTY_PERCENT_PER_DAY, TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";
import { Prisma } from "@prisma/client";

export function applyLatePenalty(
  score: Prisma.Decimal,
  maxScore: Prisma.Decimal,
  latePenalty: Prisma.Decimal | null
): Prisma.Decimal {
  if (score.lt(0) || maxScore.lt(0) || (latePenalty && latePenalty.lt(0))) {
    return new Prisma.Decimal(NaN);
  }

  const amountDeducted = maxScore.mul(latePenalty ?? new Prisma.Decimal(0));

  return Prisma.Decimal.min(Prisma.Decimal.max(score.minus(amountDeducted), 0), DEFAULT_MAX_SCORE);
}