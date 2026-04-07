import { supabase } from "../lib/supabase.js";

const getAllTasks = async (req, res) => {
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

export default getAllTasks;
