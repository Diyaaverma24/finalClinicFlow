import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api.js";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-center">Create your ClinicFlow account</h1>
        {error && <div className="bg-red-50 text-red-700 text-sm p-2 rounded-md">{error}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" required minLength={6} />
        </div>
        <button disabled={loading} className="w-full bg-brand-600 text-white py-2 rounded-md hover:bg-brand-700 disabled:opacity-50">
          {loading ? "Creating..." : "Register"}
        </button>
        <p className="text-xs text-center text-slate-500">Already have an account? <Link to="/login" className="text-brand-600">Log in</Link></p>
      </form>
    </div>
  );
}
