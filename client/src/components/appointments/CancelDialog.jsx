import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";

export default function CancelDialog({ appointment, onClose, onSuccess }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  async function handleCancel() {
    setError(null);
    setLoading(true);
    try {
      await api.patch(`/appointments/${appointment.id}/cancel`);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Could not cancel appointment.");
      setLoading(false);
    }
  }

  // Calculate fee (just for display in UI, backend is authoritative during actual call)
  const hoursUntil = (new Date(appointment.startTime) - new Date()) / 36e5;
  const isLate = hoursUntil < 24 && hoursUntil > 0;
  const fee = isLate ? 200 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      
      {/* Dialog */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm bg-surface border border-border rounded-2xl shadow-surface overflow-hidden"
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-error-bg flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-error" />
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-2">Cancel appointment?</h2>
          
          <div className="bg-background border border-border rounded-xl p-4 mb-4 space-y-1">
            <div className="font-medium text-foreground">{appointment.patient?.name}</div>
            <div className="text-sm text-muted">Dr. {appointment.doctor?.name}</div>
            <div className="text-sm text-muted">{format(new Date(appointment.startTime), "MMM d, yyyy · hh:mm a")}</div>
          </div>

          <div className={`p-4 rounded-xl border ${isLate ? "bg-warning-bg/10 border-yellow-500/20" : "bg-success-bg/10 border-success/20"}`}>
            <div className={`font-medium ${isLate ? "text-yellow-600" : "text-success"}`}>
              {isLate ? "Late cancellation fee" : "Cancelling this appointment is free."}
            </div>
            {isLate && (
              <div className="text-2xl font-bold text-yellow-600 mt-1">₹{fee}</div>
            )}
            <p className="text-xs text-muted mt-2">
              {isLate ? "Cancellations within 24 hours incur a fee." : "No fee applies for early cancellation."}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-error-bg text-error text-sm p-3 rounded-lg border border-error/20 mt-4">
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 bg-surfaceHover/50 border-t border-border flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm rounded-lg font-medium text-foreground hover:bg-surface transition-colors"
          >
            Keep appointment
          </button>
          <button 
            type="button" 
            onClick={handleCancel}
            disabled={loading} 
            className="px-4 py-2 text-sm rounded-lg font-medium bg-error text-white hover:bg-error/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Cancelling..." : "Cancel appointment"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
