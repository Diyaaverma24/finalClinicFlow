import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, Stethoscope, Bell, Activity, Settings, User } from "lucide-react";
import { motion } from "framer-motion";

const MAIN_NAV = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Doctors", href: "/doctors", icon: Stethoscope },
];

const TOOLS_NAV = [
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Activity", href: "/activity", icon: Activity },
];

export default function Sidebar() {
  const location = useLocation();

  const renderNav = (items) => (
    <div className="space-y-1 mt-2">
      {items.map((item) => {
        const isActive = location.pathname.startsWith(item.href);
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`group relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive ? "text-foreground" : "text-muted hover:text-foreground hover:bg-surfaceHover"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r-full"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className={`w-4 h-4 ${isActive ? "text-brand-500" : "text-muted group-hover:text-foreground"}`} />
            {item.name}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-background flex flex-col hidden md:flex h-screen sticky top-0">
      <div className="px-6 py-5">
        <Link to="/" className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center">
            <span className="text-white text-xs">C</span>
          </div>
          ClinicFlow
        </Link>
      </div>

      <div className="flex-1 px-3 overflow-y-auto pt-4 space-y-8">
        <div>
          <div className="px-3 text-xs font-semibold text-muted tracking-wider">OPERATIONS</div>
          {renderNav(MAIN_NAV)}
        </div>

        <div>
          <div className="px-3 text-xs font-semibold text-muted tracking-wider">TOOLS</div>
          {renderNav(TOOLS_NAV)}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="space-y-1">
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted hover:text-foreground hover:bg-surfaceHover">
            <Settings className="w-4 h-4" /> Settings
          </Link>
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted hover:text-foreground hover:bg-surfaceHover">
            <User className="w-4 h-4" /> Profile
          </Link>
        </div>
      </div>
    </aside>
  );
}
