import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Appointments from "./pages/Appointments.jsx";
import Patients from "./pages/Patients.jsx";
import Doctors from "./pages/Doctors.jsx";
import Notifications from "./pages/Notifications.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";

// Stubs for future pages (Activity, Settings, Profile)
function Placeholder({ title }) {
  return <div className="p-8 border border-border border-dashed rounded-lg flex items-center justify-center text-muted">{title} page coming soon...</div>;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/activity" element={<Placeholder title="Activity" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
          <Route path="/profile" element={<Placeholder title="Profile" />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
