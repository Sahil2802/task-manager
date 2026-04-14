import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  createTask,
  deleteTask,
  getAllTasks,
} from "../controllers/tasks.controller.js";

const router = express.Router();

router.use(auth);

router.get("/", getAllTasks);
router.post("/", createTask);
router.delete("/:id", deleteTask);

export default router;
