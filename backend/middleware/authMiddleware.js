import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const COOKIE_NAME = "ims_token";

export const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies?.[COOKIE_NAME];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured.");
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token."
            });
        }

        const userId = decoded.sub;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
        }

        const [users] = await pool.query(
            `SELECT id, name, email, role, status
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "User account no longer exists."
            });
        }

        const user = users[0];

        if (user.status !== "Active") {
            return res.status(401).json({
                success: false,
                message: "User account is not active."
            });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        next(error);
    }
};