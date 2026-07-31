import { Router } from "express";
import { adminOnly } from "../middleware/admin.js";
import { listUsers, getUser, createUser, updateUser, deleteUser } from "../services/users.js";

const router = Router();

// All routes are admin-only
router.use(adminOnly);

// List all users
router.get("/", async (_req, res) => {
  const users = await listUsers();
  res.json(users);
});

// Get single user
router.get("/:id", async (req, res) => {
  const user = await getUser(Number(req.params.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

// Create user
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      res.status(400).json({ error: "name, email, password, and role are required" });
      return;
    }
    if (!["admin", "editor"].includes(role)) {
      res.status(400).json({ error: "role must be 'admin' or 'editor'" });
      return;
    }
    const user = await createUser(name, email, password, role);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(409).json({ error: err.message });
  }
});

// Update user
router.patch("/:id", async (req, res) => {
  try {
    const user = await updateUser(Number(req.params.id), req.body);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user — cannot delete yourself
router.delete("/:id", async (req, res) => {
  const targetId = Number(req.params.id);
  if (targetId === req.user!.userId) {
    res.status(403).json({ error: "You cannot delete your own account" });
    return;
  }
  const deleted = await deleteUser(targetId);
  if (!deleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ message: "User deleted" });
});

export default router;
