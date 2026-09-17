import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2, AlertCircle, CalendarClock, Zap } from "lucide-react";
import api from "../services/api.js";

// Helper for status colors
const statusColors = {
  SCHEDULED: "bg-brand-500/10 text-brand-500 border-brand-500/20",
  COMPLETED: "bg-success-bg text-success text-success border-success/20",
  CANCELLED: "bg-surfaceHover text-muted border-border",
  NO_SHOW: "bg-error-bg text-error border-error/20",
};

export default function Dashboard() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    api.get("/doctors").then((res) => {
      setDoctors(res.data.data);
      if (res.data.data.length) setSelectedDoctorId(res.data.data[0].id);
    });
  }, []);

  // Fetch appointments when doctor/date changes
  useEffect(() => {
    if (!selectedDoctorId) return;
    setLoading(true);
    api.get(`/doctors/${selectedDoctorId}/appointments`, { params: { date } })
      .then((res) => setAppointments(res.data.data))
      .finally(() => setLoading(false));
  }, [selectedDoctorId, date]);

  // Derived stats
  const scheduledCount = appointments.filter((a) => a.status === "SCHEDULED").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;
  const noShowCount = appointments.filter((a) => a.status === "NO_SHOW").length;
  const totalCount = appointments.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good morning</h1>
          <p className="text-muted mt-1 text-sm">Here's what's happening across your clinic today.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1">
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent border-none text-sm font-medium focus:ring-0 text-foreground cursor-pointer outline-none px-2 py-1"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's appointments", value: totalCount, icon: Calendar, color: "text-foreground" },
          { label: "Upcoming", value: scheduledCount, icon: Clock, color: "text-brand-500" },
          { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-success" },
          { label: "No-shows", value: noShowCount, icon: AlertCircle, color: "text-error" },
        ].map((kpi, i) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-surface border border-border rounded-2xl p-5 hover:-translate-y-1 transition-transform"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-3xl font-bold">{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left: Schedule Timeline (~65%) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-brand-500" /> Today's Schedule
            </h2>
            <select 
              value={selectedDoctorId} 
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="bg-surface border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-brand-500"
            >
              {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
            </select>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 min-h-[400px]">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-4 bg-surfaceHover rounded" />
                    <div className="flex-1 h-20 bg-surfaceHover rounded-xl" />
                  </div>
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-12 h-12 rounded-full bg-surfaceHover flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-muted" />
                </div>
                <h3 className="font-medium">Schedule is clear</h3>
                <p className="text-sm text-muted">No appointments match your current filters.</p>
              </div>
            ) : (
              <div className="relative border-l border-border/50 ml-4 space-y-6 pb-4">
                {appointments.map((apt, i) => {
                  const startTime = new Date(apt.startTime);
                  const endTime = new Date(apt.endTime);
                  const statusStyle = statusColors[apt.status] || statusColors.SCHEDULED;
                  
                  return (
                    <motion.div 
                      key={apt.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="relative pl-6"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-background ${apt.status === 'SCHEDULED' ? 'bg-brand-500 shadow-glow' : 'bg-border'}`} />
                      
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="font-mono text-xs text-muted w-24 shrink-0 pt-1">
                          {format(startTime, "hh:mm a")}
                          <div className="text-[10px] text-muted/50 mt-0.5">{format(endTime, "hh:mm a")}</div>
                        </div>
                        
                        <div className={`flex-1 border rounded-xl p-4 flex justify-between items-start transition-colors hover:border-border ${apt.status === 'SCHEDULED' ? 'bg-background hover:bg-surfaceHover/50' : 'bg-surface/50 opacity-80'}`}>
                          <div>
                            <div className="font-medium">{apt.patient?.name}</div>
                            <div className="text-sm text-muted mt-1">Consultation · {apt.durationInMinutes} min</div>
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${statusStyle}`}>
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Operations & Automation (~35%) */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" /> Clinic Automation
            </h2>
            <div className="space-y-3">
              <div className="bg-surface border border-border rounded-xl p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">Morning reminders</div>
                  <div className="text-xs text-muted">Active</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
              </div>
              
              <div className="bg-surface border border-border rounded-xl p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">No-show detection</div>
                  <div className="text-xs text-muted">Active</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
              </div>

              <div className="bg-surface border border-border rounded-xl p-4">
                <div className="font-medium text-sm">Clock status</div>
                <div className="text-xs text-muted mt-1 flex justify-between items-center">
                  <span>Connected</span>
                  <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border">10:31 AM</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-muted">Quick Actions</h2>
            <div className="grid gap-2">
              <button className="bg-surfaceHover text-sm font-medium py-2.5 rounded-lg border border-border hover:border-brand-500/50 transition-colors text-left px-4">
                View pending actions
              </button>
              <button className="bg-surfaceHover text-sm font-medium py-2.5 rounded-lg border border-border hover:border-brand-500/50 transition-colors text-left px-4">
                Check reminder activity
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
