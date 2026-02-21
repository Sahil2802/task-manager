import winston from "winston";
import { env } from "../config/env.js";

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

//  Dev Format 
// Human-readable, colorized output for local development
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : "";
    return `[${timestamp}] ${level}: ${message}${stack ? `\n${stack}` : ""}${metaStr}`;
  }),
);

//  Production Format 
// Structured JSON logs for log aggregators (Datadog, CloudWatch, etc.)
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

export const logger = winston.createLogger({
  level: env.nodeEnv === "production" ? "warn" : "debug",
  format: env.nodeEnv === "production" ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
  ],
  // Prevent winston from throwing on unhandled exceptions
  exitOnError: false,
});
