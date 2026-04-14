import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { AuthPayload } from "../types/express.js";

const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized Access" });
  } else {
    try {
      const jwtToken = jwt.verify(token, process.env.JWT_SECRET!);
      if (typeof jwtToken === "string") {
        return res.status(401).json({ message: "unauthorized" });
      }
      req.user = jwtToken as AuthPayload;
    } catch {
      return res.status(401).json({ message: "Unauthorized Access" });
    }
  }
  next();
};

export default auth;
