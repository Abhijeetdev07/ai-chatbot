// Register.jsx — Register form (name + email + password)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RiRobot2Line } from "react-icons/ri";
import { FiUser, FiMail, FiLock, FiUserPlus } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { register } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { saveAuth } = useAuth();

    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const data = await register(form.name, form.email, form.password);
            saveAuth(data.access_token, data.user);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.detail || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                        <RiRobot2Line className="text-white text-3xl" />
                    </div>
                    <h1 className="text-white text-2xl font-bold">Create your account</h1>
                    <p className="text-zinc-500 text-sm mt-1">Start chatting with AI today</p>
                </div>

                {/* Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Error */}
                        {error && (
                            <div className="px-4 py-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="block text-zinc-400 text-sm mb-1.5">Full Name</label>
                            <div className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus-within:border-indigo-500 transition-colors">
                                <FiUser className="text-zinc-500 shrink-0" />
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    required
                                    minLength={2}
                                    className="flex-1 bg-transparent text-zinc-100 text-sm outline-none placeholder-zinc-600"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-zinc-400 text-sm mb-1.5">Email</label>
                            <div className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus-within:border-indigo-500 transition-colors">
                                <FiMail className="text-zinc-500 shrink-0" />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                    className="flex-1 bg-transparent text-zinc-100 text-sm outline-none placeholder-zinc-600"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-zinc-400 text-sm mb-1.5">Password</label>
                            <div className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus-within:border-indigo-500 transition-colors">
                                <FiLock className="text-zinc-500 shrink-0" />
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Min. 6 characters"
                                    required
                                    minLength={6}
                                    className="flex-1 bg-transparent text-zinc-100 text-sm outline-none placeholder-zinc-600"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-95"
                        >
                            {loading
                                ? <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                                : <><FiUserPlus /> Create Account</>
                            }
                        </button>
                    </form>

                    {/* Footer link */}
                    <p className="text-zinc-500 text-sm text-center mt-6">
                        Already have an account?{" "}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
