import express from "express";
import {
  getDashboard,
  getSchedule,
  getSubjects,
  getProfile,
  updateProfile,
} from "../controllers/studentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Apply auth + role middleware to all routes in this file
router.use(protect);
router.use(authorize("etudiant"));

// GET /api/student/dashboard
router.get("/dashboard", getDashboard);

// GET /api/student/schedule
router.get("/schedule", getSchedule);

// GET /api/student/subjects
router.get("/subjects", getSubjects);

// GET /api/student/profile
router.get("/profile", getProfile);

// PUT /api/student/profile
router.put("/profile", updateProfile);

export default router;
