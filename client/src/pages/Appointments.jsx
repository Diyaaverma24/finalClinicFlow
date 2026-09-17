import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Pagination from "../components/Pagination.jsx";
import SearchBar from "../components/SearchBar.jsx";
import api from "../services/api.js";

const STATUS_STYLE = {
  SCHEDULED: "text-brand-700 bg-brand-50",
  CANCELLED: "text-slate-500 bg-slate-100",
  COMPLETED: "text-green-700 bg-green-50",
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("startTime");
  const [order, setOrder] = useState("asc");
  const [search, setSearch] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  function load() {
    api
      .get("/appointments", { params: { page, limit: 10, sortBy, order, patientName: search || undefined } })
      .then((res) => {
        setAppointments(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      });
  }

  useEffect(load, [page, sortBy, order, search]);

  async function confirmCancel() {
    setCancelError(null);
    try {
      await api.patch(`/appointments/${cancelTarget.id}/cancel`);
      setCancelTarget(null);
      load();
    } catch (err) {
      setCancelError(err.response?.data?.error?.message || "Could not cancel appointment.");
    }
  }

  const hoursUntil = cancelTarget ? (new Date(cancelTarget.startTime) - new Date()) / 36e5 : 0;
  const willBeLate = hoursUntil < 24;

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        <h1 className="text-xl font-semibold">Appointments</h1>

        <div className="flex gap-3 items-center">
          <div className="flex-1"><SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} /></div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="startTime">Appointment time</option>
            <option value="createdAt">Created date</option>
            <option value="status">Status</option>
          </select>
          <select value={order} onChange={(e) => setOrder(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {appointments.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium">{a.patient?.name} <span className="text-slate-400">with</span> {a.doctor?.name}</div>
                <div className="text-xs text-slate-500">{new Date(a.startTime).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full uppercase ${STATUS_STYLE[a.status]}`}>{a.status}</span>
                {a.status === "SCHEDULED" && (
                  <button onClick={() => setCancelTarget(a)} className="text-xs text-red-600 hover:underline">Cancel</button>
                )}
              </div>
            </div>
          ))}
          {appointments.length === 0 && <div className="p-6 text-center text-sm text-slate-500">No appointments found.</div>}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </main>

      {cancelTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold">Cancel Appointment?</h2>
            <div className="text-sm text-slate-600">
              <div>{cancelTarget.patient?.name}</div>
              <div>{cancelTarget.doctor?.name}</div>
              <div>{new Date(cancelTarget.startTime).toLocaleString()}</div>
            </div>
            <div className={`rounded-md p-3 text-sm ${willBeLate ? "bg-amber-50 text-amber-800" : "bg-green-50 text-green-800"}`}>
              {willBeLate ? "Late cancellation — a fee applies." : "Free cancellation."}
              <div className="font-semibold mt-1">Fee: ₹{willBeLate ? 200 : 0}</div>
            </div>
            {cancelError && <div className="bg-red-50 text-red-700 text-sm p-2 rounded-md">{cancelError}</div>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setCancelTarget(null)} className="px-4 py-2 text-sm rounded-md border border-slate-300">Keep Appointment</button>
              <button onClick={confirmCancel} className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700">Cancel Appointment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
