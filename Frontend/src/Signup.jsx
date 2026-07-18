import { useState } from "react";
import "./Auth.css";
import { API_BASE_URL } from "./config.js";

function Signup({ onLogin, switchToLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSignup = async () => {
        setError("");
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Signup failed");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            onLogin(data.user, data.token);
        } catch (err) {
            console.log(err);
            setError("Something went wrong");
        }
    };

    return (
        <div className="authContainer">
            <div className="authBox">
                <h2>Create your ConvoAI account</h2>
                {error && <p className="authError">{error}</p>}
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" ? handleSignup() : ""}
                />
                <button onClick={handleSignup}>Sign up</button>
                <p className="authSwitch">
                    Already have an account? <span onClick={switchToLogin}>Log in</span>
                </p>
            </div>
        </div>
    );
}

export default Signup;