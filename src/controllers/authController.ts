import type { Request, Response } from "express";
import { registerUser, loginUser } from "../services/authService.js";

/**
 * POST /api/auth/register
 * Passes the raw request body to authService for validation and registration.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
};

/**
 * POST /api/auth/login
 * Passes the raw request body to authService for validation and login.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await loginUser(req.body);
  res.status(200).json(result);
};
