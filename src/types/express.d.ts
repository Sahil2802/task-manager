import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user: AuthPayload;
    }
  }
}

export interface AuthPayload extends JwtPayload {
  id: string;
}
