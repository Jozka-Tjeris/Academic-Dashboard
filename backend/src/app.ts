import express from "express";
import cors from "cors";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import { requestIdMiddleware } from "./middlewares/requestId.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { healthRouter } from "./routes/health.routes";
import cookieParser from 'cookie-parser';
import authRoutes from "./modules/auth/auth.routes";
import passport from './modules/auth/passport';
import { env } from "./config/env";

export const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// No passport.session(), meant to be stateless
app.use(passport.initialize());

app.use(requestIdMiddleware);
app.use(requestLogger);

// Public routes here
app.use("/health", healthRouter);

// Feature routes here
app.use('/api/auth', authRoutes);

app.use(errorMiddleware);
