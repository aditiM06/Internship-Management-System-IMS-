
import pool from "../config/db.js";

export const getColleges = async (req, res) => {
    try {
        const query = `
            SELECT
                id,
                college_name
            FROM colleges
            WHERE is_active = TRUE
            ORDER BY college_name ASC
        `;

        const [colleges] = await pool.execute(query);

        res.status(200).json({
            success: true,
            data: colleges
        });
    } catch (error) {
        console.error("Error fetching colleges:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch colleges"
        });
    }
};