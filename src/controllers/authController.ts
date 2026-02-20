import type { Request, Response } from "express";
import { registerUser, loginUser } from "../services/authService.js";

/**
 * POST /api/auth/register
 * Delegates all business logic to authService.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  const result = await registerUser(name, email, password);

  res.status(201).json(result);
};

/**
 * POST /api/auth/login
 * Delegates all business logic to authService.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  const result = await loginUser(email, password);

  res.status(200).json(result);
};
