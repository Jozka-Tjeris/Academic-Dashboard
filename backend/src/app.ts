import express from "express";
import cors from "cors";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import { requestIdMiddleware } from "./middlewares/requestId.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { healthRouter } from "./routes/health.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.use(requestIdMiddleware);
app.use(requestLogger);

app.use("/health", healthRouter);

// TODO: mount feature routes here

app.use(errorMiddleware);
