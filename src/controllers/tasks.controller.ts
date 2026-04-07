import { supabase } from "../lib/supabase.js";

const getAllTasks = async (req, res) => {
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
const createTask = async (req, res) => {
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

export { getAllTasks, createTask };
