import express from "express";
import {
  getMyIndisponibilites,
  createIndisponibilite,
  deleteIndisponibilite,
} from "../controllers/indisponibiliteController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Apply auth + role middleware to all routes in this file
router.use(protect);
router.use(authorize("enseignant"));

// GET /api/indisponibilites/me
router.get("/me", getMyIndisponibilites);

// POST /api/indisponibilites
router.post("/", createIndisponibilite);

// DELETE /api/indisponibilites/:id
router.delete("/:id", deleteIndisponibilite);

export default router;
