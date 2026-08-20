import express from "express";
import { getAlertes, markAsRead, markAllAsRead } from "../controllers/alerteController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAlertes);

router.patch("/read-all", markAllAsRead);

router.patch("/:id/read", markAsRead);

export default router;
