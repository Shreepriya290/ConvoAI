import { useState } from "react";
import "./Auth.css";

function Login({ onLogin, switchToSignup }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");
        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Login failed");
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
                <h2>Log in to ConvoAI</h2>
                {error && <p className="authError">{error}</p>}
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
                    onKeyDown={(e) => e.key === "Enter" ? handleLogin() : ""}
                />
                <button onClick={handleLogin}>Log in</button>
                <p className="authSwitch">
                    Don't have an account? <span onClick={switchToSignup}>Sign up</span>
                </p>
            </div>
        </div>
    );
}

export default Login;