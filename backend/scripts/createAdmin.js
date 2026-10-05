import readline from "readline";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (question) =>
    new Promise((resolve) => {
        rl.question(question, resolve);
    });

const askHidden = (question) =>
    new Promise((resolve) => {
        process.stdout.write(question);

        const stdin = process.stdin;
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf8");

        let password = "";

        const onData = (char) => {
            if (char === "\r" || char === "\n") {
                stdin.setRawMode(false);
                stdin.pause();
                stdin.removeListener("data", onData);
                process.stdout.write("\n");
                resolve(password);
            } else if (char === "\u0003") {
                // Ctrl + C
                stdin.setRawMode(false);
                stdin.pause();
                stdin.removeListener("data", onData);
                process.stdout.write("\n");
                process.exit(0);
            } else if (char === "\u007f") {
                // Backspace
                if (password.length > 0) {
                    password = password.slice(0, -1);
                }
            } else {
                password += char;
            }
        };

        stdin.on("data", onData);
    });

const createAdmin = async () => {
    try {
        console.log("\n=== IMS Initial Admin Setup ===\n");

        const name = (await ask("Admin name: ")).trim();
        const email = (await ask("Admin email: ")).trim().toLowerCase();
        const password = await askHidden("Admin password: ");
        const confirmPassword = await askHidden("Confirm password: ");

        if (!name || !email || !password) {
            throw new Error("Name, email, and password are required.");
        }

        if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }

        if (password.length < 8) {
            throw new Error("Password must be at least 8 characters long.");
        }

        // Check whether this email already exists
        const [existingUsers] = await pool.query(
            "SELECT id, role, status FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (existingUsers.length > 0) {
            throw new Error(
                `A user with ${email} already exists.`
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create active Admin
        const [result] = await pool.query(
            `INSERT INTO users
                (name, email, password_hash, role, status)
             VALUES (?, ?, ?, 'Admin', 'Active')`,
            [name, email, passwordHash]
        );

        console.log("\nAdmin created successfully.");
        console.log(`Admin ID: ${result.insertId}`);
        console.log(`Email: ${email}`);
        console.log("Role: Admin");
        console.log("Status: Active\n");

    } catch (error) {
        console.error("\nAdmin creation failed:");
        console.error(error.message);
    } finally {
        rl.close();
        await pool.end();
    }
};

createAdmin();