import { z } from "zod";

export const createCourseSchema = z.object({
  name: z.string().min(1, "Course name is required").max(40),

  description: z
    .string()
    .max(250, "Description too long")
    .optional(),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
