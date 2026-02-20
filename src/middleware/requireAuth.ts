import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

const BEARER_PREFIX = "Bearer ";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
    next(new AppError("Authorization token missing", 401));
    return;
  }

  const token = authHeader.slice(BEARER_PREFIX.length).trim();
  if (!token) {
    next(new AppError("Authorization token missing", 401));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    if (!decoded.sub) {
      next(new AppError("Invalid token", 401));
      return;
    }

    res.locals.userId = decoded.sub;
    res.locals.userEmail = decoded.email;
    next();
  } catch (error) {
    next(error);
  }
};
