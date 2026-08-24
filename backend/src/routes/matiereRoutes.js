import express from "express";
import {
  getMatieres,
  createMatiere,
  updateMatiere,
  deleteMatiere,
} from "../controllers/matiereController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Apply auth + role middleware to all routes in this file
router.use(protect);
router.use(authorize("admin"));

// GET /api/matieres
router.get("/", getMatieres);

// POST /api/matieres
router.post("/", createMatiere);

// PUT /api/matieres/:id
router.put("/:id", updateMatiere);

// DELETE /api/matieres/:id (soft delete)
router.delete("/:id", deleteMatiere);

export default router;
