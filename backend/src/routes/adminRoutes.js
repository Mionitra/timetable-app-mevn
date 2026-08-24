import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

import {
  getEnseignants, createEnseignant, updateEnseignant, deleteEnseignant,
} from "../controllers/enseignantController.js";

import {
  getSalles, createSalle, updateSalle, deleteSalle,
  getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear,
  getSemestres, createSemestre, updateSemestre, deleteSemestre,
  getMatieres, createMatiere, updateMatiere, deleteMatiere,
  getCours, createCours, updateCours, deleteCours,
} from "../controllers/adminController.js";

const router = express.Router();

// Toutes les routes admin sont protégées et réservées au rôle "admin"
router.use(protect, authorize("admin"));

/* ── Enseignants ─────────────────────────────────────────── */
router.get("/enseignants", getEnseignants);
router.post("/enseignants", createEnseignant);
router.put("/enseignants/:id", updateEnseignant);
router.delete("/enseignants/:id", deleteEnseignant);

/* ── Salles ──────────────────────────────────────────────── */
router.get("/salles", getSalles);
router.post("/salles", createSalle);
router.put("/salles/:id", updateSalle);
router.delete("/salles/:id", deleteSalle);

/* ── Années académiques ──────────────────────────────────── */
router.get("/academic-years", getAcademicYears);
router.post("/academic-years", createAcademicYear);
router.put("/academic-years/:id", updateAcademicYear);
router.delete("/academic-years/:id", deleteAcademicYear);

/* ── Semestres ───────────────────────────────────────────── */
router.get("/semestres", getSemestres);
router.post("/semestres", createSemestre);
router.put("/semestres/:id", updateSemestre);
router.delete("/semestres/:id", deleteSemestre);

/* ── Matières ────────────────────────────────────────────── */
router.get("/matieres", getMatieres);
router.post("/matieres", createMatiere);
router.put("/matieres/:id", updateMatiere);
router.delete("/matieres/:id", deleteMatiere);

/* ── Cours (EDT) ─────────────────────────────────────────── */
router.get("/cours", getCours);
router.post("/cours", createCours);
router.put("/cours/:id", updateCours);
router.delete("/cours/:id", deleteCours);

export default router;