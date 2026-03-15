import { MAX_ASSESSMENT_WEIGHT } from "@internal_package/shared";
import { z } from "zod";

export const createAssessmentSchema = z.object({
  title: z.string().min(1, "Assessment title is required").max(40),
  description: z.string().max(250, "Description too long").optional(),
  dueDate: z.string(),
  weight: z.number().min(0).max(MAX_ASSESSMENT_WEIGHT * 100),
  maxScore: z.number().min(0),
});
