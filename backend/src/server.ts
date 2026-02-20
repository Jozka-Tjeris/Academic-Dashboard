import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";

export const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});

server.unref(); // Allows process to exit even if the server is open

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
});
