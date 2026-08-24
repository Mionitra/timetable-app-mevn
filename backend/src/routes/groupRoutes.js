import express from "express";
import {
  getGroupes,
  getPublicGroupes,
  createGroupe,
  updateGroupe,
  deleteGroupe,
} from "../controllers/groupController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// GET /api/groupes/public : liste minimale pour l'inscription
// étudiante (public, aucune donnée sensible)
router.get("/public", getPublicGroupes);

// Apply auth middleware to the remaining routes
router.use(protect);

// GET /api/groupes
router.get("/", authorize("admin", "enseignant"), getGroupes);

// POST /api/groupes
router.post("/", authorize("admin"), createGroupe);

// PUT /api/groupes/:id
router.put("/:id", authorize("admin"), updateGroupe);

// DELETE /api/groupes/:id (soft delete)
router.delete("/:id", authorize("admin"), deleteGroupe);

export default router;
