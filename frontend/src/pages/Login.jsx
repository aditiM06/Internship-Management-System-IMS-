import { useState } from "react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Login failed.");
                return;
            }

            setMessage(`Welcome, ${data.user.name}.`);
        } catch (error) {
            console.error("Login error:", error);
            setMessage("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <h1>IMS Staff Login</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {message && <p>{message}</p>}
        </main>
    );
};

export default Login;