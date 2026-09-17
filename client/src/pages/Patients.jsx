import { useEffect, useState } from "react";
import { Search, Plus, UserCircle, Phone, Mail, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../components/ui/Toast.jsx";
import api from "../services/api.js";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // New Patient state
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creating, setCreating] = useState(false);

  const { addToast } = useToast();

  function load() {
    setLoading(true);
    api.get("/patients", { params: { search: search || undefined } })
      .then((res) => setPatients(res.data.data))
      .catch(() => addToast("Failed to load patients", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/patients", { name: newName, email: newEmail, phone: newPhone });
      addToast("Patient profile created", "success");
      setShowNewPatient(false);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      load();
    } catch (err) {
      addToast(err.response?.data?.error?.message || "Could not create patient", "error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Directory</h1>
          <p className="text-muted mt-1 text-sm">Manage patient records and information.</p>
        </div>
        <button 
          onClick={() => setShowNewPatient(true)}
          className="bg-foreground text-background font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-muted transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New patient
        </button>
      </div>

      {/* Search */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="relative w-full max-w-md group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by patient name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 h-32 animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 bg-surfaceHover rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surfaceHover rounded w-2/3" />
                <div className="h-3 bg-surfaceHover rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-surfaceHover rounded-full flex items-center justify-center mb-4">
            <UserCircle className="w-8 h-8 text-muted" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">No patients found</h3>
          <p className="text-muted mt-1 max-w-sm">We couldn't find any patients matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-surface border border-border rounded-xl p-5 hover:border-brand-500/30 hover:shadow-glow transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-brand-500 transition-colors">{p.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted mt-1.5 truncate">
                    <Mail className="w-3 h-3" /> {p.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted mt-1 truncate">
                    <Phone className="w-3 h-3" /> {p.phone}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-xs">
                <span className="text-muted flex items-center gap-1"><FileText className="w-3 h-3"/> Medical Record</span>
                <span className="text-brand-500 font-medium">View details &rarr;</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Patient Modal */}
      <AnimatePresence>
        {showNewPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewPatient(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-surface overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-surfaceHover/50">
                <h2 className="text-lg font-semibold">New Patient Profile</h2>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted">Full Name</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted">Email Address</label>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted">Phone Number</label>
                  <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={() => setShowNewPatient(false)} className="px-4 py-2 text-sm rounded-lg font-medium text-foreground bg-surfaceHover hover:bg-surfaceHover/80">Cancel</button>
                  <button type="submit" disabled={creating} className="px-4 py-2 text-sm rounded-lg font-medium bg-foreground text-background hover:bg-muted disabled:opacity-50">
                    {creating ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
