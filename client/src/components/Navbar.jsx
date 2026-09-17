import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthed = !!localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
      <Link to="/" className="font-bold text-lg text-brand-700">ClinicFlow</Link>
      <div className="flex gap-4 items-center text-sm">
        {isAuthed ? (
          <>
            <Link to="/dashboard" className="hover:text-brand-600">Dashboard</Link>
            <Link to="/appointments" className="hover:text-brand-600">Appointments</Link>
            <button onClick={logout} className="text-slate-500 hover:text-red-600">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-brand-600">Login</Link>
            <Link to="/register" className="bg-brand-600 text-white px-3 py-1.5 rounded-md hover:bg-brand-700">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
