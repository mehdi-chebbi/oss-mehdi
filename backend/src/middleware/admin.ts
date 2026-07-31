import type { Request, Response, NextFunction } from "express";
import { authMiddleware } from "./auth.js";

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  authMiddleware(req, res, () => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  });
}
