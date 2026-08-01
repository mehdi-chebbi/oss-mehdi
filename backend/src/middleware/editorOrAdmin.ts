import type { Request, Response, NextFunction } from "express";
import { authMiddleware } from "./auth.js";

/** Allows both admin and editor roles to pass. */
export function editorOrAdmin(req: Request, res: Response, next: NextFunction) {
  authMiddleware(req, res, () => {
    const role = req.user?.role;
    if (role !== "admin" && role !== "editor") {
      res.status(403).json({ error: "Admin or editor access required" });
      return;
    }
    next();
  });
}
