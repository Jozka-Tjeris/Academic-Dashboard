import pinoHttp from "pino-http";
import { logger } from "../lib/logger";

export const requestLogger = pinoHttp({
  logger,
  customProps: (req) => ({
    requestId: req.headers["x-request-id"],
  }),
});