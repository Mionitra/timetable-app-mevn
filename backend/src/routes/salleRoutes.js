import express from "express";
import {
  getSalles,
  createSalle,
  updateSalle,
  deleteSalle,
} from "../controllers/salleController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(protect);

// GET /api/salles (lecture ouverte à l'enseignant pour consultation)
router.get("/", authorize("admin", "enseignant"), getSalles);

// POST /api/salles
router.post("/", authorize("admin"), createSalle);

// PUT /api/salles/:id
router.put("/:id", authorize("admin"), updateSalle);

// DELETE /api/salles/:id (soft delete)
router.delete("/:id", authorize("admin"), deleteSalle);

export default router;
