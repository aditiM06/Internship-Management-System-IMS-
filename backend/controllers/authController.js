import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const COOKIE_NAME = "ims_token";
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day

const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE
});

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [users] = await pool.query(
            `SELECT id, name, email, password_hash, role, status
             FROM users
             WHERE email = ?
             LIMIT 1`,
            [normalizedEmail]
        );

        // Deliberately use the same message whether the email exists or not.
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        if (user.status !== "Active") {
            return res.status(403).json({
                success: false,
                message: "This account is not active."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured.");
        }

        const token = jwt.sign(
            {
                sub: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.cookie(COOKIE_NAME, token, getCookieOptions());

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

export const logout = (req, res) => {
    res.clearCookie(COOKIE_NAME, getCookieOptions());

    return res.status(200).json({
        success: true,
        message: "Logout successful."
    });
};