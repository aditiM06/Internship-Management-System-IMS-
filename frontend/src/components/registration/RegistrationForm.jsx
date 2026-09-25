
import { useEffect, useState } from "react";
import "./RegistrationForm.css";

const API_BASE_URL = "http://localhost:5000/api";

const initialFormData = {
    name: "",
    email: "",
    whatsapp_number: "",
    college_id: "",
    other_college_name: "",
    course: "",
    branch: "",
    current_year: "",
    passout_year: "",
    preferred_department_1_id: "",
    preferred_department_2_id: ""
};

const RegistrationForm = () => {
    const [formData, setFormData] = useState(initialFormData);

    const [colleges, setColleges] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchFormOptions = async () => {
            try {
                setLoadingOptions(true);
                setError("");

                const [collegesResponse, departmentsResponse] =
                    await Promise.all([
                        fetch(`${API_BASE_URL}/colleges`),
                        fetch(`${API_BASE_URL}/departments`)
                    ]);

                if (
                    !collegesResponse.ok ||
                    !departmentsResponse.ok
                ) {
                    throw new Error(
                        "Failed to fetch colleges or departments."
                    );
                }

                const collegesResult = await collegesResponse.json();
                const departmentsResult = await departmentsResponse.json();

                if (
                    !collegesResult.success ||
                    !departmentsResult.success
                ) {
                    throw new Error(
                        "Unable to load college or department data."
                    );
                }

                setColleges(collegesResult.data);
                setDepartments(departmentsResult.data);
            } catch (error) {
                console.error("Error fetching form options:", error);

                setError(
                    "Unable to load colleges and departments. Please try again."
                );
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchFormOptions();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "whatsapp_number") {
            const onlyDigits = value.replace(/\D/g, "");

            if (onlyDigits.length <= 10) {
                setFormData((previousData) => ({
                    ...previousData,
                    [name]: onlyDigits
                }));
            }

            return;
        }

        if (name === "passout_year") {
            const onlyDigits = value.replace(/\D/g, "");

            if (onlyDigits.length <= 4) {
                setFormData((previousData) => ({
                    ...previousData,
                    [name]: onlyDigits
                }));
            }

            return;
        }

        if (name === "college_id") {
            setFormData((previousData) => ({
                ...previousData,
                college_id: value,
                other_college_name: ""
            }));

            return;
        }

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

   const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (formData.whatsapp_number.length !== 10) {
        setError("WhatsApp number must contain exactly 10 digits.");
        return;
    }

    if (formData.passout_year.length !== 4) {
        setError("Passout year must contain exactly 4 digits.");
        return;
    }

    if (
        formData.college_id === "other" &&
        formData.other_college_name.trim() === ""
    ) {
        setError("Please enter your college name.");
        return;
    }

    if (
        formData.college_id !== "other" &&
        formData.other_college_name.trim() !== ""
    ) {
        setError(
            "Other college name should only be entered when Other is selected."
        );
        return;
    }

    if (
        formData.preferred_department_1_id ===
        formData.preferred_department_2_id
    ) {
        setError("Please select two different department preferences.");
        return;
    }

    try {
        setIsSubmitting(true);

        const response = await fetch(
            `${API_BASE_URL}/candidates`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Registration failed."
            );
        }

        setSuccessMessage(
            "Registration submitted successfully! The coordinator will contact you regarding the next steps."
        );

        setFormData(initialFormData);

    } catch (error) {
        console.error("Registration error:", error);

        setError(
            error.message ||
            "Unable to register. Please try again."
        );

    } finally {
        setIsSubmitting(false);
    }
};

    return (
        <section className="registration-container">
            <div className="registration-card">
                <h1>Internship Registration</h1>

                <p className="registration-description">
                    Fill in your details to register for the internship interview.
                </p>

               {error && (
                   <p className="form-error">
                        {error}
                    </p>
                )}

                {successMessage && (
                    <p className="form-success">
                        {successMessage}
                    </p>
                )}

                {loadingOptions ? (
                    <p>Loading colleges and departments...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div className="form-section">
                            <h2>Personal Information</h2>

                            <div className="form-group">
                                <label htmlFor="name">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="whatsapp_number">
                                    WhatsApp Number
                                </label>

                                <input
                                    type="tel"
                                    id="whatsapp_number"
                                    name="whatsapp_number"
                                    value={formData.whatsapp_number}
                                    onChange={handleChange}
                                    placeholder="Enter your 10-digit WhatsApp number"
                                    inputMode="numeric"
                                    maxLength={10}
                                    required
                                />
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div className="form-section">
                            <h2>Academic Information</h2>

                            <div className="form-group">
                                <label htmlFor="course">
                                    Course
                                </label>

                                <input
                                    type="text"
                                    id="course"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    placeholder="Example: B.Tech"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="branch">
                                    Branch
                                </label>

                                <input
                                    type="text"
                                    id="branch"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    placeholder="Example: Computer Science"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="current_year">
                                    Current Year
                                </label>

                                <select
                                    id="current_year"
                                    name="current_year"
                                    value={formData.current_year}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select current year
                                    </option>

                                    <option value="1">First Year</option>
                                    <option value="2">Second Year</option>
                                    <option value="3">Third Year</option>
                                    <option value="4">Fourth Year</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="passout_year">
                                    Expected Passout Year
                                </label>

                                <input
                                    type="text"
                                    id="passout_year"
                                    name="passout_year"
                                    value={formData.passout_year}
                                    onChange={handleChange}
                                    placeholder="Example: 2027"
                                    inputMode="numeric"
                                    maxLength={4}
                                    pattern="[0-9]{4}"
                                    required
                                />
                            </div>
                        </div>

                        {/* College Information */}
                        <div className="form-section">
                            <h2>College Information</h2>

                            <div className="form-group">
                                <label htmlFor="college_id">
                                    College
                                </label>

                                <select
                                    id="college_id"
                                    name="college_id"
                                    value={formData.college_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select your college
                                    </option>

                                    {colleges.map((college) => (
                                        <option
                                            key={college.id}
                                            value={college.id}
                                        >
                                            {college.college_name}
                                        </option>
                                    ))}

                                    <option value="other">
                                        Other
                                    </option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="other_college_name">
                                    Other College Name
                                </label>

                                <input
                                    type="text"
                                    id="other_college_name"
                                    name="other_college_name"
                                    value={formData.other_college_name}
                                    onChange={handleChange}
                                    placeholder="Enter your college name if not listed"
                                    disabled={formData.college_id !== "other"}
                                />
                            </div>
                        </div>

                        {/* Department Preferences */}
                        <div className="form-section">
                            <h2>Department Preferences</h2>

                            <div className="form-group">
                                <label htmlFor="preferred_department_1_id">
                                    First Preference
                                </label>

                                <select
                                    id="preferred_department_1_id"
                                    name="preferred_department_1_id"
                                    value={formData.preferred_department_1_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select first preference
                                    </option>

                                    {departments.map((department) => (
                                        <option
                                            key={department.id}
                                            value={department.id}
                                        >
                                            {department.department_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="preferred_department_2_id">
                                    Second Preference
                                </label>

                                <select
                                    id="preferred_department_2_id"
                                    name="preferred_department_2_id"
                                    value={formData.preferred_department_2_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select second preference
                                    </option>

                                    {departments.map((department) => (
                                        <option
                                            key={department.id}
                                            value={department.id}
                                        >
                                            {department.department_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Registering..." : "Register"}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
};

export default RegistrationForm;