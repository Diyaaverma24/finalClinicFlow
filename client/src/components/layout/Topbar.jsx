import { Search, Bell } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Topbar() {
  const location = useLocation();
  
  // Basic title extraction based on route
  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return "Overview";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      
      <div className="flex-1 flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex-1 flex justify-center max-w-md mx-4">
        <div className="relative w-full group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search patients, appointments..." 
            className="w-full bg-surface border border-border rounded-full pl-9 pr-12 py-1.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-foreground placeholder:text-muted"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="font-mono text-[10px] bg-background border border-border rounded px-1.5 py-0.5 text-muted shadow-sm">⌘</kbd>
            <kbd className="font-mono text-[10px] bg-background border border-border rounded px-1.5 py-0.5 text-muted shadow-sm">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-end gap-4">
        <div className="text-sm font-medium text-muted hidden md:block">
          {today}
        </div>
        <button className="relative p-2 text-muted hover:text-foreground transition-colors rounded-full hover:bg-surfaceHover">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full border border-background"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden cursor-pointer">
          <span className="text-xs font-semibold text-foreground">DV</span>
        </div>
      </div>

    </header>
  );
}
