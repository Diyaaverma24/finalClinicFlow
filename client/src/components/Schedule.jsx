const STATUS_STYLE = {
  SCHEDULED: "bg-brand-50 border-brand-500 text-brand-700",
  CANCELLED: "bg-slate-100 border-slate-300 text-slate-400 line-through",
  COMPLETED: "bg-green-50 border-green-500 text-green-700",
};

export default function Schedule({ appointments }) {
  if (!appointments.length) {
    return <p className="text-sm text-slate-500 py-6 text-center">No appointments for this doctor on this day.</p>;
  }
  return (
    <div className="space-y-2">
      {appointments.map((a) => {
        const start = new Date(a.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const end = new Date(a.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return (
          <div key={a.id} className={`border-l-4 rounded-md px-4 py-2 flex justify-between items-center ${STATUS_STYLE[a.status]}`}>
            <div>
              <div className="text-sm font-medium">{a.patient?.name}</div>
              <div className="text-xs opacity-80">{start} – {end}</div>
            </div>
            <span className="text-xs uppercase tracking-wide">{a.status}</span>
          </div>
        );
      })}
    </div>
  );
}
