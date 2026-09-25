
import pool from "../config/db.js";

export const getDepartments = async (req, res) => {
    try {
        const query = `
            SELECT
                id,
                department_name
            FROM departments
            WHERE is_active = TRUE
            ORDER BY department_name ASC
        `;

        const [departments] = await pool.execute(query);

        res.status(200).json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error("Error fetching departments:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch departments"
        });
    }
};