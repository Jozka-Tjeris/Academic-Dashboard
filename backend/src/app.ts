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
import coursesRoutes from "./modules/courses/course.routes";
import assessmentRoutes from "./modules/assessments/assessment.routes";
import { signToken } from "./modules/auth/jwt";

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
app.use('/courses', coursesRoutes);
app.use("/", assessmentRoutes);

// only enabled in development
if (env.NODE_ENV === 'development') {
  app.post('/dev/login', (req, res) => {
    const token = signToken({
      sub: 'dev-user-id',
      email: 'dev@example.com',
    });

    res.cookie('access_token', token, {
      httpOnly: true,
    });

    res.json({ message: 'Dev login successful' });
  });
}

app.use(errorMiddleware);
