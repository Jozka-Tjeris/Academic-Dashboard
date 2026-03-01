import dotenv from "dotenv";
import { z } from "zod";

// Load .env only in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 4000))
    .refine((val) => !Number.isNaN(val), {
      message: "PORT must be a valid number",
    }),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  FRONTEND_URL: z.url("FRONTEND_URL must be a valid URL"),

  BACKEND_URL: z.url().optional(),

  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),

  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
});

// Parse & validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const errMsg = "Invalid environment variables: " + parsedEnv.error.issues;
  console.error(errMsg);
  process.exit(1);
}

export const env = parsedEnv.data;

export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
