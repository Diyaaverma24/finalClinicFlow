import { useEffect, useState } from "react";
import { Stethoscope, Calendar, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/doctors")
      .then((res) => setDoctors(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clinic Directory</h1>
        <p className="text-muted mt-1 text-sm">View our specialized medical staff.</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 h-48 animate-pulse flex flex-col justify-between">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-surfaceHover rounded-xl" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-surfaceHover rounded w-3/4" />
                  <div className="h-3 bg-surfaceHover rounded w-1/2" />
                </div>
              </div>
              <div className="h-8 bg-surfaceHover rounded-lg w-full mt-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((d, i) => (
            <motion.div 
              key={d.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-surface border border-border rounded-2xl p-6 hover:shadow-surface transition-all flex flex-col"
            >
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 border border-brand-500/20">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Dr. {d.name}</h3>
                  <div className="text-sm font-medium text-brand-500 mt-0.5">{d.specialization}</div>
                </div>
              </div>
              
              <div className="mt-6 flex-1 bg-background rounded-xl p-4 border border-border/50 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Days</div>
                  <div className="text-sm font-medium">Mon - Fri</div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1 flex items-center gap-1.5"><Clock className="w-3 h-3"/> Hours</div>
                  <div className="text-sm font-medium">09:00 - 17:00</div>
                </div>
              </div>

              <Link to="/dashboard" className="mt-4 w-full py-2.5 rounded-lg bg-surfaceHover text-sm font-medium text-center hover:bg-surface transition-colors flex items-center justify-center gap-2 text-foreground border border-border">
                View Schedule <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
