
import pool from "../config/db.js";

export const createCandidate = async (req, res) => {
    try {
        const {
            name,
            email,
            whatsapp_number,
            college_id,
            other_college_name,
            course,
            branch,
            current_year,
            passout_year,
            preferred_department_1_id,
            preferred_department_2_id
        } = req.body;

        // Basic required field validation
        if (
            !name ||
            !email ||
            !whatsapp_number ||
            !course ||
            !branch ||
            !current_year ||
            !passout_year ||
            !preferred_department_1_id ||
            !preferred_department_2_id
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be filled."
            });
        }

        // Validate WhatsApp number
        if (!/^\d{10}$/.test(String(whatsapp_number))) {
            return res.status(400).json({
                success: false,
                message: "WhatsApp number must contain exactly 10 digits."
            });
        }

        // Validate current year
        const currentYearNumber = Number(current_year);

        if (
            !Number.isInteger(currentYearNumber) ||
            currentYearNumber < 1 ||
            currentYearNumber > 4
        ) {
            return res.status(400).json({
                success: false,
                message: "Current year must be between 1 and 4."
            });
        }

        // Validate passout year
        if (!/^\d{4}$/.test(String(passout_year))) {
            return res.status(400).json({
                success: false,
                message: "Passout year must contain exactly 4 digits."
            });
        }

        // Validate department preferences
        const department1Id = Number(preferred_department_1_id);
        const department2Id = Number(preferred_department_2_id);

        if (
            !Number.isInteger(department1Id) ||
            !Number.isInteger(department2Id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid department selection."
            });
        }

        if (department1Id === department2Id) {
            return res.status(400).json({
                success: false,
                message: "Please select two different departments."
            });
        }

        // Normalize college information
        let collegeId = null;
        let otherCollegeName = null;

        if (college_id === "other") {
            if (
                !other_college_name ||
                other_college_name.trim() === ""
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter your college name."
                });
            }

            otherCollegeName = other_college_name.trim();
        } else {
            collegeId = Number(college_id);

            if (!Number.isInteger(collegeId) || collegeId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please select a valid college."
                });
            }
        }

        // Verify selected departments exist and are active
        const [departments] = await pool.execute(
            `
            SELECT id
            FROM departments
            WHERE id IN (?, ?)
            AND is_active = TRUE
            `,
            [department1Id, department2Id]
        );

        if (departments.length !== 2) {
            return res.status(400).json({
                success: false,
                message: "One or both selected departments are invalid."
            });
        }

        // Verify college exists when a registered college is selected
        if (collegeId !== null) {
            const [colleges] = await pool.execute(
                `
                SELECT id
                FROM colleges
                WHERE id = ?
                AND is_active = TRUE
                `,
                [collegeId]
            );

            if (colleges.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Selected college is invalid."
                });
            }
        }

        // Insert candidate into database
        const query = `
            INSERT INTO candidates (
                name,
                email,
                whatsapp_number,
                college_id,
                other_college_name,
                course,
                branch,
                current_year,
                passout_year,
                preferred_department_1_id,
                preferred_department_2_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(query, [
            name.trim(),
            email.trim(),
            whatsapp_number,
            collegeId,
            otherCollegeName,
            course.trim(),
            branch.trim(),
            currentYearNumber,
            Number(passout_year),
            department1Id,
            department2Id
        ]);

        return res.status(201).json({
            success: true,
            message: "Candidate registered successfully.",
            candidateId: result.insertId
        });

    } catch (error) {
        console.error("Error creating candidate:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to register candidate."
        });
    }
};


export const getCandidates = async (req, res) => {
    try {
        const query = `
            SELECT
                c.id,
                c.name,
                c.email,
                c.whatsapp_number,
                c.college_id,
                COALESCE(col.college_name, c.other_college_name) AS college_name,
                c.course,
                c.branch,
                c.current_year,
                c.passout_year,
                c.preferred_department_1_id,
                d1.department_name AS preferred_department_1,
                c.preferred_department_2_id,
                d2.department_name AS preferred_department_2,
                c.interview_registered_at,
                c.interview_status,
                c.notes,
                c.created_at,
                c.updated_at
            FROM candidates c
            LEFT JOIN colleges col
                ON c.college_id = col.id
            LEFT JOIN departments d1
                ON c.preferred_department_1_id = d1.id
            LEFT JOIN departments d2
                ON c.preferred_department_2_id = d2.id
            ORDER BY c.created_at DESC
        `;

        const [candidates] = await pool.execute(query);

        return res.status(200).json({
            success: true,
            data: candidates
        });

    } catch (error) {
        console.error("Error fetching candidates:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch candidates."
        });
    }
};