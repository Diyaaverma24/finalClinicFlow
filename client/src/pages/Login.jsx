import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";

export default function Login() {
  const [email, setEmail] = useState("demo@clinicflow.com");
  const [password, setPassword] = useState("Demo@123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.data.token);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Login failed.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground overflow-hidden">
      {/* Left side: Branded Panel */}
      <div className="hidden lg:flex w-1/2 bg-surface/50 border-r border-border relative flex-col justify-between p-12 overflow-hidden">
        {/* Abstract background gradient */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10">
          <Link to="/" className="font-bold text-2xl tracking-tight flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            ClinicFlow
          </Link>
          
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Your clinic's schedule,<br />without the chaos.
          </h1>
          <p className="text-muted text-lg max-w-md leading-relaxed">
            Manage appointments, detect conflicts automatically, and automate your front desk operations seamlessly.
          </p>
        </div>

        {/* Abstract Timeline */}
        <div className="relative z-10 w-full max-w-sm mt-12 border-l border-border/50 pl-6 py-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -left-[29px] top-1.5 w-2 h-2 rounded-full bg-border" />
            <div className="text-xs font-mono text-muted mb-1">09:00 AM</div>
            <div className="bg-surface border border-border p-3 rounded-lg shadow-sm">
              <div className="text-sm font-medium">Consultation</div>
              <div className="text-xs text-muted">Dr. Sharma · Rahul Mehta</div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="absolute -left-[29px] top-1.5 w-2 h-2 rounded-full bg-brand-500 shadow-glow" />
            <div className="text-xs font-mono text-brand-300 mb-1">10:00 AM</div>
            <div className="bg-brand-500/10 border border-brand-500/30 p-3 rounded-lg backdrop-blur-sm">
              <div className="text-sm font-medium text-brand-50">Follow-up</div>
              <div className="text-xs text-brand-200/70">Dr. Kapoor · Ananya Singh</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <Link to="/" className="lg:hidden absolute top-8 left-8 font-bold text-xl flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          ClinicFlow
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
            <p className="text-muted">Enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="bg-error-bg text-error text-sm p-3 rounded-lg border border-error/20"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted">Email address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-foreground" 
                required 
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-muted">Password</label>
                <a href="#" className="text-xs text-brand-500 hover:text-brand-400 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-surface border border-border rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-foreground" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              disabled={loading || success} 
              className="w-full bg-foreground text-background font-medium py-2.5 rounded-lg hover:bg-muted transition-colors shadow-sm disabled:opacity-50 relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div key="success" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-center gap-2 text-brand-600">
                    <CheckCircle2 className="w-5 h-5" /> Signed in
                  </motion.div>
                ) : loading ? (
                  <motion.div key="loading" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    Signing in...
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    Sign in
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <p className="text-sm text-center text-muted pt-4">
              Don't have an account? <Link to="/register" className="text-brand-500 hover:text-brand-400 transition-colors font-medium">Create account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
