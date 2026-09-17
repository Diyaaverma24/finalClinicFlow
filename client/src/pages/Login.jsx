import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api.js";

export default function Login() {
  const [email, setEmail] = useState("demo@clinicflow.com");
  const [password, setPassword] = useState("Demo@123");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-center">Log in to ClinicFlow</h1>
        {error && <div className="bg-red-50 text-red-700 text-sm p-2 rounded-md">{error}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" required />
        </div>
        <button disabled={loading} className="w-full bg-brand-600 text-white py-2 rounded-md hover:bg-brand-700 disabled:opacity-50">
          {loading ? "Logging in..." : "Log in"}
        </button>
        <p className="text-xs text-center text-slate-500">Demo login is pre-filled. Don't have an account? <Link to="/register" className="text-brand-600">Register</Link></p>
      </form>
    </div>
  );
}
