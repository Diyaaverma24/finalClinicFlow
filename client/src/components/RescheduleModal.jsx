import { useState } from "react";
import api from "../services/api.js";

const DURATIONS = [15, 30, 45, 60];

export default function RescheduleModal({ appointment, onClose, onRescheduled }) {
  const [date, setDate] = useState(new Date(appointment.startTime).toISOString().slice(0, 10));
  const [time, setTime] = useState(
    new Date(appointment.startTime).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })
  );
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const startTime = new Date(`${date}T${time}:00`).toISOString();
      const res = await api.patch(`/appointments/${appointment.id}/reschedule`, {
        startTime,
        duration: Number(duration),
      });
      onRescheduled(res.data.data);
    } catch (err) {
      const apiError = err.response?.data?.error;
      if (apiError?.code === "APPOINTMENT_CONFLICT") {
        setError(`⚠️ ${appointment.doctor?.name} already has another appointment at this time. Please choose another time.`);
      } else {
        setError(apiError?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">Reschedule Appointment</h2>

        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md">{error}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">Doctor</label>
          <input type="text" value={appointment.doctor?.name || ""} disabled className="w-full border rounded-md px-3 py-2 text-sm bg-slate-50 text-slate-500" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Patient</label>
          <input type="text" value={appointment.patient?.name || ""} disabled className="w-full border rounded-md px-3 py-2 text-sm bg-slate-50 text-slate-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">New Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Duration</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
            {DURATIONS.map((d) => (
              <option key={d} value={d}>{d} minutes</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md border border-slate-300">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50">
            {loading ? "Rescheduling..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
}
