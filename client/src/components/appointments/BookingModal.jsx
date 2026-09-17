import { useState, useEffect } from "react";
import { format, addMinutes } from "date-fns";
import { X, Calendar as CalendarIcon, Clock, User, Stethoscope, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";

const DURATIONS = [15, 30, 45, 60];

export default function BookingModal({ onClose, onBooked }) {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  
  const [doctorId, setDoctorId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(30);
  
  const [conflict, setConflict] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Esc to close
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    api.get("/doctors").then(res => {
      setDoctors(res.data.data);
      if (res.data.data.length) setDoctorId(res.data.data[0].id);
    });
    api.get("/patients").then(res => {
      setPatients(res.data.data);
      if (res.data.data.length) setPatientId(res.data.data[0].id);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setConflict(null);
    setError(null);
    setLoading(true);
    
    try {
      const startTime = new Date(`${date}T${time}:00`).toISOString();
      const res = await api.post("/appointments", {
        doctorId,
        patientId,
        startTime,
        durationMinutes: Number(duration),
      });
      onBooked(res.data.data);
    } catch (err) {
      const apiError = err.response?.data?.error;
      if (apiError?.code === "APPOINTMENT_CONFLICT") {
        setConflict({
          doctorName: doctors.find(d => d.id === doctorId)?.name,
          time: `${format(new Date(`${date}T${time}:00`), "hh:mm a")} — ${format(addMinutes(new Date(`${date}T${time}:00`), duration), "hh:mm a")}`
        });
      } else {
        setError(apiError?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Calculate end time for display
  let endDisplay = "";
  try {
    const d = new Date(`${date}T${time}:00`);
    if (!isNaN(d.getTime())) {
      endDisplay = format(addMinutes(d, duration), "hh:mm a");
    }
  } catch(e) {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      
      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-surface overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surfaceHover/50">
          <h2 className="text-lg font-semibold text-foreground">Book appointment</h2>
          <button onClick={onClose} className="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-error-bg text-error text-sm p-3 rounded-lg border border-error/20">
                {error}
              </motion.div>
            )}
            
            {conflict && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-error-bg/50 border border-error/20 rounded-xl p-4 overflow-hidden">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-error">That time is already booked.</h4>
                    <div className="text-sm text-error/80 mt-1 mb-2">
                      Dr. {conflict.doctorName}<br/>
                      {conflict.time}
                    </div>
                    <p className="text-xs text-error/70">Try adjusting the time or choose another doctor.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted flex items-center gap-2"><User className="w-4 h-4"/> Patient</label>
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500">
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted flex items-center gap-2"><Stethoscope className="w-4 h-4"/> Doctor</label>
              <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500">
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted flex items-center gap-2"><CalendarIcon className="w-4 h-4"/> Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted flex items-center gap-2"><Clock className="w-4 h-4"/> Start Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">Duration</label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button 
                  key={d} 
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${duration === d ? 'bg-brand-500/10 border-brand-500 text-brand-500 font-medium' : 'bg-background border-border text-muted hover:border-brand-500/50'}`}
                >
                  {d} min
                </button>
              ))}
            </div>
            {endDisplay && <div className="text-xs text-muted text-right mt-1">Ends at {endDisplay}</div>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm rounded-lg font-medium text-foreground bg-surfaceHover hover:bg-surfaceHover/80 transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-5 py-2 text-sm rounded-lg font-medium bg-foreground text-background hover:bg-muted transition-colors disabled:opacity-50 relative min-w-[140px]"
            >
              {loading ? "Checking availability..." : "Book appointment"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
