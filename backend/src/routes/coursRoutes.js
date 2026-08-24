import express from "express";

import {
  getCours,
  getCoursById,
  createCours,
  updateCours,
  deleteCours,
} from "../controllers/coursController.js";

const router = express.Router();


// GET tous les cours
router.get("/", getCours);

// GET un cours
router.get("/:id", getCoursById);

// POST créer
router.post("/", createCours);

// PUT modifier
router.put("/:id", updateCours);

// DELETE supprimer
router.delete("/:id", deleteCours);


export default router;