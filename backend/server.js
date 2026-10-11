import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";

import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";

import candidateRoutes from "./routes/candidateRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import collegeRoutes from "./routes/collegeRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/colleges", collegeRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Internship Management System Backend is running!");
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");

        res.json({
            success: true,
            message: "Database connected successfully!",
            data: rows
        });

    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});