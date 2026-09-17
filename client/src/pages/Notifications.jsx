import { useEffect, useState } from "react";
import { Bell, RefreshCw, Send, CheckCircle2, MessageSquare, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";

export default function Notifications() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    api.get("/notifications/outbox")
      .then((res) => {
        // The endpoint returns pending messages, we'll sort them newest first.
        const sorted = res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMessages(sorted);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  const getIconForType = (type) => {
    switch(type) {
      case 'BOOKING_CONFIRMATION': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'REMINDER_MORNING': return <MessageSquare className="w-5 h-5 text-brand-500" />;
      case 'NO_SHOW_ALERT': return <AlertTriangle className="w-5 h-5 text-error" />;
      default: return <Bell className="w-5 h-5 text-muted" />;
    }
  };

  const getColorForType = (type) => {
    switch(type) {
      case 'BOOKING_CONFIRMATION': return "bg-success-bg/30 border-success/20";
      case 'REMINDER_MORNING': return "bg-brand-500/10 border-brand-500/20";
      case 'NO_SHOW_ALERT': return "bg-error-bg/30 border-error/20";
      default: return "bg-surfaceHover border-border";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outbox</h1>
          <p className="text-muted mt-1 text-sm">System-generated automated messages.</p>
        </div>
        <button 
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="p-2 rounded-lg bg-surface border border-border text-muted hover:text-foreground hover:bg-surfaceHover transition-colors disabled:opacity-50"
          title="Refresh outbox"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 h-24 animate-pulse flex gap-4">
              <div className="w-10 h-10 bg-surfaceHover rounded-full shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-surfaceHover rounded w-1/4" />
                <div className="h-3 bg-surfaceHover rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-16 flex flex-col items-center justify-center text-center mt-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-ping" />
            <div className="relative w-16 h-16 bg-surfaceHover border border-border rounded-full flex items-center justify-center z-10">
              <Send className="w-8 h-8 text-muted" />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-foreground">Outbox is clear</h3>
          <p className="text-muted mt-2 max-w-sm text-sm">
            No pending automated messages. When appointments are booked or background jobs run, generated messages will appear here.
          </p>
          <button 
            onClick={() => load(true)}
            className="mt-6 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors"
          >
            Check again
          </button>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[31px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-background bg-surfaceHover shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                  {getIconForType(m.type)}
                </div>
                
                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-sm bg-surface hover:-translate-y-1 transition-transform cursor-default flex flex-col gap-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getColorForType(m.type)}`}>
                      {m.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono text-muted">{format(new Date(m.createdAt), "hh:mm a")}</span>
                  </div>
                  
                  <p className="text-sm text-foreground leading-relaxed">
                    {m.payload?.message || "Automated message generated."}
                  </p>
                  
                  <div className="text-xs text-muted mt-1 pt-3 border-t border-border/50">
                    To: {m.payload?.patientName || "Patient"} • Status: <span className="text-yellow-500 font-medium">Pending Delivery</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
