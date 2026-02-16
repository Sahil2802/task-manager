import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const connectDb = async (): Promise<void> => {
  await mongoose.connect(env.mongoUri);
  logger.info("MongoDB connected");
};
