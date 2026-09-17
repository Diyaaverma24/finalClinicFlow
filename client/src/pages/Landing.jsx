import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const FEATURES = [
  { title: "Conflict Detection", desc: "Doctors can never be double-booked — every slot is checked against existing appointments before it's confirmed." },
  { title: "Smart Cancellation", desc: "Automatic free vs. late cancellation fee calculation, decided by the backend so it can't be tampered with." },
  { title: "Daily Doctor Schedule", desc: "See any doctor's full day at a glance — booked, available, and cancelled slots." },
  { title: "Fast Patient Lookup", desc: "Find a patient and their upcoming or past appointments in seconds." },
];

const FUTURE = [
  { title: "Automated reminders", desc: "SMS/email reminders sent before an appointment." },
  { title: "Doctor availability management", desc: "Doctors define working hours, breaks, and leave." },
  { title: "Analytics dashboard", desc: "Appointments/day, cancellation rate, and doctor utilization." },
];

export default function Landing() {
  return (
    <div>
      <Navbar />
      <header className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight">No more double-booked doctors.</h1>
        <p className="mt-4 text-lg text-slate-600">A simple front-desk workspace for conflict-free clinic scheduling.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/register" className="bg-brand-600 text-white px-5 py-2.5 rounded-md hover:bg-brand-700">Get Started</Link>
          <Link to="/login" className="border border-slate-300 px-5 py-2.5 rounded-md hover:bg-slate-100">Login</Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-10 grid sm:grid-cols-2 gap-6">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="font-semibold text-brand-700">{f.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-xl font-semibold mb-4">What's next</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {FUTURE.map((f) => (
            <div key={f.title} className="border border-dashed border-slate-300 rounded-lg p-5">
              <h3 className="font-medium">{f.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-slate-400 py-8">Built for clinic front-desk staff.</footer>
    </div>
  );
}
