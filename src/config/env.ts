import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || "",
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "",
};

export function validateEnv(): void {
  if (!env.mongoUri) throw new Error("MONGODB_URI is not set");
  if (!env.jwtSecret) throw new Error("JWT_SECRET is not set");
}
