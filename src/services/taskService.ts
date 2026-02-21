import { Task } from "../models/Task.js";
import { AppError } from "../utils/AppError.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskQuery,
} from "../validators/taskSchemas.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validate<T>(
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: { issues: { message: string }[] } } },
  data: unknown,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Invalid input";
    throw new AppError(message, 400);
  }
  return result.data;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Creates a new task scoped to the authenticated user.
 */
export const createTask = async (userId: string, body: unknown) => {
  const input = validate<CreateTaskInput>(createTaskSchema, body);
  const task = await Task.create({
    title: input.title,
    description: input.description ?? null,
    status: input.status,
    dueDate: input.dueDate ?? null,
    userId,
  });
  return task;
};

/**
 * Returns a paginated, filtered, and sorted list of tasks for the user.
 */
export const getUserTasks = async (userId: string, rawQuery: unknown) => {
  const { status, page, limit, sortBy, order } = validate<TaskQuery>(
    taskQuerySchema,
    rawQuery,
  );

  const filter: Record<string, unknown> = { userId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const sortOrder = order === "asc" ? 1 : -1;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Returns a single task by ID. Throws 404 if not found or 403 if not the owner.
 */
export const getTaskById = async (userId: string, taskId: string) => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError("Task not found", 404);
  if (task.userId.toString() !== userId) throw new AppError("Forbidden", 403);
  return task;
};

/**
 * Updates a task. Only the owner can update.
 */
export const updateTask = async (
  userId: string,
  taskId: string,
  body: unknown,
) => {
  const input = validate<UpdateTaskInput>(updateTaskSchema, body);

  const task = await Task.findById(taskId);
  if (!task) throw new AppError("Task not found", 404);
  if (task.userId.toString() !== userId) throw new AppError("Forbidden", 403);

  Object.assign(task, input);
  await task.save();
  return task;
};

/**
 * Deletes a task. Only the owner can delete.
 */
export const deleteTask = async (userId: string, taskId: string) => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError("Task not found", 404);
  if (task.userId.toString() !== userId) throw new AppError("Forbidden", 403);

  await task.deleteOne();
};
