import express from "express";
import cors from "cors";

import "./Models/AcademicYear.js";
import "./Models/Semester.js";
import "./Models/Group.js";
import "./Models/Salle.js";
import "./Models/Subject.js";
import "./Models/Enrollment.js";
import "./Models/Indisponibilite.js";
import "./Models/Cours.js";
import "./Models/Alerte.js";
import "./Models/User.js";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import alerteRoutes from "./routes/alerteRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/alertes", alerteRoutes);

// Export app
export default app;
