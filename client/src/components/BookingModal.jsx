import { useState } from "react";
import api from "../services/api.js";

const DURATIONS = [15, 30, 45, 60];

export default function BookingModal({ doctors, patients, onClose, onBooked }) {
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || "");
  const [patientId, setPatientId] = useState(patients[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
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
        setError("⚠️ Doctor unavailable — they already have an appointment during this time. Please choose another slot.");
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
        <h2 className="text-lg font-semibold">Book Appointment</h2>

        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md">{error}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">Doctor</label>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Patient</label>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
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
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}
