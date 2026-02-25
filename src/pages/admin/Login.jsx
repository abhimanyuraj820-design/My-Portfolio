import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import API_BASE_URL from "../../config";


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Invalid email format");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.error || "Invalid credentials!");
            } else {
                login(data.user, data.token);
                navigate("/x7k9m2p4q/dashboard");
            }
        } catch (err) {
            setError("An error occurred connecting to the server. Please try again.");
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-primary p-4">
            <div className="bg-tertiary p-6 md:p-8 rounded-2xl shadow-card w-full max-w-[400px]">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
                        <Lock size={32} className="text-green-500" />
                    </div>
                </div>
                <h2 className="text-white text-2xl font-bold mb-2 text-center">Portal Login</h2>
                <p className="text-secondary text-sm text-center mb-6">
                    Enter your credentials to continue
                </p>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black-100 py-4 px-6 rounded-lg text-white outline-none border-none font-medium"
                        autoComplete="email"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black-100 py-4 px-6 pr-12 rounded-lg text-white outline-none border-none font-medium"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 py-4 rounded-lg text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
