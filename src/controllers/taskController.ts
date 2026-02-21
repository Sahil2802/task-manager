import type { Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import {
  createTask,
  getUserTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../services/taskService.js";

/**
 * POST /api/tasks
 * Create a new task for the authenticated user.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const userId = res.locals.userId as string;
  const task = await createTask(userId, req.body);
  res.status(201).json(task);
};

/**
 * GET /api/tasks
 * List tasks for the authenticated user with filtering and pagination.
 */
export const list = async (req: Request, res: Response): Promise<void> => {
  const userId = res.locals.userId as string;
  const result = await getUserTasks(userId, req.query);
  res.status(200).json(result);
};

/**
 * GET /api/tasks/:id
 * Get a single task by ID.
 */
export const getOne = async (req: Request, res: Response): Promise<void> => {
  const userId = res.locals.userId as string;
  const id = req.params["id"] as string;
  if (!id) throw new AppError("Task ID is required", 400);
  const task = await getTaskById(userId, id);
  res.status(200).json(task);
};

/**
 * PATCH /api/tasks/:id
 * Partially update a task.
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const userId = res.locals.userId as string;
  const id = req.params["id"] as string;
  if (!id) throw new AppError("Task ID is required", 400);
  const task = await updateTask(userId, id, req.body);
  res.status(200).json(task);
};

/**
 * DELETE /api/tasks/:id
 * Delete a task.
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const userId = res.locals.userId as string;
  const id = req.params["id"] as string;
  if (!id) throw new AppError("Task ID is required", 400);
  await deleteTask(userId, id);
  res.status(204).send();
};
