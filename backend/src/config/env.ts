import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 4000,
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "",
  BACKEND_URL: process.env.BACKEND_URL || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
};

export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";

/*
Validate in the future

JWT_SECRET: z.string().min(1),
GOOGLE_CLIENT_ID: z.string().min(1),
GOOGLE_CLIENT_SECRET: z.string().min(1),
FRONTEND_URL: z.string().url(),

*/