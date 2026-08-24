import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import salleRoutes from "./routes/salleRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import matiereRoutes from "./routes/matiereRoutes.js";
import indisponibiliteRoutes from "./routes/indisponibiliteRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/salles", salleRoutes);
app.use("/api/groupes", groupRoutes);
app.use("/api/matieres", matiereRoutes);
app.use("/api/indisponibilites", indisponibiliteRoutes);
app.use("/api/slots", slotRoutes);

// Export app
export default app;
