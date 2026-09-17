import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Activity, CalendarCheck, Search, Bell } from "lucide-react";

const FEATURES = [
  { id: "01", title: "Conflict-free scheduling", desc: "Overlapping appointments are detected before they reach the calendar.", icon: CalendarCheck },
  { id: "02", title: "Smart appointment lifecycle", desc: "Book, reschedule, complete, cancel and automatically detect no-shows.", icon: Activity },
  { id: "03", title: "Patient operations", desc: "Find patients and appointments in seconds.", icon: Search },
  { id: "04", title: "Automated reminders", desc: "Generate morning appointment reminders through the notification outbox.", icon: Bell },
];

const FUTURE = [
  { title: "SMS & Email reminders" },
  { title: "Doctor availability" },
  { title: "Clinic analytics" },
];

// Reusable Top Nav for Public Pages
export function PublicNavbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full absolute top-0 left-0 right-0 z-50">
      <Link to="/" className="font-bold text-lg tracking-tight text-foreground flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center">
          <span className="text-white text-xs">C</span>
        </div>
        ClinicFlow
      </Link>
      <div className="flex gap-4 items-center text-sm font-medium">
        <Link to="/login" className="text-muted hover:text-foreground transition-colors">Sign in</Link>
        <Link to="/register" className="bg-foreground text-background px-4 py-1.5 rounded-full hover:bg-muted transition-colors shadow-sm">
          Open Workspace
        </Link>
      </div>
    </nav>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-brand-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />
      
      <PublicNavbar />

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 max-w-5xl mx-auto flex flex-col items-center text-center mt-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase border border-border rounded-full text-brand-500 mb-6 bg-brand-500/5 backdrop-blur-sm"
        >
          Clinic operations, reimagined
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500"
        >
          Conflict-free scheduling for busy clinics.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-muted max-w-2xl leading-relaxed"
        >
          ClinicFlow keeps appointments, doctors and patients in sync — while automating the operational work your front desk shouldn't have to.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto"
        >
          <Link to="/dashboard" className="bg-brand-500 text-white px-8 py-3 rounded-full hover:bg-brand-600 transition-colors font-medium flex items-center justify-center gap-2 shadow-glow">
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#features" className="border border-border bg-surface/50 backdrop-blur-sm px-8 py-3 rounded-full hover:bg-surfaceHover transition-colors font-medium text-foreground">
            Explore features
          </a>
        </motion.div>

        {/* Abstract Hero Visual */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 w-full max-w-3xl relative h-64 border-t border-border/50"
        >
          {/* Time ruler */}
          <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-border/50 flex flex-col justify-between py-4 text-[10px] font-mono text-muted">
            <span>09:00</span>
            <span>09:30</span>
            <span>10:00</span>
            <span>10:30</span>
          </div>
          
          {/* Timeline cards */}
          <div className="absolute left-16 right-0 top-0 bottom-0 p-4 relative">
            <motion.div 
              initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", delay: 0.7 }}
              className="absolute top-4 left-4 w-64 bg-surface border border-border rounded-lg p-3 shadow-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-muted">09:30</span>
                <span className="text-[10px] uppercase bg-success-bg text-success px-1.5 rounded-full">Booked</span>
              </div>
              <div className="text-sm font-medium">Dr. Sharma</div>
              <div className="text-xs text-muted">Rahul Mehta</div>
            </motion.div>

            <motion.div 
              initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", delay: 0.9 }}
              className="absolute top-[100px] left-8 w-64 bg-brand-500/10 border border-brand-500/30 rounded-lg p-3 shadow-lg backdrop-blur-md"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-brand-300">10:00</span>
                <span className="text-[10px] uppercase bg-brand-900/50 text-brand-300 px-1.5 rounded-full">Resolving...</span>
              </div>
              <div className="text-sm font-medium">Dr. Kapoor</div>
              <div className="text-xs text-muted">Ananya Singh</div>
            </motion.div>
          </div>
        </motion.div>

        <p className="mt-12 text-xs font-mono tracking-widest uppercase text-muted">
          Built for small clinics • private practices • multi-doctor teams
        </p>
      </header>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 border-t border-border">
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div 
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-surface/50 border border-border rounded-2xl p-8 hover:bg-surfaceHover transition-colors relative overflow-hidden"
            >
              <div className="text-brand-500 font-mono text-sm mb-4">{f.id}</div>
              <h3 className="text-xl font-medium text-foreground flex items-center gap-3">
                {f.title}
              </h3>
              <p className="text-muted mt-3 leading-relaxed">
                {f.desc}
              </p>
              <f.icon className="absolute -bottom-6 -right-6 w-32 h-32 text-border group-hover:text-border/80 transition-colors" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface border-y border-border py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">The ClinicFlow Motif</h2>
          </div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Animated connecting line */}
            <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-border">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full bg-brand-500/50 shadow-glow" 
              />
            </div>

            <div className="relative z-10 bg-surface px-4 py-2 text-center flex-1">
              <div className="w-12 h-12 mx-auto bg-background border border-border rounded-full flex items-center justify-center font-mono text-brand-500 mb-4 shadow-sm">01</div>
              <h3 className="font-semibold uppercase tracking-wider text-sm mb-2">Book</h3>
              <p className="text-muted text-sm">Select patient, doctor and time.</p>
            </div>
            
            <div className="relative z-10 bg-surface px-4 py-2 text-center flex-1">
              <div className="w-12 h-12 mx-auto bg-background border border-border rounded-full flex items-center justify-center font-mono text-brand-500 mb-4 shadow-sm">02</div>
              <h3 className="font-semibold uppercase tracking-wider text-sm mb-2">Verify</h3>
              <p className="text-muted text-sm">ClinicFlow checks conflicts automatically.</p>
            </div>
            
            <div className="relative z-10 bg-surface px-4 py-2 text-center flex-1">
              <div className="w-12 h-12 mx-auto bg-background border border-border rounded-full flex items-center justify-center font-mono text-brand-500 mb-4 shadow-sm">03</div>
              <h3 className="font-semibold uppercase tracking-wider text-sm mb-2">Automate</h3>
              <p className="text-muted text-sm">Reminders and no-show processing happen automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What's next */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-bold tracking-tight mb-8">What's next</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FUTURE.map((f, i) => (
            <div key={i} className="border border-border/50 border-dashed rounded-xl p-6 bg-background relative overflow-hidden group">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-4 inline-block bg-surface px-2 py-1 rounded">Coming Next</div>
              <h3 className="font-medium text-foreground">{f.title}</h3>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
