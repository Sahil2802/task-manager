import express from "express";
import { router } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use("/api", router);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
