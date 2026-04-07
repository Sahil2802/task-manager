import express from "express";
import auth from "../middleware/auth.middleware.js";
import getAllTasks from "../controllers/tasks.controller.js";

const router = express.Router();

router.use(auth);

router.get("/", getAllTasks);

export default router;
