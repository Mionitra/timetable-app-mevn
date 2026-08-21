import express from "express";
import cors from "cors";

import "./Models/index.js";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import alerteRoutes from "./routes/alerteRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(cors());

app.use(express.json({ limit: "50mb" }));

app.use(
    express.urlencoded({
        limit: "50mb",
        extended: true,
    })
);

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/alertes", alerteRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API Timetable opérationnelle",
    });
});

// Export app
export default app;