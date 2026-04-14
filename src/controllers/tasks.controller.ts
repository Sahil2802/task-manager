import { supabase } from "../lib/supabase.js";
import type { Request, Response } from "express";

const getAllTasks = async (req: Request, res: Response) => {
  // get authenticated user's id
  const { id } = req.user;

  const { data, error } = await supabase
    .from("tasks")
    .select()
    .eq("user_id", id);

  if (error) {
    return res.status(500).json({ message: "Error fetching tasks" });
  } else {
    return res.status(200).json({ tasks: data, message: "All tasks fetched" });
  }
};

// controller to create the task. Insert the task with user_id(in req.body) in the tasks table
const createTask = async (req: Request, res: Response) => {
  // get authenticated user's id
  const { id } = req.user;
  const { title, due_date } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title cannot be empty" });
  }

  const { error } = await supabase
    .from("tasks")
    .insert({ title: title, due_date: due_date, user_id: id });

  if (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  } else {
    return res.status(201).json({ message: "Task created" });
  }
};

const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id: user_id } = req.user;

  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .select()
    .eq("id", id)
    .eq("user_id", user_id);

  if (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
  if (data?.length === 0) {
    return res.status(404).json({ message: "Task not found" });
  } else {
    return res.status(200).json({ message: "Task deleted successfully" });
  }
};

const updateTask = async (req: Request, res: Response) => {
  const { id: user_id } = req.user;
  const { title } = req.body;
  const { id } = req.params;

  if (!title) {
    return res.status(400).json({ message: "Task title cannot be empty" });
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({ title: title })
    .select()
    .eq("id", id)
    .eq("user_id", user_id);

  if (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
  if (data?.length === 0) {
    return res.status(404).json({ message: "Task not found" });
  } else {
    return res.status(200).json({ message: "Task successfully updated" });
  }
};

export { getAllTasks, createTask, deleteTask, updateTask };
