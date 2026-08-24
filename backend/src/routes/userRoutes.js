import express from "express";
import {
  getPendingStudents,
  activateStudent,
  getTeachers,
  createTeacher,
  deactivateTeacher,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Apply auth + role middleware to all routes in this file
router.use(protect);
router.use(authorize("admin"));

// GET /api/users/pending
router.get("/pending", getPendingStudents);

// PATCH /api/users/:id/activate
router.patch("/:id/activate", activateStudent);

// GET /api/users/teachers
router.get("/teachers", getTeachers);

// POST /api/users/teacher
router.post("/teacher", createTeacher);

// PATCH /api/users/:id/deactivate
router.patch("/:id/deactivate", deactivateTeacher);

export default router;
