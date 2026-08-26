import { Router } from "express";
import { editorOrAdmin } from "../middleware/editorOrAdmin.js";
import {
  getPublicTeam,
  listTeam,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../services/team.js";

const router = Router();

router.get("/", async (req, res) => {
  const department = req.query.department as string | undefined;
  const team = await getPublicTeam(department);
  res.json(team);
});

router.get("/all", editorOrAdmin, async (req, res) => {
  const department = req.query.department as string | undefined;
  const team = await listTeam(department);
  res.json(team);
});

router.get("/:id", editorOrAdmin, async (req, res) => {
  const member = await getTeamMember(Number(req.params.id));
  if (!member) {
    res.status(404).json({ error: "Team member not found" });
    return;
  }
  res.json(member);
});

router.post("/", editorOrAdmin, async (req, res) => {
  try {
    const member = await createTeamMember(req.body);
    res.status(201).json(member);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id", editorOrAdmin, async (req, res) => {
  try {
    const member = await updateTeamMember(Number(req.params.id), req.body);
    if (!member) {
      res.status(404).json({ error: "Team member not found" });
      return;
    }
    res.json(member);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", editorOrAdmin, async (req, res) => {
  const deleted = await deleteTeamMember(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: "Team member not found" });
    return;
  }
  res.json({ message: "Team member deleted" });
});

export default router;
