import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Schedule from "../components/Schedule.jsx";
import SearchBar from "../components/SearchBar.jsx";
import BookingModal from "../components/BookingModal.jsx";
import api from "../services/api.js";

export default function Dashboard() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    api.get("/doctors").then((res) => {
      setDoctors(res.data.data);
      if (res.data.data.length) setSelectedDoctorId(res.data.data[0].id);
    });
    api.get("/patients").then((res) => setPatients(res.data.data));
  }, []);

  useEffect(() => {
    if (!selectedDoctorId) return;
    api.get(`/doctors/${selectedDoctorId}/appointments`, { params: { date } }).then((res) => setAppointments(res.data.data));
  }, [selectedDoctorId, date]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      api.get("/appointments", { params: { patientName: search, limit: 5 } }).then((res) => setSearchResults(res.data.data));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  function refreshSchedule() {
    api.get(`/doctors/${selectedDoctorId}/appointments`, { params: { date } }).then((res) => setAppointments(res.data.data));
  }

  function handleBooked(appointment) {
    setShowBooking(false);
    setConfirmation(appointment);
    if (appointment.doctorId === selectedDoctorId) refreshSchedule();
    setTimeout(() => setConfirmation(null), 5000);
  }

  const scheduledCount = appointments.filter((a) => a.status === "SCHEDULED").length;
  const cancelledCount = appointments.filter((a) => a.status === "CANCELLED").length;

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Today's Appointments</h1>
          <button onClick={() => setShowBooking(true)} className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm hover:bg-brand-700">+ Book</button>
        </div>

        {confirmation && (
          <div className="bg-green-50 border border-green-300 text-green-800 rounded-md p-4 text-sm">
            ✓ Appointment confirmed — {confirmation.doctor?.name}, {new Date(confirmation.startTime).toLocaleString()}. No scheduling conflicts detected.
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white border border-slate-200 rounded-lg py-4">
            <div className="text-2xl font-bold text-brand-700">{scheduledCount}</div>
            <div className="text-xs text-slate-500">Scheduled</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg py-4">
            <div className="text-2xl font-bold text-slate-400">{cancelledCount}</div>
            <div className="text-xs text-slate-500">Cancelled</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg py-4">
            <div className="text-2xl font-bold">{doctors.length}</div>
            <div className="text-xs text-slate-500">Doctors</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex gap-3 mb-4">
            <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)} className="border rounded-md px-3 py-2 text-sm flex-1">
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
              ))}
            </select>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
          </div>
          <Schedule appointments={appointments} />
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <SearchBar value={search} onChange={setSearch} />
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              {searchResults.map((a) => (
                <div key={a.id} className="text-sm border-b border-slate-100 pb-2">
                  <span className="font-medium">{a.patient?.name}</span> — {a.doctor?.name} — {new Date(a.startTime).toLocaleString()} — <span className="uppercase text-xs">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showBooking && (
        <BookingModal doctors={doctors} patients={patients} onClose={() => setShowBooking(false)} onBooked={handleBooked} />
      )}
    </div>
  );
}
