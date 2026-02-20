import pino from "pino";
import { isDev } from "../config/env";

export const logger = pino({
  level: process.env.NODE_ENV === "test" ? "silent" : process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "test" ? undefined : 
    (isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
      }
    : undefined),
});