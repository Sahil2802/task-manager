import { z } from "zod";

//  Create Task Schema

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be 200 characters or fewer"),

  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional(),

  status: z
    .enum(["pending", "in-progress", "done"])
    .default("pending"),

  dueDate: z
    .string()
    .datetime({ message: "Invalid ISO 8601 date format" })
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

//  Update Task Schema

// All fields are optional on update
export const updateTaskSchema = createTaskSchema.partial();

//  Query Schema (filtering + pagination)

export const taskQuerySchema = z.object({
  status: z.enum(["pending", "in-progress", "done"]).optional(),
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "dueDate", "title"]).default("createdAt"),
  order:  z.enum(["asc", "desc"]).default("desc"),
});

//  Inferred Types

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
