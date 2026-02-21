import express from "express";
import helmet from "helmet";
import { router } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

export const createApp = () => {
  const app = express();

  app.use(express.json());
  // Basic security headers
  app.use(helmet());

  app.use("/api", router);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
