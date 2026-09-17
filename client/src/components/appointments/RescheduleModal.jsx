import { useState, useEffect } from "react";
import { format, addMinutes } from "date-fns";
import { X, Calendar as CalendarIcon, Clock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";

const DURATIONS = [15, 30, 45, 60];

export default function RescheduleModal({ appointment, onClose, onRescheduled }) {
  const [date, setDate] = useState(new Date(appointment.startTime).toISOString().slice(0, 10));
  const [time, setTime] = useState(format(new Date(appointment.startTime), "HH:mm"));
  const [duration, setDuration] = useState(appointment.durationInMinutes);
  
  const [conflict, setConflict] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setConflict(null);
    setError(null);
    setLoading(true);
    
    try {
      const startTime = new Date(`${date}T${time}:00`).toISOString();
      await api.patch(`/appointments/${appointment.id}/reschedule`, {
        newStartTime: startTime,
        durationMinutes: Number(duration),
      });
      setSuccess(true);
      setTimeout(() => {
        onRescheduled();
      }, 1500);
    } catch (err) {
      const apiError = err.response?.data?.error;
      if (apiError?.code === "APPOINTMENT_CONFLICT") {
        setConflict({
          doctorName: appointment.doctor?.name,
          time: `${format(new Date(`${date}T${time}:00`), "hh:mm a")} — ${format(addMinutes(new Date(`${date}T${time}:00`), duration), "hh:mm a")}`
        });
      } else {
        setError(apiError?.message || "Something went wrong.");
      }
      setLoading(false);
    }
  }

  const currentStart = new Date(appointment.startTime);
  const currentEnd = addMinutes(currentStart, appointment.durationInMinutes);
  
  let newStart, newEnd;
  try {
    newStart = new Date(`${date}T${time}:00`);
    newEnd = addMinutes(newStart, duration);
  } catch(e) {}

  const hasChanged = date !== currentStart.toISOString().slice(0,10) || 
                     time !== format(currentStart, "HH:mm") || 
                     duration !== appointment.durationInMinutes;

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
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-surface overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surfaceHover/50">
          <h2 className="text-lg font-semibold text-foreground">Reschedule appointment</h2>
          <button onClick={onClose} className="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State Overlay */}
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 bg-surface flex flex-col items-center justify-center space-y-4"
            >
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}
                className="w-16 h-16 bg-success-bg text-success rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8" />
              </motion.div>
              <h3 className="text-xl font-semibold">Appointment rescheduled</h3>
              <p className="text-muted text-sm">The clinic schedule has been updated.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* READ ONLY details */}
          <div className="flex items-center gap-4 p-4 bg-background border border-border rounded-xl">
            <div className="w-10 h-10 rounded-full bg-surfaceHover flex items-center justify-center text-muted font-medium shrink-0">
              {appointment.patient?.name?.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-foreground">{appointment.patient?.name}</div>
              <div className="text-sm text-muted">with Dr. {appointment.doctor?.name}</div>
            </div>
            <div className="ml-auto text-xs uppercase font-mono tracking-widest text-muted border border-border px-2 py-1 rounded">Read Only</div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Choose a new time</h3>
            
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
                    key={d} type="button" onClick={() => setDuration(d)}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${duration === d ? 'bg-brand-500/10 border-brand-500 text-brand-500 font-medium' : 'bg-background border-border text-muted hover:border-brand-500/50'}`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Comparison */}
          {hasChanged && !conflict && !error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-muted tracking-wider mb-1">Current</div>
                <div className="text-sm font-medium text-muted line-through">{format(currentStart, "hh:mm a")}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-500" />
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-brand-500 tracking-wider mb-1">New</div>
                <div className="text-sm font-medium text-foreground">{format(newStart, "hh:mm a")}</div>
              </div>
            </motion.div>
          )}

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
                    <h4 className="font-semibold text-error">Dr. {conflict.doctorName} is already booked.</h4>
                    <div className="text-sm text-error/80 mt-1 mb-2">{conflict.time}</div>
                    <p className="text-xs text-error/70">Please adjust the time and try again.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm rounded-lg font-medium text-foreground bg-surfaceHover hover:bg-surfaceHover/80 transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !hasChanged} 
              className="px-5 py-2 text-sm rounded-lg font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50 relative min-w-[140px]"
            >
              {loading ? "Checking availability..." : "Check new time"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
