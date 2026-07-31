import { Router } from "express";
import { register, login, refresh, me } from "../services/auth.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "name, email, and password are required" });
      return;
    }
    const data = await register(name, email, password);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(409).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }
    const data = await login(email, password);
    res.json(data);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: "refreshToken is required" });
      return;
    }
    const data = await refresh(refreshToken);
    res.json(data);
  } catch (err: any) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  const user = await me(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

export default router;
