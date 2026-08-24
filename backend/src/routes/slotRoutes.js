import express from "express";
import {
  checkConflict,
  createSlot,
  updateSlot,
  deleteSlot,
  publishWeek,
  getGrid,
  getMySchedule,
} from "../controllers/slotController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(protect);

// POST /api/slots/check-conflict (vérification à la volée)
router.post(
  "/check-conflict",
  authorize("admin"),
  checkConflict
);

// PATCH /api/slots/publish-week (publication globale d'une semaine)
router.patch("/publish-week", authorize("admin"), publishWeek);

// GET /api/slots/me (planning personnel de l'enseignant)
router.get("/me", authorize("enseignant"), getMySchedule);

// GET /api/slots?groupId=&weekNumber=&year=
// admin : grille complète | étudiant : son groupe, publiés uniquement
router.get("/", authorize("admin", "etudiant"), getGrid);

// POST /api/slots
router.post("/", authorize("admin"), createSlot);

// PUT /api/slots/:id
router.put("/:id", authorize("admin"), updateSlot);

// DELETE /api/slots/:id
router.delete("/:id", authorize("admin"), deleteSlot);

export default router;
