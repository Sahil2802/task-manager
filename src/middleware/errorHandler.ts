import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

const errorMap: Record<string, (err: Error) => AppError> = {
  ValidationError: (err) => new AppError(err.message, 400),
  CastError: () => new AppError("Invalid Id format", 400),
  JsonWebTokenError: () => new AppError("Invalid token", 401),
  TokenExpiredError: () => new AppError("Token expired", 401),
};

// Normalize unknown errors into AppError
function normalizeError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (
    err instanceof Error &&
    typeof (err as { code?: unknown }).code === "number"
  ) {
    const code = (err as { code?: number }).code;
    if (code === 11000) {
      return new AppError("Duplicate field value entered", 409);
    }
  }

  // Known mapped errors
  if (err instanceof Error && errorMap[err.name]) {
    const handler = errorMap[err.name];
    if (handler) {
      return handler(err);
    }
  }

  //   Fallback (unknown error)
  const message = err instanceof Error ? err.message : "Internal Server Error";
  return new AppError(message, 500);
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const error = normalizeError(err);

  const logPayload = {
    originalMessage: err instanceof Error ? err.message : undefined,
    stack: err instanceof Error ? err.stack : undefined,
    normalizedMessage: error.message,
    statusCode: error.statusCode,
    url: req.originalUrl,
    method: req.method,
  };

  // Log all errors with appropriate severity
  if (error.statusCode >= 500) {
    logger.error("Server error", logPayload);
  } else {
    logger.warn("Client error", logPayload);
  }

  const response: { error: string; message: string; stack?: string } = {
    error: error.statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "CLIENT_ERROR",
    message: error.message,
  };

  if (env.nodeEnv === "development" && err instanceof Error && err.stack) {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};
