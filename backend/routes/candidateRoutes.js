
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";

import {
    createCandidate,
    getCandidates
} from "../controllers/candidateController.js";

const router = express.Router();

// Public: student registration through QR
router.post("/", createCandidate);


// Protected: Coordinator + Admin candidate management
router.get(
    "/",
    authenticate,
    authorize("Admin", "Coordinator"),
    getCandidates
);

export default router;