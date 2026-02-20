import { Router } from "express";
import { authRouter } from "./authRoutes.js";

export const router = Router();

router.use("/auth", authRouter);

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
