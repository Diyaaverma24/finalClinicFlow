import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Password strength
  const [strength, setStrength] = useState("Weak");
  
  useEffect(() => {
    if (!password) {
      setStrength("Weak");
      return;
    }
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 2) setStrength("Weak");
    else if (score < 4) setStrength("Fair");
    else setStrength("Strong");
  }, [password]);

  const getStrengthColor = () => {
    if (strength === "Weak") return "bg-error text-error-text";
    if (strength === "Fair") return "bg-yellow-500 text-yellow-500";
    if (strength === "Strong") return "bg-success text-success-text";
    return "bg-border";
  };

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.data.token);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Registration failed.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground overflow-hidden">
      {/* Left side: Branded Panel */}
      <div className="hidden lg:flex w-1/2 bg-surface/50 border-r border-border relative flex-col justify-between p-12 overflow-hidden">
        {/* Abstract background gradient */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]" />
        
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
            Join ClinicFlow to streamline your front desk operations and completely eliminate double bookings.
          </p>
        </div>

        {/* Abstract Timeline motif */}
        <div className="relative z-10 w-full max-w-sm mt-12 border-l border-border/50 pl-6 py-4 space-y-6 opacity-70">
          <div className="relative">
            <div className="absolute -left-[29px] top-1.5 w-2 h-2 rounded-full bg-border" />
            <div className="text-xs font-mono text-muted mb-1">09:00 AM</div>
            <div className="bg-surface border border-border p-3 rounded-lg shadow-sm">
              <div className="text-sm font-medium">Consultation</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-[29px] top-1.5 w-2 h-2 rounded-full bg-brand-500 shadow-glow" />
            <div className="text-xs font-mono text-brand-300 mb-1">10:00 AM</div>
            <div className="bg-brand-500/10 border border-brand-500/30 p-3 rounded-lg backdrop-blur-sm">
              <div className="text-sm font-medium text-brand-50">Follow-up</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <Link to="/" className="lg:hidden absolute top-8 left-8 font-bold text-xl flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          ClinicFlow
        </Link>

        <div className="w-full max-w-sm py-12">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Create workspace</h2>
            <p className="text-muted">Set up your clinic's operations platform.</p>
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
              <label className="text-sm font-medium text-muted">Full name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-foreground" 
                required 
              />
            </div>

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
              <label className="text-sm font-medium text-muted">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-surface border border-border rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-foreground" 
                  required 
                  minLength={6}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 flex gap-1 h-1">
                    <div className={`flex-1 rounded-full ${strength !== "Weak" || password.length > 0 ? getStrengthColor() : "bg-border"}`} />
                    <div className={`flex-1 rounded-full ${strength === "Fair" || strength === "Strong" ? getStrengthColor() : "bg-border"}`} />
                    <div className={`flex-1 rounded-full ${strength === "Strong" ? getStrengthColor() : "bg-border"}`} />
                  </div>
                  <span className={`text-[10px] font-mono uppercase ${strength === "Weak" ? "text-error" : strength === "Fair" ? "text-yellow-500" : "text-success"}`}>
                    {strength}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted">Confirm password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-foreground" 
                required 
              />
            </div>

            <button 
              disabled={loading || success} 
              className="w-full bg-foreground text-background font-medium py-2.5 rounded-lg hover:bg-muted transition-colors shadow-sm disabled:opacity-50 relative overflow-hidden mt-6"
            >
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div key="success" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-center gap-2 text-brand-600">
                    <CheckCircle2 className="w-5 h-5" /> Workspace created
                  </motion.div>
                ) : loading ? (
                  <motion.div key="loading" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    Creating workspace...
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    Create workspace
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <p className="text-sm text-center text-muted pt-4">
              Already have an account? <Link to="/login" className="text-brand-500 hover:text-brand-400 transition-colors font-medium">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
