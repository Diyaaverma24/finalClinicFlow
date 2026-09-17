import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, Filter, SlidersHorizontal, Plus, MoreHorizontal } from "lucide-react";
import Pagination from "../components/Pagination.jsx";
import SearchBar from "../components/SearchBar.jsx";
import RescheduleModal from "../components/appointments/RescheduleModal.jsx";
import BookingModal from "../components/appointments/BookingModal.jsx";
import CancelDialog from "../components/appointments/CancelDialog.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import api from "../services/api.js";

const STATUS_STYLE = {
  SCHEDULED: "bg-brand-500/10 text-brand-500 border-brand-500/20",
  COMPLETED: "bg-success-bg text-success border-success/20",
  CANCELLED: "bg-surfaceHover text-muted border-border",
  NO_SHOW: "bg-error-bg text-error border-error/20",
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("startTime");
  const [order, setOrder] = useState("asc");
  const [search, setSearch] = useState("");
  
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  function load() {
    setLoading(true);
    api
      .get("/appointments", { params: { page, limit: 10, sortBy, order, patientName: search || undefined } })
      .then((res) => {
        setAppointments(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, sortBy, order, search]);

  async function completeAppointment(id) {
    // We can't use window.confirm easily with a pretty UI without building a new modal for it, 
    // so we'll just keep window.confirm but use toast for success/error
    if (!window.confirm("Mark this appointment as completed?")) return;
    try {
      await api.patch(`/appointments/${id}/complete`);
      addToast("Appointment completed", "success");
      load();
    } catch (err) {
      addToast(err.response?.data?.error?.message || "Could not complete appointment.", "error");
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted mt-1 text-sm">Manage the clinic schedule.</p>
        </div>
        <button 
          onClick={() => setShowBooking(true)}
          className="bg-foreground text-background font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-muted transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New appointment
        </button>
      </div>

      {/* Controls */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search patient name..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-auto">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full appearance-none bg-background border border-border rounded-lg pl-3 pr-8 py-2 text-sm outline-none focus:border-brand-500">
              <option value="startTime">Start time</option>
              <option value="createdAt">Date created</option>
              <option value="status">Status</option>
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>
          <div className="relative flex-1 md:w-auto">
            <select value={order} onChange={(e) => setOrder(e.target.value)} className="w-full appearance-none bg-background border border-border rounded-lg pl-3 pr-8 py-2 text-sm outline-none focus:border-brand-500">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surfaceHover border-b border-border">
                <th className="px-6 py-3 text-xs font-semibold text-muted tracking-wider uppercase">Patient</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted tracking-wider uppercase">Doctor</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted tracking-wider uppercase">Date & Time</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted tracking-wider uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-surfaceHover rounded w-1/4 mx-auto" />
                      <div className="h-4 bg-surfaceHover rounded w-1/3 mx-auto" />
                    </div>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-surfaceHover rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-5 h-5 text-muted" />
                    </div>
                    <div className="font-medium text-foreground">No appointments found</div>
                    <div className="text-sm text-muted mt-1">Try adjusting your filters or search term.</div>
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id} className="group hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{a.patient?.name}</div>
                      <div className="text-xs text-muted">{a.patient?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">Dr. {a.doctor?.name}</div>
                      <div className="text-xs text-muted">{a.doctor?.specialization}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">{format(new Date(a.startTime), "MMM d, yyyy")}</div>
                      <div className="text-xs font-mono text-muted">{format(new Date(a.startTime), "hh:mm a")} — {a.durationInMinutes}m</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${STATUS_STYLE[a.status] || STATUS_STYLE.SCHEDULED}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {a.status === "SCHEDULED" ? (
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => completeAppointment(a.id)} className="text-xs font-medium text-success hover:text-success/80">Complete</button>
                          <button onClick={() => setRescheduleTarget(a)} className="text-xs font-medium text-brand-500 hover:text-brand-400">Reschedule</button>
                          <button onClick={() => setCancelTarget(a)} className="text-xs font-medium text-error hover:text-error/80">Cancel</button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">No actions</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Wrapper */}
        <div className="p-4 border-t border-border bg-surfaceHover/30">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {cancelTarget && (
        <CancelDialog 
          appointment={cancelTarget} 
          onClose={() => setCancelTarget(null)} 
          onSuccess={() => {
            setCancelTarget(null);
            load();
          }}
        />
      )}

      {rescheduleTarget && (
        <RescheduleModal
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onRescheduled={() => {
            setRescheduleTarget(null);
            load();
          }}
        />
      )}

      {showBooking && (
        <BookingModal
          onClose={() => setShowBooking(false)}
          onBooked={() => {
            setShowBooking(false);
            load();
          }}
        />
      )}
    </div>
  );
}
